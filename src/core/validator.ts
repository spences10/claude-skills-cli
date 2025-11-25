import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
	StructuredValidation,
	ValidationResult,
	ValidationStats,
} from '../types.js';

// Import validators
import { analyze_alignment } from '../validators/alignment-validator.js';
import { validate_content } from '../validators/content-validator.js';
import {
	analyze_trigger_phrase,
	analyze_user_phrasing,
	validate_description_content,
} from '../validators/description-validator.js';
import {
	validate_assets,
	validate_directory,
	validate_path_formats,
	validate_scripts,
} from '../validators/file-structure-validator.js';
import {
	extract_frontmatter,
	validate_frontmatter_structure,
	validate_hard_limits,
	validate_name_format,
} from '../validators/frontmatter-validator.js';
import { validate_references } from '../validators/references-validator.js';

import type { ValidationMode } from '../types.js';

export interface ValidatorOptions {
	mode?: ValidationMode;
}

export class SkillValidator {
	private skill_path: string;
	private options: ValidatorOptions;
	private errors: string[] = [];
	private warnings: string[] = [];
	private stats: ValidationStats = {
		word_count: 0,
		estimated_tokens: 0,
		line_count: 0,
		description_length: 0,
		description_tokens: 0,
		code_blocks: 0,
		sections: 0,
		long_paragraphs: 0,
	};

	// Structured validation data
	private structured_validation: StructuredValidation = {
		hard_limits: {
			name: { length: 0, limit: 64, valid: true, error: null },
			description: {
				length: 0,
				limit: 1024,
				valid: true,
				error: null,
			},
		},
		name_format: {
			name: '',
			format_valid: true,
			directory_name: '',
			matches_directory: true,
			errors: [],
		},
		yaml_validation: {
			valid: true,
			has_frontmatter: false,
			parse_error: null,
			missing_fields: [],
		},
		path_format: {
			invalid_paths: [],
		},
		triggering: {
			trigger_phrase: {
				has_explicit_trigger: false,
				trigger_phrase: null,
				trigger_type: 'missing',
			},
			user_phrasing: {
				style_checks: {
					is_third_person: true,
					uses_gerund_form: true,
					is_action_oriented: true,
				},
				issues: [],
			},
			keywords: {
				description_keywords: [],
				content_keywords: [],
				overlap: [],
				description_only: [],
				content_only: [],
			},
			alignment: {
				severity: 'good',
				description_focus: [],
				content_focus: [],
				matches: [],
				mismatches: [],
				explanation: '',
			},
		},
	};

	constructor(skill_path: string, options: ValidatorOptions = {}) {
		this.skill_path = skill_path;
		this.options = options;
	}

	private error(msg: string): void {
		this.errors.push(`❌ ${msg}`);
	}

	private warning(msg: string): void {
		this.warnings.push(`⚠️  ${msg}`);
	}

	private validate_skill_md(): boolean {
		const skill_md_path = join(this.skill_path, 'SKILL.md');

		if (!existsSync(skill_md_path)) {
			this.error('SKILL.md file not found');
			return false;
		}

		const content = readFileSync(skill_md_path, 'utf-8');

		// Validate path formats (no Windows backslashes)
		const path_format_result = validate_path_formats(content);
		this.structured_validation.path_format =
			path_format_result.validation;
		path_format_result.errors.forEach((err) =>
			this.error(err.message),
		);

		// Validate frontmatter structure
		const frontmatter_validation =
			validate_frontmatter_structure(content);
		this.structured_validation.yaml_validation =
			frontmatter_validation;

		if (!frontmatter_validation.valid) {
			if (frontmatter_validation.parse_error) {
				this.error(frontmatter_validation.parse_error);
			}
			frontmatter_validation.missing_fields.forEach((field) => {
				this.error(`SKILL.md frontmatter missing '${field}' field`);
			});
			return false;
		}

		// Extract frontmatter data
		const { name, description, body, description_is_multiline } =
			extract_frontmatter(content);

		if (!name || !description) {
			this.error(
				'Failed to extract name or description from frontmatter',
			);
			return false;
		}

		// Warn if description spans multiple lines
		if (description_is_multiline) {
			this.warning(
				`Multi-line description detected. Claude Code cannot recognize skills with multi-line descriptions.\n` +
					`  → Run 'claude-skills-cli doctor ${this.skill_path}' to fix automatically`,
			);
		}

		// Get directory name (normalize path to handle trailing slashes)
		const normalized_path = this.skill_path.replace(/\/+$/, '');
		const dir_name = normalized_path.split('/').pop() || '';

		// Validate name format
		const name_validation = validate_name_format(name, dir_name);
		this.structured_validation.name_format = name_validation;
		name_validation.errors.forEach((err) => this.error(err));

		// Validate hard limits
		const hard_limits = validate_hard_limits(name, description);
		this.structured_validation.hard_limits = hard_limits;

		if (!hard_limits.name.valid && hard_limits.name.error) {
			this.error(hard_limits.name.error);
		}

		if (
			!hard_limits.description.valid &&
			hard_limits.description.error
		) {
			this.error(hard_limits.description.error);
		}

		// Validate description content
		const desc_validation = validate_description_content(description);
		this.stats.description_length =
			desc_validation.stats.description_length;
		this.stats.description_tokens =
			desc_validation.stats.description_tokens;
		desc_validation.errors.forEach((err) => this.error(err.message));
		desc_validation.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		// Analyze trigger phrase
		const trigger_analysis = analyze_trigger_phrase(description);
		this.structured_validation.triggering!.trigger_phrase =
			trigger_analysis;

		if (!trigger_analysis.has_explicit_trigger) {
			this.warning(
				`Description missing explicit trigger phrase ('Use when...', 'Use for...', 'Use to...')\n` +
					`  → Help Claude know when to activate this skill`,
			);
		}

		// Analyze user phrasing
		const {
			analysis: phrasing_analysis,
			warnings: phrasing_warnings,
		} = analyze_user_phrasing(description);
		this.structured_validation.triggering!.user_phrasing =
			phrasing_analysis;
		phrasing_warnings.forEach((warn) => this.warning(warn.message));

		// Analyze alignment
		const alignment_result = analyze_alignment(description, body);
		this.structured_validation.triggering!.keywords =
			alignment_result.keywords;
		this.structured_validation.triggering!.alignment =
			alignment_result.alignment;
		alignment_result.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		// Validate content (progressive disclosure)
		const content_validation = validate_content(body, {
			mode: this.options.mode,
		});
		this.stats.word_count = content_validation.stats.word_count;
		this.stats.estimated_tokens =
			content_validation.stats.estimated_tokens;
		this.stats.line_count = content_validation.stats.line_count;
		this.stats.code_blocks = content_validation.stats.code_blocks;
		this.stats.sections = content_validation.stats.sections;
		this.stats.long_paragraphs =
			content_validation.stats.long_paragraphs;
		content_validation.errors.forEach((err) =>
			this.error(err.message),
		);
		content_validation.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		return true;
	}

	public validate_all(): ValidationResult {
		// Validate directory
		const dir_result = validate_directory(this.skill_path);
		if (!dir_result.valid) {
			dir_result.errors.forEach((err) => this.error(err.message));
			return {
				errors: this.errors,
				warnings: this.warnings,
				is_valid: false,
				stats: this.stats,
				validation: this.structured_validation,
			};
		}

		// Validate SKILL.md
		this.validate_skill_md();

		// Validate references
		const refs_result = validate_references(this.skill_path);
		refs_result.errors.forEach((err) => this.error(err.message));
		refs_result.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		// Validate scripts
		const scripts_result = validate_scripts(this.skill_path);
		scripts_result.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		// Validate assets
		const assets_result = validate_assets(this.skill_path);
		assets_result.warnings.forEach((warn) =>
			this.warning(warn.message),
		);

		// Populate progressive disclosure structured validation
		// Use mode-specific limits: strict (50), lenient (150), loose (500)
		const line_limit =
			this.options.mode === 'loose'
				? 500
				: this.options.mode === 'lenient'
					? 150
					: 50;
		const word_limit =
			this.options.mode === 'loose'
				? 5000
				: this.options.mode === 'lenient'
					? 2000
					: 1000;
		this.structured_validation.progressive_disclosure = {
			skill_md_size: {
				lines: this.stats.line_count,
				words: this.stats.word_count,
				tokens: this.stats.estimated_tokens,
				exceeds_line_limit: this.stats.line_count > line_limit,
				exceeds_word_limit: this.stats.word_count > word_limit,
			},
			references: refs_result.validation,
		};

		return {
			errors: this.errors,
			warnings: this.warnings,
			is_valid: this.errors.length === 0,
			stats: this.stats,
			validation: this.structured_validation,
		};
	}

	public get_errors(): string[] {
		return this.errors;
	}

	public get_warnings(): string[] {
		return this.warnings;
	}
}
