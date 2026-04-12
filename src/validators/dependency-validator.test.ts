import { describe, expect, it } from 'vitest';
import {
	check_mcp_dependencies,
	check_package_dependencies,
	check_skill_dependencies,
	validate_dependencies,
} from './dependency-validator.js';

describe('validate_dependencies', () => {
	it('should return empty results for frontmatter without dependency fields', () => {
		const result = validate_dependencies('name: test\n');
		expect(result.errors).toHaveLength(0);
		expect(result.warnings).toHaveLength(0);
		expect(result.validation.depends_on_skills).toHaveLength(0);
		expect(result.validation.depends_on_mcp).toHaveLength(0);
		expect(result.validation.depends_on_packages).toHaveLength(0);
	});

	it('should return empty results for empty arrays', () => {
		const fm =
			'name: test\ndepends-on-skills: []\ndepends-on-mcp: []\ndepends-on-packages: []\n';
		const result = validate_dependencies(fm);
		expect(result.errors).toHaveLength(0);
		expect(result.warnings).toHaveLength(0);
	});

	it('should warn about missing skill dependencies', () => {
		const fm =
			'name: test\ndepends-on-skills: [nonexistent-skill-xyz]\n';
		const result = validate_dependencies(fm);
		expect(result.warnings.length).toBeGreaterThan(0);
		expect(result.warnings[0]).toContain('nonexistent-skill-xyz');
		expect(result.validation.depends_on_skills[0].found).toBe(false);
	});

	it('should warn about missing MCP server dependencies', () => {
		const fm =
			'name: test\ndepends-on-mcp: [nonexistent-mcp-server]\n';
		const result = validate_dependencies(fm);
		expect(result.warnings.length).toBeGreaterThan(0);
		expect(result.warnings[0]).toContain('nonexistent-mcp-server');
		expect(result.validation.depends_on_mcp[0].found).toBe(false);
	});

	it('should warn about missing package dependencies', () => {
		const fm =
			'name: test\ndepends-on-packages: [nonexistent-pkg-xyz-123]\n';
		const result = validate_dependencies(fm);
		expect(result.warnings.length).toBeGreaterThan(0);
		expect(result.warnings[0]).toContain('nonexistent-pkg-xyz-123');
	});

	it('should find node_modules packages that exist', () => {
		// vitest is in node_modules for this project
		const fm = 'name: test\ndepends-on-packages: [vitest]\n';
		const result = validate_dependencies(fm);
		const vitest_dep = result.validation.depends_on_packages.find(
			(d) => d.name === 'vitest',
		);
		expect(vitest_dep?.found).toBe(true);
		expect(vitest_dep?.type).toBe('node');
	});

	it('should find system packages that exist', () => {
		// node should be available on any system running these tests
		const fm = 'name: test\ndepends-on-packages: [node]\n';
		const result = validate_dependencies(fm);
		const node_dep = result.validation.depends_on_packages.find(
			(d) => d.name === 'node',
		);
		expect(node_dep?.found).toBe(true);
		expect(node_dep?.type).toBe('system');
	});

	it('should handle multiple dependencies across all types', () => {
		const fm =
			'name: test\ndepends-on-skills: [nonexistent-a, nonexistent-b]\ndepends-on-mcp: [missing-server]\ndepends-on-packages: [nonexistent-pkg]\n';
		const result = validate_dependencies(fm);
		expect(result.warnings).toHaveLength(4);
		expect(result.validation.depends_on_skills).toHaveLength(2);
		expect(result.validation.depends_on_mcp).toHaveLength(1);
		expect(result.validation.depends_on_packages).toHaveLength(1);
	});

	it('should produce no errors for valid dependency declarations', () => {
		const fm =
			'name: test\ndepends-on-skills: []\ndepends-on-mcp: []\ndepends-on-packages: [vitest]\n';
		const result = validate_dependencies(fm);
		expect(result.errors).toHaveLength(0);
	});
});

describe('check_skill_dependencies', () => {
	it('should return not found for nonexistent skills', () => {
		const result = check_skill_dependencies(['does-not-exist-xyz']);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('does-not-exist-xyz');
		expect(result[0].found).toBe(false);
		expect(result[0].path).toBeNull();
	});

	it('should handle empty array', () => {
		const result = check_skill_dependencies([]);
		expect(result).toHaveLength(0);
	});

	it('should check multiple skills', () => {
		const result = check_skill_dependencies([
			'missing-a',
			'missing-b',
		]);
		expect(result).toHaveLength(2);
		expect(result.every((r) => !r.found)).toBe(true);
	});
});

describe('check_mcp_dependencies', () => {
	it('should return not found for nonexistent MCP servers', () => {
		const result = check_mcp_dependencies(['nonexistent-server-xyz']);
		expect(result).toHaveLength(1);
		expect(result[0].found).toBe(false);
	});

	it('should handle empty array', () => {
		const result = check_mcp_dependencies([]);
		expect(result).toHaveLength(0);
	});
});

describe('check_package_dependencies', () => {
	it('should find vitest in node_modules', () => {
		const result = check_package_dependencies(['vitest']);
		expect(result[0].found).toBe(true);
		expect(result[0].type).toBe('node');
	});

	it('should find node on system PATH', () => {
		const result = check_package_dependencies(['node']);
		expect(result[0].found).toBe(true);
		expect(result[0].type).toBe('system');
	});

	it('should return unknown for missing packages', () => {
		const result = check_package_dependencies([
			'nonexistent-pkg-xyz-999',
		]);
		expect(result[0].found).toBe(false);
		expect(result[0].type).toBe('unknown');
	});

	it('should handle empty array', () => {
		const result = check_package_dependencies([]);
		expect(result).toHaveLength(0);
	});

	it('should check multiple packages', () => {
		const result = check_package_dependencies([
			'vitest',
			'nonexistent-xyz',
		]);
		expect(result[0].found).toBe(true);
		expect(result[1].found).toBe(false);
	});
});
