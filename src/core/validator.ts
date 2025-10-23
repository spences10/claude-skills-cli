import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
} from 'node:fs';
import { join } from 'node:path';
import type {
	StructuredValidation,
	ValidationResult,
	ValidationStats,
} from '../types.js';

export class SkillValidator {
	private skill_path: string;
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

	// Progressive disclosure limits (enforced as hard limits)
	private readonly MAX_WORDS = 1000; // Hard limit (was recommended)
	private readonly RECOMMENDED_WORDS = 500; // Warning threshold

	// Temporary storage for references validation
	private references_validation: {
		files_found: string[];
		files_referenced: string[];
		missing_files: string[];
		orphaned_files: string[];
		nesting: Array<{
			file: string;
			references: string[];
			depth: number;
			warning: string | null;
		}>;
		max_nesting_depth: number;
	} = {
		files_found: [],
		files_referenced: [],
		missing_files: [],
		orphaned_files: [],
		nesting: [],
		max_nesting_depth: 0,
	};

	constructor(skill_path: string) {
		this.skill_path = skill_path;
	}

	private error(msg: string): void {
		this.errors.push(`❌ ${msg}`);
	}

	private warning(msg: string): void {
		this.warnings.push(`⚠️  ${msg}`);
	}

	/**
	 * Extract body content from SKILL.md (excluding YAML frontmatter)
	 */
	private extract_body(content: string): string {
		const parts = content.split('---\n');
		return parts.length >= 3
			? parts.slice(2).join('---\n').trim()
			: content;
	}

	/**
	 * Count words in text
	 */
	private count_words(text: string): number {
		return text
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0).length;
	}

	/**
	 * Estimate tokens (rough approximation: 1 word ≈ 1.3 tokens for English)
	 */
	private estimate_tokens(word_count: number): number {
		return Math.round(word_count * 1.3);
	}

	/**
	 * Estimate tokens for a string by counting words and applying ratio
	 */
	private estimate_string_tokens(text: string): number {
		const word_count = this.count_words(text);
		return this.estimate_tokens(word_count);
	}

	/**
	 * Validate Level 1 (Description in frontmatter) for progressive disclosure
	 */
	private validate_description(description: string): void {
		const desc_length = description.length;
		const desc_tokens = this.estimate_string_tokens(description);

		// Store stats
		this.stats.description_length = desc_length;
		this.stats.description_tokens = desc_tokens;

		// Enforced limit: 300 chars (prevents Claude from bloating descriptions)
		// Anthropic allows 1024, but that leads to verbose, inefficient descriptions
		if (desc_length > 300) {
			this.error(
				`Description is ${desc_length} characters (MAX: 300 for efficiency)\n` +
					`  → Keep descriptions concise - quality over quantity`,
			);
		} else if (desc_length > 200) {
			this.warning(
				`Description is ${desc_length} characters (recommended: <200)\n` +
					`  → Estimated ~${desc_tokens} tokens - consider shortening`,
			);
		}

		// Check for trigger keywords
		const lower_desc = description.toLowerCase();
		const has_trigger =
			lower_desc.includes('use when') ||
			lower_desc.includes('use for') ||
			lower_desc.includes('use to');

		if (!has_trigger) {
			this.warning(
				`Description missing trigger keywords ('Use when...', 'Use for...', 'Use to...')\n` +
					`  → Help Claude know when to activate this skill`,
			);
		}

		// Check for list bloat (multiple commas indicating detailed lists)
		// Only warn if BOTH long description AND many commas (allows concise technical lists)
		const comma_count = (description.match(/,/g) || []).length;
		if (desc_length > 150 && comma_count >= 5) {
			this.warning(
				`Description contains long lists (${comma_count} commas, ${desc_length} chars)\n` +
					`  → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)`,
			);
		}
	}

	/**
	 * Remove HTML comments from content (for line counting)
	 */
	private strip_html_comments(text: string): string {
		return text.replace(/<!--[\s\S]*?-->/g, '');
	}

	/**
	 * Analyze content structure and patterns
	 */
	private analyze_content(body: string): void {
		// Count code blocks
		const code_block_matches = body.match(/```[\s\S]*?```/g);
		this.stats.code_blocks = code_block_matches
			? code_block_matches.length
			: 0;

		// Count markdown sections (headings)
		const heading_matches = body.match(/^#{1,6}\s/gm);
		this.stats.sections = heading_matches
			? heading_matches.length
			: 0;

		// Count long paragraphs (>100 words)
		const paragraphs = body.split(/\n\n+/);
		this.stats.long_paragraphs = paragraphs.filter((p) => {
			const words = this.count_words(p);
			return words > 100;
		}).length;
	}

	/**
	 * Extract keywords from text (simplified extraction)
	 */
	private extract_keywords(text: string): string[] {
		const words = text
			.toLowerCase()
			.replace(/[^\w\s-]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 3);

		const unique = [...new Set(words)];
		return unique.filter(
			(w) =>
				![
					'this',
					'that',
					'with',
					'from',
					'have',
					'will',
					'when',
					'what',
					'where',
					'which',
					'their',
					'them',
					'then',
					'than',
					'these',
					'those',
					'there',
				].includes(w),
		);
	}

	/**
	 * Analyze trigger phrase in description
	 */
	private analyze_trigger_phrase(description: string): void {
		const lower = description.toLowerCase();
		const has_trigger =
			lower.includes('use when') ||
			lower.includes('use for') ||
			lower.includes('use to');

		let trigger_phrase: string | null = null;
		let trigger_type: 'specific' | 'generic' | 'missing' = 'missing';

		if (has_trigger) {
			const match = description.match(
				/(use when|use for|use to)[^.!?]*/i,
			);
			if (match) {
				trigger_phrase = match[0].trim();
				trigger_type =
					trigger_phrase.length > 50 ? 'specific' : 'generic';
			}
		}

		// Store in structured validation
		this.structured_validation.triggering!.trigger_phrase = {
			has_explicit_trigger: has_trigger,
			trigger_phrase,
			trigger_type,
		};

		if (!has_trigger) {
			this.warning(
				`Description missing explicit trigger phrase ('Use when...', 'Use for...', 'Use to...')\n` +
					`  → Help Claude know when to activate this skill`,
			);
		}
	}

	/**
	 * Analyze user phrasing style
	 */
	private analyze_user_phrasing(description: string): void {
		const issues: Array<{
			type: 'first_person' | 'passive_voice' | 'vague';
			text: string;
			suggestion: string;
		}> = [];

		// Check for first person
		const is_third_person = !/\b(I can|I will|I help|my|me)\b/i.test(
			description,
		);
		const first_person_patterns = /\b(I can|I will|I help|my|me)\b/i;
		if (first_person_patterns.test(description)) {
			const match = description.match(first_person_patterns);
			if (match) {
				this.warning(
					`Description uses first person: "${match[0]}"\n` +
						`  → Prefer third person for clarity (not required but recommended)`,
				);
			}
		}

		// Check for vague terms
		const vague_patterns =
			/\b(helper|utility|tool|various|several|some)\b/i;
		if (vague_patterns.test(description)) {
			const match = description.match(vague_patterns);
			if (match) {
				this.warning(
					`Description contains vague term: "${match[0]}"\n` +
						`  → Be specific about what the skill does`,
				);
			}
		}

		// Check for gerund form (verbs ending in -ing)
		const uses_gerund = /\b\w+ing\b/i.test(description);

		// Check for action-oriented (starts with action verbs)
		const action_verbs =
			/^(create|build|design|analyze|test|validate|generate|process|manage|execute|handle|provide)/i;
		const is_action_oriented = action_verbs.test(description.trim());

		// Store in structured validation
		this.structured_validation.triggering!.user_phrasing = {
			style_checks: {
				is_third_person,
				uses_gerund_form: uses_gerund,
				is_action_oriented,
			},
			issues,
		};
	}

	/**
	 * Analyze description and content alignment
	 */
	private analyze_alignment(description: string, body: string): void {
		const desc_keywords = this.extract_keywords(description);
		const content_keywords = this.extract_keywords(body);

		const overlap = desc_keywords.filter((k) =>
			content_keywords.includes(k),
		);
		const desc_only = desc_keywords.filter(
			(k) => !content_keywords.includes(k),
		);
		const content_only = content_keywords
			.filter((k) => !desc_keywords.includes(k))
			.slice(0, 20);

		const overlap_ratio =
			desc_keywords.length > 0
				? overlap.length / desc_keywords.length
				: 0;

		let severity: 'good' | 'moderate' | 'critical' = 'good';
		let explanation = 'Description aligns well with content';

		if (overlap_ratio < 0.2 && desc_keywords.length > 5) {
			severity = 'critical';
			explanation = `Very low keyword overlap (${Math.round(overlap_ratio * 100)}%). Description may not match skill content.`;
		} else if (overlap_ratio < 0.3 && desc_keywords.length > 5) {
			severity = 'moderate';
			explanation = `Low keyword overlap (${Math.round(overlap_ratio * 100)}%). Description may not accurately reflect skill content.`;
		}

		// Store in structured validation
		this.structured_validation.triggering!.keywords = {
			description_keywords: desc_keywords,
			content_keywords: content_keywords.slice(0, 30),
			overlap,
			description_only: desc_only,
			content_only,
		};

		this.structured_validation.triggering!.alignment = {
			severity,
			description_focus: desc_keywords.slice(0, 10),
			content_focus: content_keywords.slice(0, 10),
			matches: overlap,
			mismatches: desc_only,
			explanation,
		};

		if (overlap_ratio < 0.3 && desc_keywords.length > 5) {
			this.warning(
				`Low keyword overlap between description and content (${Math.round(overlap_ratio * 100)}%)\n` +
					`  → Description may not accurately reflect skill content`,
			);
		}
	}

	/**
	 * Validate progressive disclosure (word count, token budget, and line count)
	 */
	private validate_progressive_disclosure(body: string): void {
		const word_count = this.count_words(body);
		const estimated_tokens = this.estimate_tokens(word_count);
		// Strip HTML comments before counting lines (progressive disclosure guidance shouldn't inflate count)
		const body_without_comments = this.strip_html_comments(body);
		const line_count = body_without_comments
			.trim()
			.split('\n').length;

		this.stats.word_count = word_count;
		this.stats.estimated_tokens = estimated_tokens;
		this.stats.line_count = line_count;

		// Hard limit check (error) - enforced at 1000 words
		if (word_count > this.MAX_WORDS) {
			this.error(
				`SKILL.md body has ${word_count} words (MAX: ${this.MAX_WORDS})\n` +
					`  → Move detailed content to references/ directory for Level 3 loading\n` +
					`  → This is a hard limit - skills must be concise`,
			);
		}
		// Warning threshold at 500 words
		else if (word_count > this.RECOMMENDED_WORDS) {
			this.warning(
				`SKILL.md body has ${word_count} words (recommended: <${this.RECOMMENDED_WORDS}, max: ${this.MAX_WORDS})\n` +
					`  → Consider moving examples/docs to references/ for better token efficiency`,
			);
		}

		// Line count validation (Level 2 progressive disclosure)
		// Hard limit: 50 lines (enforced)
		if (line_count > 50) {
			this.error(
				`SKILL.md body is ${line_count} lines (MAX: 50 for Level 2 progressive disclosure)\n` +
					`  → Move detailed content to references/ directory\n` +
					`  → This is a hard limit - skills must be concise`,
			);
		} else if (line_count > 40) {
			this.warning(
				`SKILL.md body is ${line_count} lines (recommended: ~40, max: 50)\n` +
					`  → Consider moving examples to references/ for Level 3 loading`,
			);
		}

		// Content analysis warnings
		// Code blocks: Recommend 1-2, warn at >3
		if (this.stats.code_blocks > 3) {
			this.warning(
				`SKILL.md contains ${this.stats.code_blocks} code examples (recommended: 1-2)\n` +
					`  → Move additional examples to references/examples.md for Level 3 loading`,
			);
		}

		// Long paragraphs
		if (this.stats.long_paragraphs > 3) {
			this.warning(
				`SKILL.md contains ${this.stats.long_paragraphs} lengthy paragraphs (>100 words)\n` +
					`  → Consider moving detailed explanations to references/`,
			);
		}

		// Sections: Recommend 3-5, warn at >8
		if (this.stats.sections > 8) {
			this.warning(
				`SKILL.md contains ${this.stats.sections} sections (recommended: 3-5)\n` +
					`  → Consider splitting into focused reference files`,
			);
		}

		// Check for "Quick Start" section
		if (
			!body.includes('## Quick Start') &&
			!body.includes('## Quick start')
		) {
			this.warning(
				`Missing "## Quick Start" section\n` +
					`  → Add one minimal working example to help Claude get started quickly`,
			);
		}

		// Check for references/ links when body is long
		const has_references = body.includes('references/');
		if (!has_references && line_count > 60) {
			this.warning(
				`No references/ links found but SKILL.md is ${line_count} lines\n` +
					`  → Consider splitting detailed content into reference files`,
			);
		}
	}

	private validate_directory(): boolean {
		if (!existsSync(this.skill_path)) {
			this.error(
				`Skill directory does not exist: ${this.skill_path}`,
			);
			return false;
		}

		const stats = statSync(this.skill_path);
		if (!stats.isDirectory()) {
			this.error(`Path is not a directory: ${this.skill_path}`);
			return false;
		}

		return true;
	}

	private validate_path_formats(
		content: string,
		file_name: string = 'SKILL.md',
	): void {
		const lines = content.split('\n');

		lines.forEach((line, index) => {
			// Skip code blocks (they might legitimately show Windows paths as examples)
			if (line.trim().startsWith('```')) return;

			// Detect backslashes in file paths
			// Match patterns like: scripts\file.py, references\doc.md, etc.
			const backslash_pattern =
				/(?:scripts|references|assets|examples)\\[\w\\.-]+/g;
			const matches = line.match(backslash_pattern);

			if (matches) {
				matches.forEach((match) => {
					const fixed = match.replace(/\\/g, '/');

					// Store in structured validation
					this.structured_validation.path_format.invalid_paths.push({
						line_number: index + 1,
						path: match,
						error: 'Windows-style backslash detected',
						suggested_fix: fixed,
					});

					this.error(
						`Windows-style path in ${file_name}:${index + 1}\n` +
							`  → Found: ${match}\n` +
							`  → Use: ${fixed}`,
					);
				});
			}
		});
	}

	private validate_skill_md(): boolean {
		const skill_md_path = join(this.skill_path, 'SKILL.md');

		if (!existsSync(skill_md_path)) {
			this.error('SKILL.md file not found');
			return false;
		}

		const content = readFileSync(skill_md_path, 'utf-8');

		// Validate path formats (no Windows backslashes)
		this.validate_path_formats(content);

		// Check for YAML frontmatter
		if (
			!content.startsWith('---\n') &&
			!content.startsWith('---\r\n')
		) {
			this.structured_validation.yaml_validation.has_frontmatter = false;
			this.structured_validation.yaml_validation.valid = false;
			this.structured_validation.yaml_validation.parse_error =
				'Missing YAML frontmatter';
			this.error('SKILL.md must start with YAML frontmatter (---)');
			return false;
		}

		this.structured_validation.yaml_validation.has_frontmatter = true;

		// Extract frontmatter
		const parts = content.split('---\n');
		if (parts.length < 3) {
			this.structured_validation.yaml_validation.valid = false;
			this.structured_validation.yaml_validation.parse_error =
				'Malformed YAML frontmatter';
			this.error('SKILL.md has malformed YAML frontmatter');
			return false;
		}

		const frontmatter = parts[1];
		const body = parts.slice(2).join('---\n');

		// Validate required fields
		if (!frontmatter.includes('name:')) {
			this.structured_validation.yaml_validation.missing_fields.push(
				'name',
			);
			this.structured_validation.yaml_validation.valid = false;
			this.error("SKILL.md frontmatter missing 'name' field");
			return false;
		}

		if (!frontmatter.includes('description:')) {
			this.structured_validation.yaml_validation.missing_fields.push(
				'description',
			);
			this.structured_validation.yaml_validation.valid = false;
			this.error("SKILL.md frontmatter missing 'description' field");
			return false;
		}

		// Extract name
		const name_match = frontmatter.match(/name:\s*(.+)/);
		if (name_match) {
			const name = name_match[1].trim();
			const dir_name = this.skill_path.split('/').pop() || '';

			// Store in structured validation
			this.structured_validation.name_format.name = name;
			this.structured_validation.name_format.directory_name =
				dir_name;
			this.structured_validation.hard_limits.name.length =
				name.length;

			// Validate name format
			if (!/^[a-z0-9-]+$/.test(name)) {
				const err = `Skill name must be lowercase kebab-case: '${name}'`;
				this.structured_validation.name_format.format_valid = false;
				this.structured_validation.name_format.errors.push(err);
				this.error(err);
			}

			// Check name matches directory (spec requirement)
			if (name !== dir_name) {
				const err = `Skill name '${name}' must match directory name '${dir_name}'`;
				this.structured_validation.name_format.matches_directory = false;
				this.structured_validation.name_format.errors.push(err);
				this.error(err);
			}

			// Check name length
			if (name.length > 64) {
				const err = `Skill name too long (max 64 chars): ${name.length}`;
				this.structured_validation.hard_limits.name.valid = false;
				this.structured_validation.hard_limits.name.error = err;
				this.error(err);
			}
		}

		// Extract description
		const desc_match = frontmatter.match(
			/description:\s*(.+?)(?=\n[a-z]+:|$)/s,
		);
		if (desc_match) {
			const description = desc_match[1].trim();

			// Store in structured validation
			this.structured_validation.hard_limits.description.length =
				description.length;

			// Hard limit check (Anthropic requirement)
			if (description.length > 1024) {
				const err = `Description too long (max 1024 chars per Anthropic): ${description.length}`;
				this.structured_validation.hard_limits.description.valid = false;
				this.structured_validation.hard_limits.description.error =
					err;
				this.error(err);
			}

			// Short description check
			if (description.length < 20) {
				this.warning(
					'Description is very short (consider adding more detail)',
				);
			}

			// Comprehensive Level 1 validation
			this.validate_description(description);

			// Triggering analysis (Phase 2)
			this.analyze_trigger_phrase(description);
			this.analyze_user_phrasing(description);
			this.analyze_alignment(description, body);
		}

		// Validate progressive disclosure (word count, token budget)
		this.validate_progressive_disclosure(body);

		// Analyze content structure
		this.analyze_content(body);

		// Check body content
		if (body.trim().length < 100) {
			this.warning('SKILL.md body is very short');
		}

		// Check for TODO placeholders
		if (
			body.includes('TODO') ||
			body.includes('[Add your') ||
			body.includes('[Provide')
		) {
			this.warning('SKILL.md contains TODO placeholders');
		}

		return true;
	}

	/**
	 * Check nesting depth of reference files
	 */
	private check_reference_nesting(
		file_path: string,
		visited: Set<string> = new Set(),
	): { depth: number; references: string[] } {
		if (visited.has(file_path)) {
			return { depth: 0, references: [] };
		}
		visited.add(file_path);

		const full_path = join(this.skill_path, file_path);
		if (!existsSync(full_path)) {
			return { depth: 0, references: [] };
		}

		const content = readFileSync(full_path, 'utf-8');
		const reference_pattern =
			/\[([^\]]+)\]\((references\/[^)]+\.md)\)/g;
		const matches = [...content.matchAll(reference_pattern)];
		const references = matches.map((m) => m[2]);

		if (references.length === 0) {
			return { depth: 1, references: [] };
		}

		// Recursively check nested references
		let max_depth = 1;
		for (const ref of references) {
			const nested = this.check_reference_nesting(
				ref,
				new Set(visited),
			);
			max_depth = Math.max(max_depth, 1 + nested.depth);
		}

		return { depth: max_depth, references };
	}

	private validate_references(): boolean {
		const references_dir = join(this.skill_path, 'references');
		const skill_md_path = join(this.skill_path, 'SKILL.md');

		const files_found: string[] = [];
		const files_referenced: string[] = [];
		const missing_files: string[] = [];
		const nesting_data: Array<{
			file: string;
			references: string[];
			depth: number;
			warning: string | null;
		}> = [];

		// Check references directory if it exists
		if (existsSync(references_dir)) {
			const files = readdirSync(references_dir);
			const md_files = files.filter((f) => f.endsWith('.md'));
			files_found.push(...md_files);

			if (md_files.length === 0) {
				this.warning('references/ directory exists but is empty');
			}

			// Check for references in SKILL.md
			if (existsSync(skill_md_path)) {
				const skill_content = readFileSync(skill_md_path, 'utf-8');

				for (const md_file of md_files) {
					if (!skill_content.includes(md_file)) {
						this.warning(
							`Reference file '${md_file}' not mentioned in SKILL.md`,
						);
					}
				}
			}
		}

		// Level 3 validation: Check that all referenced files exist
		if (existsSync(skill_md_path)) {
			const skill_content = readFileSync(skill_md_path, 'utf-8');

			// Extract markdown links to references/ directory
			// Matches: [text](references/file.md) or [text](references/subdir/file.md)
			const reference_link_pattern =
				/\[([^\]]+)\]\((references\/[^)]+\.md)\)/g;
			const matches = skill_content.matchAll(reference_link_pattern);

			for (const match of matches) {
				const link_text = match[1];
				const file_path = match[2]; // e.g., "references/examples.md"
				const full_path = join(this.skill_path, file_path);

				files_referenced.push(file_path);

				if (!existsSync(full_path)) {
					missing_files.push(file_path);
					this.error(
						`Referenced file not found: ${file_path}\n` +
							`  → Linked from: [${link_text}]\n` +
							`  → Create the file or remove the broken link`,
					);
				} else {
					// Check nesting depth
					const nesting = this.check_reference_nesting(file_path);
					let warning: string | null = null;

					if (nesting.depth > 1) {
						warning = `File has depth ${nesting.depth} (recommended: 1). Keep references one level deep from SKILL.md.`;
						this.warning(
							`${file_path} has nesting depth ${nesting.depth} (recommended: 1)\n` +
								`  → Keep references one level deep from SKILL.md for clarity`,
						);
					}

					nesting_data.push({
						file: file_path,
						references: nesting.references,
						depth: nesting.depth,
						warning,
					});
				}
			}
		}

		// Calculate orphaned files
		const orphaned = files_found.filter(
			(f) => !files_referenced.some((ref) => ref.includes(f)),
		);

		// Store in structured validation (will be set later when we have all data)
		this.references_validation = {
			files_found,
			files_referenced,
			missing_files,
			orphaned_files: orphaned,
			nesting: nesting_data,
			max_nesting_depth:
				nesting_data.length > 0
					? Math.max(...nesting_data.map((n) => n.depth))
					: 0,
		};

		return true;
	}

	private validate_scripts(): boolean {
		const scripts_dir = join(this.skill_path, 'scripts');

		if (existsSync(scripts_dir)) {
			const files = readdirSync(scripts_dir);
			const script_files = files.filter(
				(f) =>
					f.endsWith('.js') ||
					f.endsWith('.ts') ||
					f.endsWith('.mjs') ||
					f.endsWith('.sh'),
			);

			if (script_files.length === 0) {
				this.warning('scripts/ directory exists but is empty');
			}

			for (const script_file of script_files) {
				const script_path = join(scripts_dir, script_file);
				const stats = statSync(script_path);

				// Check if executable (0o111 = --x--x--x)
				if ((stats.mode & 0o111) === 0) {
					this.warning(`Script is not executable: ${script_file}`);
				}

				// Check for shebang
				const content = readFileSync(script_path, 'utf-8');
				const first_line = content.split('\n')[0];
				if (!first_line.startsWith('#!')) {
					this.warning(`Script missing shebang: ${script_file}`);
				}
			}
		}

		return true;
	}

	private validate_assets(): boolean {
		const assets_dir = join(this.skill_path, 'assets');

		if (existsSync(assets_dir)) {
			const files = readdirSync(assets_dir);

			if (files.length === 0) {
				this.warning('assets/ directory exists but is empty');
			}
		}

		return true;
	}

	public validate_all(): ValidationResult {
		if (!this.validate_directory()) {
			return {
				errors: this.errors,
				warnings: this.warnings,
				is_valid: false,
				stats: this.stats,
				validation: this.structured_validation,
			};
		}

		this.validate_skill_md();
		this.validate_references();
		this.validate_scripts();
		this.validate_assets();

		// Populate progressive disclosure structured validation
		this.structured_validation.progressive_disclosure = {
			skill_md_size: {
				lines: this.stats.line_count,
				words: this.stats.word_count,
				tokens: this.stats.estimated_tokens,
				exceeds_line_limit: this.stats.line_count > 50,
				exceeds_word_limit: this.stats.word_count > 1000,
			},
			references: this.references_validation,
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
