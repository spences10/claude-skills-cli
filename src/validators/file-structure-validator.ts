/**
 * File structure validation - paths, scripts, assets
 */

import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
} from 'node:fs';
import { join } from 'node:path';
import type {
	PathFormatValidation,
	PathFormatIssue,
} from '../types.js';

export interface PathFormatError {
	type: 'windows_path';
	message: string;
}

export interface ScriptsWarning {
	type: 'empty_directory' | 'not_executable' | 'missing_shebang';
	message: string;
}

export interface AssetsWarning {
	type: 'empty_directory';
	message: string;
}

export interface DirectoryError {
	type: 'not_found' | 'not_directory';
	message: string;
}

/**
 * Validate that skill directory exists and is valid
 */
export function validate_directory(skill_path: string): {
	valid: boolean;
	errors: DirectoryError[];
} {
	const errors: DirectoryError[] = [];

	if (!existsSync(skill_path)) {
		errors.push({
			type: 'not_found',
			message: `Skill directory does not exist: ${skill_path}`,
		});
		return { valid: false, errors };
	}

	const stats = statSync(skill_path);
	if (!stats.isDirectory()) {
		errors.push({
			type: 'not_directory',
			message: `Path is not a directory: ${skill_path}`,
		});
		return { valid: false, errors };
	}

	return { valid: true, errors: [] };
}

/**
 * Validate path formats (no Windows backslashes)
 */
export function validate_path_formats(
	content: string,
	file_name: string = 'SKILL.md',
): {
	validation: PathFormatValidation;
	errors: PathFormatError[];
} {
	const invalid_paths: PathFormatIssue[] = [];
	const errors: PathFormatError[] = [];
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

				// Store in validation
				invalid_paths.push({
					line_number: index + 1,
					path: match,
					error: 'Windows-style backslash detected',
					suggested_fix: fixed,
				});

				errors.push({
					type: 'windows_path',
					message:
						`Windows-style path in ${file_name}:${index + 1}\n` +
						`  → Found: ${match}\n` +
						`  → Use: ${fixed}`,
				});
			});
		}
	});

	return {
		validation: { invalid_paths },
		errors,
	};
}

/**
 * Validate scripts directory
 */
export function validate_scripts(skill_path: string): {
	warnings: ScriptsWarning[];
} {
	const scripts_dir = join(skill_path, 'scripts');
	const warnings: ScriptsWarning[] = [];

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
			warnings.push({
				type: 'empty_directory',
				message: 'scripts/ directory exists but is empty',
			});
		}

		for (const script_file of script_files) {
			const script_path = join(scripts_dir, script_file);
			const stats = statSync(script_path);

			// Check if executable (0o111 = --x--x--x)
			if ((stats.mode & 0o111) === 0) {
				warnings.push({
					type: 'not_executable',
					message: `Script is not executable: ${script_file}`,
				});
			}

			// Check for shebang
			const content = readFileSync(script_path, 'utf-8');
			const first_line = content.split('\n')[0];
			if (!first_line.startsWith('#!')) {
				warnings.push({
					type: 'missing_shebang',
					message: `Script missing shebang: ${script_file}`,
				});
			}
		}
	}

	return { warnings };
}

/**
 * Validate assets directory
 */
export function validate_assets(skill_path: string): {
	warnings: AssetsWarning[];
} {
	const assets_dir = join(skill_path, 'assets');
	const warnings: AssetsWarning[] = [];

	if (existsSync(assets_dir)) {
		const files = readdirSync(assets_dir);

		if (files.length === 0) {
			warnings.push({
				type: 'empty_directory',
				message: 'assets/ directory exists but is empty',
			});
		}
	}

	return { warnings };
}
