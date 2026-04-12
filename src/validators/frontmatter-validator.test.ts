import { describe, expect, it } from 'vitest';
import {
	extract_array_field,
	extract_frontmatter,
	has_yaml_frontmatter,
	is_description_multiline,
	validate_frontmatter_structure,
	validate_hard_limits,
	validate_name_format,
} from './frontmatter-validator.js';

describe('has_yaml_frontmatter', () => {
	it('should detect valid frontmatter', () => {
		expect(has_yaml_frontmatter('---\nname: test\n---\n')).toBe(true);
	});

	it('should reject content without frontmatter', () => {
		expect(has_yaml_frontmatter('# Hello')).toBe(false);
	});

	it('should reject empty content', () => {
		expect(has_yaml_frontmatter('')).toBe(false);
	});
});

describe('is_description_multiline', () => {
	it('should detect single-line description', () => {
		expect(
			is_description_multiline(
				'name: test\ndescription: A single line\n',
			),
		).toBe(false);
	});

	it('should detect multi-line description with continuation', () => {
		expect(
			is_description_multiline(
				'name: test\ndescription: First line\n  continued here\n',
			),
		).toBe(true);
	});

	it('should detect empty description line as multi-line', () => {
		expect(
			is_description_multiline(
				'name: test\ndescription:\n  value on next line\n',
			),
		).toBe(true);
	});
});

describe('extract_frontmatter', () => {
	it('should extract name and description', () => {
		const content =
			'---\nname: my-skill\ndescription: Does things\n---\n# Body';
		const result = extract_frontmatter(content);
		expect(result.name).toBe('my-skill');
		expect(result.description).toBe('Does things');
		expect(result.body).toBe('# Body');
	});

	it('should return nulls for missing frontmatter', () => {
		const result = extract_frontmatter('# No frontmatter');
		expect(result.name).toBeNull();
		expect(result.description).toBeNull();
	});

	it('should handle content with multiple --- separators', () => {
		const content =
			'---\nname: test\ndescription: Desc\n---\nBody with --- in it';
		const result = extract_frontmatter(content);
		expect(result.name).toBe('test');
		expect(result.body).toContain('---');
	});
});

describe('validate_frontmatter_structure', () => {
	it('should pass valid frontmatter', () => {
		const content =
			'---\nname: my-skill\ndescription: Does things\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.valid).toBe(true);
		expect(result.has_frontmatter).toBe(true);
		expect(result.missing_fields).toHaveLength(0);
	});

	it('should fail when name is missing', () => {
		const content = '---\ndescription: Does things\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.valid).toBe(false);
		expect(result.missing_fields).toContain('name');
	});

	it('should fail when description is missing', () => {
		const content = '---\nname: my-skill\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.valid).toBe(false);
		expect(result.missing_fields).toContain('description');
	});

	it('should fail without frontmatter', () => {
		const result = validate_frontmatter_structure('# Hello');
		expect(result.valid).toBe(false);
		expect(result.parse_error).toBe('Missing YAML frontmatter');
	});

	it('should detect unknown fields', () => {
		const content =
			'---\nname: test\ndescription: Desc\nfoo: bar\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toContain('foo');
	});

	it('should not flag known fields as unknown', () => {
		const content =
			'---\nname: test\ndescription: Desc\neffort: high\ncontext: fork\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toHaveLength(0);
	});

	it('should warn on invalid field values', () => {
		const content =
			'---\nname: test\ndescription: Desc\neffort: extreme\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings).toHaveLength(1);
		expect(result.field_value_warnings![0]).toContain('effort');
	});
});

describe('validate_name_format', () => {
	it('should pass valid kebab-case name', () => {
		const result = validate_name_format(
			'my-cool-skill',
			'my-cool-skill',
		);
		expect(result.format_valid).toBe(true);
		expect(result.matches_directory).toBe(true);
	});

	it('should reject uppercase', () => {
		const result = validate_name_format('MySkill', 'MySkill');
		expect(result.format_valid).toBe(false);
	});

	it('should reject leading hyphen', () => {
		const result = validate_name_format('-my-skill', '-my-skill');
		expect(result.format_valid).toBe(false);
	});

	it('should reject consecutive hyphens', () => {
		const result = validate_name_format('my--skill', 'my--skill');
		expect(result.format_valid).toBe(false);
	});

	it('should reject reserved prefix claude', () => {
		const result = validate_name_format(
			'claude-helper',
			'claude-helper',
		);
		expect(result.format_valid).toBe(false);
	});

	it('should reject reserved prefix anthropic', () => {
		const result = validate_name_format(
			'anthropic-tools',
			'anthropic-tools',
		);
		expect(result.format_valid).toBe(false);
	});

	it('should reject XML angle brackets', () => {
		const result = validate_name_format('<script>', '<script>');
		expect(result.format_valid).toBe(false);
	});

	it('should flag name/directory mismatch', () => {
		const result = validate_name_format('my-skill', 'other-dir');
		expect(result.matches_directory).toBe(false);
	});
});

describe('validate_hard_limits', () => {
	it('should pass within limits', () => {
		const result = validate_hard_limits('short', 'A description');
		expect(result.name.valid).toBe(true);
		expect(result.description.valid).toBe(true);
	});

	it('should fail name over 64 chars', () => {
		const long_name = 'a'.repeat(65);
		const result = validate_hard_limits(long_name, 'Desc');
		expect(result.name.valid).toBe(false);
	});

	it('should fail description over 250 chars', () => {
		const long_desc = 'a'.repeat(251);
		const result = validate_hard_limits('name', long_desc);
		expect(result.description.valid).toBe(false);
	});

	it('should reject XML in description', () => {
		const result = validate_hard_limits(
			'name',
			'<script>alert</script>',
		);
		expect(result.description.valid).toBe(false);
	});
});

describe('validate_frontmatter_structure — version field', () => {
	it('should accept valid semver version', () => {
		const content =
			'---\nname: test\ndescription: Desc\nversion: 1.0.0\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings).toHaveLength(0);
	});

	it('should accept semver with prerelease', () => {
		const content =
			'---\nname: test\ndescription: Desc\nversion: 0.1.0-beta.1\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings).toHaveLength(0);
	});

	it('should warn on v prefix', () => {
		const content =
			'---\nname: test\ndescription: Desc\nversion: v1.0.0\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings!.length).toBeGreaterThan(0);
		expect(result.field_value_warnings![0]).toContain('v');
	});

	it('should warn on invalid semver', () => {
		const content =
			'---\nname: test\ndescription: Desc\nversion: latest\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings!.length).toBeGreaterThan(0);
		expect(result.field_value_warnings![0]).toContain('semver');
	});

	it('should not flag version as unknown field', () => {
		const content =
			'---\nname: test\ndescription: Desc\nversion: 1.0.0\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toHaveLength(0);
	});
});

describe('validate_frontmatter_structure — dependency fields', () => {
	it('should not flag depends-on-skills as unknown', () => {
		const content =
			'---\nname: test\ndescription: Desc\ndepends-on-skills: [my-skill]\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toHaveLength(0);
	});

	it('should not flag depends-on-mcp as unknown', () => {
		const content =
			'---\nname: test\ndescription: Desc\ndepends-on-mcp: [server-a]\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toHaveLength(0);
	});

	it('should not flag depends-on-packages as unknown', () => {
		const content =
			'---\nname: test\ndescription: Desc\ndepends-on-packages: [lodash]\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.unknown_fields).toHaveLength(0);
	});

	it('should warn when depends-on field is plain string', () => {
		const content =
			'---\nname: test\ndescription: Desc\ndepends-on-skills: my-skill\n---\nBody';
		const result = validate_frontmatter_structure(content);
		expect(result.field_value_warnings!.length).toBeGreaterThan(0);
		expect(result.field_value_warnings![0]).toContain('YAML list');
	});

	it('should not warn when depends-on field is bracket array', () => {
		const content =
			'---\nname: test\ndescription: Desc\ndepends-on-skills: [a, b]\n---\nBody';
		const result = validate_frontmatter_structure(content);
		const dep_warnings = result.field_value_warnings!.filter((w) =>
			w.includes('depends-on'),
		);
		expect(dep_warnings).toHaveLength(0);
	});
});

describe('extract_array_field', () => {
	it('should extract inline bracket array', () => {
		const fm = 'name: test\ndepends-on-skills: [a, b, c]\n';
		const result = extract_array_field(fm, 'depends-on-skills');
		expect(result).toEqual(['a', 'b', 'c']);
	});

	it('should extract empty bracket array', () => {
		const fm = 'name: test\ndepends-on-skills: []\n';
		const result = extract_array_field(fm, 'depends-on-skills');
		expect(result).toEqual([]);
	});

	it('should extract YAML list items', () => {
		const fm =
			'name: test\ndepends-on-skills:\n  - skill-a\n  - skill-b\nversion: 1.0.0\n';
		const result = extract_array_field(fm, 'depends-on-skills');
		expect(result).toEqual(['skill-a', 'skill-b']);
	});

	it('should return null for missing field', () => {
		const fm = 'name: test\n';
		const result = extract_array_field(fm, 'depends-on-skills');
		expect(result).toBeNull();
	});

	it('should return null for plain string value', () => {
		const fm = 'name: test\ndepends-on-skills: just-a-string\n';
		const result = extract_array_field(fm, 'depends-on-skills');
		expect(result).toBeNull();
	});

	it('should strip quotes from array items', () => {
		const fm =
			'name: test\ndepends-on-mcp: ["server-a", "server-b"]\n';
		const result = extract_array_field(fm, 'depends-on-mcp');
		expect(result).toEqual(['server-a', 'server-b']);
	});
});
