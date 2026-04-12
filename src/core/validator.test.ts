import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SkillValidator } from './validator.js';

describe('SkillValidator — dependency integration', () => {
	let tmp_dir: string;
	let skill_path: string;

	beforeEach(() => {
		tmp_dir = mkdtempSync(join(tmpdir(), 'skill-test-'));
		skill_path = join(tmp_dir, 'test-skill');
		mkdirSync(skill_path);
		mkdirSync(join(skill_path, 'references'));
	});

	afterEach(() => {
		rmSync(tmp_dir, { recursive: true, force: true });
	});

	function write_skill(frontmatter: string, body: string): void {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			`---\n${frontmatter}\n---\n${body}`,
		);
	}

	it('should pass validation with no dependency fields', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true);
	});

	it('should pass with empty dependency arrays', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\ndepends-on-skills: []\ndepends-on-mcp: []\ndepends-on-packages: []',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true);
		expect(result.validation?.dependency_validation).toBeDefined();
	});

	it('should warn about missing skill dependencies', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\ndepends-on-skills: [nonexistent-skill-abc]',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true); // warnings don't invalidate
		expect(
			result.warnings.some((w) =>
				w.includes('nonexistent-skill-abc'),
			),
		).toBe(true);
	});

	it('should warn about missing MCP dependencies', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\ndepends-on-mcp: [nonexistent-mcp-server]',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true);
		expect(
			result.warnings.some((w) =>
				w.includes('nonexistent-mcp-server'),
			),
		).toBe(true);
	});

	it('should populate dependency_validation in structured output', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\ndepends-on-packages: [vitest]',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		const dep = result.validation?.dependency_validation;
		expect(dep).toBeDefined();
		expect(dep!.depends_on_packages).toHaveLength(1);
		expect(dep!.depends_on_packages[0].name).toBe('vitest');
		expect(dep!.depends_on_packages[0].found).toBe(true);
	});

	it('should validate version field format', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\nversion: 1.0.0',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true);
		// No warnings about version format
		expect(result.warnings.some((w) => w.includes('version'))).toBe(
			false,
		);
	});

	it('should warn about invalid version format', () => {
		write_skill(
			'name: test-skill\ndescription: A test skill for validation. Use when testing the validator.\nversion: latest',
			'# Test Skill\n\n## Quick Start\n\nSome content here.',
		);
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();
		expect(result.is_valid).toBe(true);
		expect(result.warnings.some((w) => w.includes('semver'))).toBe(
			true,
		);
	});
});
