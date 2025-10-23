/**
 * YAML frontmatter validation for SKILL.md
 */

import type {
	HardLimitValidation,
	NameFormatValidation,
	YAMLValidation,
} from '../types.js';

export interface FrontmatterData {
	name: string | null;
	description: string | null;
	body: string;
}

/**
 * Check if content has valid YAML frontmatter
 */
export function has_yaml_frontmatter(content: string): boolean {
	return content.startsWith('---\n') || content.startsWith('---\r\n');
}

/**
 * Extract frontmatter and body from SKILL.md content
 */
export function extract_frontmatter(
	content: string,
): FrontmatterData {
	if (!has_yaml_frontmatter(content)) {
		return { name: null, description: null, body: content };
	}

	const parts = content.split('---\n');
	if (parts.length < 3) {
		return { name: null, description: null, body: content };
	}

	const frontmatter = parts[1];
	const body = parts.slice(2).join('---\n');

	// Extract name
	const name_match = frontmatter.match(/name:\s*(.+)/);
	const name = name_match ? name_match[1].trim() : null;

	// Extract description
	const desc_match = frontmatter.match(
		/description:\s*(.+?)(?=\n[a-z]+:|$)/s,
	);
	const description = desc_match ? desc_match[1].trim() : null;

	return { name, description, body };
}

/**
 * Validate YAML frontmatter structure
 */
export function validate_frontmatter_structure(
	content: string,
): YAMLValidation {
	const validation: YAMLValidation = {
		valid: true,
		has_frontmatter: false,
		parse_error: null,
		missing_fields: [],
	};

	if (!has_yaml_frontmatter(content)) {
		validation.valid = false;
		validation.parse_error = 'Missing YAML frontmatter';
		return validation;
	}

	validation.has_frontmatter = true;

	const parts = content.split('---\n');
	if (parts.length < 3) {
		validation.valid = false;
		validation.parse_error = 'Malformed YAML frontmatter';
		return validation;
	}

	const frontmatter = parts[1];

	// Check required fields
	if (!frontmatter.includes('name:')) {
		validation.missing_fields.push('name');
		validation.valid = false;
	}

	if (!frontmatter.includes('description:')) {
		validation.missing_fields.push('description');
		validation.valid = false;
	}

	return validation;
}

/**
 * Validate skill name format
 */
export function validate_name_format(
	name: string,
	directory_name: string,
): NameFormatValidation {
	const validation: NameFormatValidation = {
		name,
		format_valid: true,
		directory_name,
		matches_directory: true,
		errors: [],
	};

	// Validate kebab-case format
	if (!/^[a-z0-9-]+$/.test(name)) {
		validation.format_valid = false;
		validation.errors.push(
			`Skill name must be lowercase kebab-case: '${name}'`,
		);
	}

	// Check name matches directory
	if (name !== directory_name) {
		validation.matches_directory = false;
		validation.errors.push(
			`Skill name '${name}' must match directory name '${directory_name}'`,
		);
	}

	return validation;
}

/**
 * Validate hard limits for name and description
 */
export function validate_hard_limits(
	name: string | null,
	description: string | null,
): HardLimitValidation {
	const limits: HardLimitValidation = {
		name: { length: 0, limit: 64, valid: true, error: null },
		description: { length: 0, limit: 1024, valid: true, error: null },
	};

	// Validate name length
	if (name) {
		limits.name.length = name.length;
		if (name.length > 64) {
			limits.name.valid = false;
			limits.name.error = `Skill name too long (max 64 chars): ${name.length}`;
		}
	}

	// Validate description length (Anthropic hard limit)
	if (description) {
		limits.description.length = description.length;
		if (description.length > 1024) {
			limits.description.valid = false;
			limits.description.error = `Description too long (max 1024 chars per Anthropic): ${description.length}`;
		}
	}

	return limits;
}
