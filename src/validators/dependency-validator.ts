/**
 * Dependency validation for skill frontmatter
 * Checks depends-on-skills, depends-on-mcp, depends-on-packages
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { DependencyValidation } from '../types.js';
import { extract_array_field } from './frontmatter-validator.js';

interface DependencyResult {
	errors: string[];
	warnings: string[];
	validation: DependencyValidation;
}

/**
 * Validate all dependency declarations in frontmatter
 */
export function validate_dependencies(
	frontmatter_raw: string,
): DependencyResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const validation: DependencyValidation = {
		depends_on_skills: [],
		depends_on_mcp: [],
		depends_on_packages: [],
	};

	// Parse depends-on-skills
	const skills = extract_array_field(
		frontmatter_raw,
		'depends-on-skills',
	);
	if (skills !== null) {
		validation.depends_on_skills = check_skill_dependencies(skills);
		for (const dep of validation.depends_on_skills) {
			if (!dep.found) {
				warnings.push(
					`Skill dependency '${dep.name}' not found in ~/.claude/skills/ or .claude/skills/`,
				);
			}
		}
	}

	// Parse depends-on-mcp
	const mcp = extract_array_field(frontmatter_raw, 'depends-on-mcp');
	if (mcp !== null) {
		validation.depends_on_mcp = check_mcp_dependencies(mcp);
		for (const dep of validation.depends_on_mcp) {
			if (!dep.found) {
				warnings.push(
					`MCP server dependency '${dep.name}' not found in Claude settings`,
				);
			}
		}
	}

	// Parse depends-on-packages
	const packages = extract_array_field(
		frontmatter_raw,
		'depends-on-packages',
	);
	if (packages !== null) {
		validation.depends_on_packages =
			check_package_dependencies(packages);
		for (const dep of validation.depends_on_packages) {
			if (!dep.found) {
				warnings.push(`Package dependency '${dep.name}' not found`);
			}
		}
	}

	return { errors, warnings, validation };
}

/**
 * Check if skill dependencies exist on disk
 */
export function check_skill_dependencies(
	names: string[],
): DependencyValidation['depends_on_skills'] {
	const home = homedir();
	const search_paths = [
		join(home, '.claude', 'skills'),
		join('.claude', 'skills'),
	];

	return names.map((name) => {
		for (const base of search_paths) {
			const skill_md = join(base, name, 'SKILL.md');
			if (existsSync(skill_md)) {
				return { name, found: true, path: join(base, name) };
			}
		}
		return { name, found: false, path: null };
	});
}

/**
 * Check if MCP server dependencies are configured in Claude settings
 */
export function check_mcp_dependencies(
	names: string[],
): DependencyValidation['depends_on_mcp'] {
	const configured_servers = new Set<string>();
	const home = homedir();

	const settings_paths = [
		join(home, '.claude', 'settings.json'),
		join('.claude', 'settings.json'),
		join('.claude', 'settings.local.json'),
	];

	for (const settings_path of settings_paths) {
		try {
			if (!existsSync(settings_path)) continue;
			const content = readFileSync(settings_path, 'utf-8');
			const settings = JSON.parse(content);
			if (settings.mcpServers) {
				for (const key of Object.keys(settings.mcpServers)) {
					configured_servers.add(key);
				}
			}
		} catch {
			// Skip unparseable settings files
		}
	}

	return names.map((name) => ({
		name,
		found: configured_servers.has(name),
	}));
}

/**
 * Check if package dependencies are available
 * Tries node_modules and system PATH
 */
export function check_package_dependencies(
	names: string[],
): DependencyValidation['depends_on_packages'] {
	return names.map((name) => {
		// Check node_modules
		if (existsSync(join('node_modules', name))) {
			return { name, found: true, type: 'node' as const };
		}

		// Check system PATH
		try {
			execSync(`which ${name}`, { stdio: 'pipe' });
			return { name, found: true, type: 'system' as const };
		} catch {
			// Not in PATH
		}

		return { name, found: false, type: 'unknown' as const };
	});
}
