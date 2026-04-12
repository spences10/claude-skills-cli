/**
 * YAML frontmatter validation for SKILL.md
 */

import {
	DESCRIPTION_MAX_LENGTH,
	NAME_MAX_LENGTH,
	SEMVER_REGEX,
} from '../constants.js';
import type {
	HardLimitValidation,
	NameFormatValidation,
	YAMLValidation,
} from '../types.js';

export interface FrontmatterData {
	name: string | null;
	description: string | null;
	body: string;
	description_is_multiline: boolean;
}

/**
 * Check if content has valid YAML frontmatter
 */
export function has_yaml_frontmatter(content: string): boolean {
	return content.startsWith('---\n') || content.startsWith('---\r\n');
}

/**
 * Check if description field spans multiple lines in raw YAML
 */
export function is_description_multiline(
	frontmatter: string,
): boolean {
	// Find the description line
	const desc_line_match = frontmatter.match(/^description:\s*(.*)$/m);
	if (!desc_line_match) {
		return false;
	}

	const value_on_same_line = desc_line_match[1].trim();

	// If there's no value on the same line as "description:", it's multi-line
	if (!value_on_same_line) {
		return true;
	}

	// Check if there are continuation lines (indented lines after description:)
	// that are not other YAML fields
	const lines = frontmatter.split('\n');
	let found_desc = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.match(/^description:/)) {
			found_desc = true;
			continue;
		}
		if (found_desc) {
			// If next line starts with spaces/tabs and is not a comment and is not another field
			if (
				line.match(/^\s+\S/) &&
				!line.trim().startsWith('#') &&
				!line.match(/^[a-z_-]+:/)
			) {
				return true;
			}
			// Stop checking after we hit another field or end
			if (line.match(/^[a-z_-]+:/)) {
				break;
			}
		}
	}

	return false;
}

/**
 * Extract frontmatter and body from SKILL.md content
 */
export function extract_frontmatter(
	content: string,
): FrontmatterData {
	if (!has_yaml_frontmatter(content)) {
		return {
			name: null,
			description: null,
			body: content,
			description_is_multiline: false,
		};
	}

	const parts = content.split('---\n');
	if (parts.length < 3) {
		return {
			name: null,
			description: null,
			body: content,
			description_is_multiline: false,
		};
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

	// Check if description spans multiple lines in the raw YAML
	const description_is_multiline =
		is_description_multiline(frontmatter);

	return { name, description, body, description_is_multiline };
}

/**
 * Extract array field values from raw YAML frontmatter
 * Handles both inline [a, b] and YAML list (- item) formats
 */
export function extract_array_field(
	frontmatter: string,
	field: string,
): string[] | null {
	const lines = frontmatter.split('\n');
	let field_index = -1;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].match(new RegExp(`^${field}:`))) {
			field_index = i;
			break;
		}
	}

	if (field_index === -1) return null;

	const value = lines[field_index]
		.replace(new RegExp(`^${field}:\\s*`), '')
		.trim();

	// Inline bracket syntax: [item1, item2]
	if (value.startsWith('[')) {
		const inner = value.slice(1, value.lastIndexOf(']'));
		if (!inner.trim()) return [];
		return inner
			.split(',')
			.map((s) => s.trim().replace(/^["']|["']$/g, ''));
	}

	// Empty value — check for YAML list items on following lines
	if (!value) {
		const items: string[] = [];
		for (let i = field_index + 1; i < lines.length; i++) {
			const item_match = lines[i].match(/^\s+-\s+(.+)/);
			if (item_match) {
				items.push(item_match[1].trim().replace(/^["']|["']$/g, ''));
			} else if (lines[i].match(/^[a-z]/)) {
				break; // next field
			}
		}
		return items;
	}

	// Plain string value (not an array) — return null to signal format error
	return null;
}

/**
 * Known frontmatter fields per Anthropic spec
 * https://code.claude.com/docs/en/skills#frontmatter-reference
 */
const KNOWN_FRONTMATTER_FIELDS = new Set([
	'name',
	'description',
	'version',
	'argument-hint',
	'disable-model-invocation',
	'user-invocable',
	'allowed-tools',
	'model',
	'effort',
	'context',
	'agent',
	'hooks',
	'paths',
	'shell',
	'depends-on-skills',
	'depends-on-mcp',
	'depends-on-packages',
]);

/**
 * Fields that expect array values
 */
const ARRAY_FIELDS = new Set([
	'depends-on-skills',
	'depends-on-mcp',
	'depends-on-packages',
]);

/**
 * Fields with constrained values
 */
const FIELD_VALUES: Record<string, readonly string[]> = {
	effort: ['low', 'medium', 'high', 'max'],
	context: ['fork'],
	shell: ['bash', 'powershell'],
	'disable-model-invocation': ['true', 'false'],
	'user-invocable': ['true', 'false'],
};

/**
 * Extract top-level field names from raw YAML frontmatter
 */
function extract_field_names(
	frontmatter: string,
): Map<string, string> {
	const fields = new Map<string, string>();
	for (const line of frontmatter.split('\n')) {
		const match = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)/);
		if (match) {
			fields.set(match[1], match[2].trim());
		}
	}
	return fields;
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
		unknown_fields: [],
		field_value_warnings: [],
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

	// Check for unknown fields
	const fields = extract_field_names(frontmatter);
	for (const [field, value] of fields) {
		if (!KNOWN_FRONTMATTER_FIELDS.has(field)) {
			validation.unknown_fields!.push(field);
		}

		// Validate constrained field values
		const allowed = FIELD_VALUES[field];
		if (allowed && value && !allowed.includes(value)) {
			validation.field_value_warnings!.push(
				`'${field}' has value '${value}' (expected: ${allowed.join(', ')})`,
			);
		}

		// Validate version format
		if (field === 'version' && value) {
			if (value.startsWith('v')) {
				validation.field_value_warnings!.push(
					`'version' should not start with 'v' prefix — use '${value.slice(1)}' instead`,
				);
			} else if (!SEMVER_REGEX.test(value)) {
				validation.field_value_warnings!.push(
					`'version' must be valid semver (e.g. 1.0.0) — got '${value}'`,
				);
			}
		}

		// Validate array fields have correct format
		if (ARRAY_FIELDS.has(field) && value) {
			// Inline bracket syntax [a, b] is valid
			if (!value.startsWith('[')) {
				validation.field_value_warnings!.push(
					`'${field}' should be a YAML list (e.g. [item1, item2] or - item) — got plain string '${value}'`,
				);
			}
		}
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

	// Reject leading/trailing hyphens
	if (name.startsWith('-') || name.endsWith('-')) {
		validation.format_valid = false;
		validation.errors.push(
			`Skill name must not start or end with a hyphen: '${name}'`,
		);
	}

	// Reject consecutive hyphens
	if (name.includes('--')) {
		validation.format_valid = false;
		validation.errors.push(
			`Skill name must not contain consecutive hyphens: '${name}'`,
		);
	}

	// Reject reserved prefixes
	if (name.startsWith('claude') || name.startsWith('anthropic')) {
		validation.format_valid = false;
		validation.errors.push(
			`Skill name must not use reserved prefix 'claude' or 'anthropic': '${name}'`,
		);
	}

	// Reject XML angle brackets in name (security)
	if (name.includes('<') || name.includes('>')) {
		validation.format_valid = false;
		validation.errors.push(
			`Skill name must not contain XML angle brackets: '${name}'`,
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
		description: {
			length: 0,
			limit: DESCRIPTION_MAX_LENGTH,
			valid: true,
			error: null,
		},
	};

	// Validate name length
	if (name) {
		limits.name.length = name.length;
		if (name.length > NAME_MAX_LENGTH) {
			limits.name.valid = false;
			limits.name.error = `Skill name too long (max ${NAME_MAX_LENGTH} chars): ${name.length}`;
		}
	}

	// Validate description length (truncated at limit in skill listing)
	if (description) {
		limits.description.length = description.length;
		if (description.length > DESCRIPTION_MAX_LENGTH) {
			limits.description.valid = false;
			limits.description.error = `Description too long (max ${DESCRIPTION_MAX_LENGTH} chars — Claude truncates at this limit): ${description.length}`;
		}
		// Reject XML angle brackets in description (security)
		if (description.includes('<') || description.includes('>')) {
			limits.description.valid = false;
			limits.description.error = `Description must not contain XML angle brackets`;
		}
	}

	return limits;
}
