import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { SkillValidator } from '../core/validator.js';
import type { PackageOptions } from '../types.js';
import { ensure_dir } from '../utils/fs.js';
import {
	error,
	package_,
	search,
	success,
	upload,
	warning,
} from '../utils/output.js';

function validate_skill(skill_path: string): boolean {
	search('Validating skill...');

	const validator = new SkillValidator(skill_path);
	const result = validator.validate_all();

	if (result.errors.length > 0) {
		console.log('\n❌ Errors:');
		for (const err of result.errors) {
			console.log(`  ${err}`);
		}
	}

	if (result.warnings.length > 0) {
		console.log('\n⚠️  Warnings:');
		for (const warn of result.warnings) {
			console.log(`  ${warn}`);
		}
	}

	if (result.is_valid) {
		success('Skill is valid!');
		console.log('');
		return true;
	} else {
		error('Validation failed. Fix errors before packaging.');
		return false;
	}
}

function package_skill(
	skill_path: string,
	output_dir: string,
): string {
	const skill_name = basename(skill_path);
	const output_file = resolve(output_dir, `${skill_name}.zip`);

	package_(`Packaging skill: ${skill_name}`);

	ensure_dir(output_dir);

	// Remove existing zip if present
	if (existsSync(output_file)) {
		execSync(`rm ${output_file}`);
	}

	// Use system zip command — available on all target platforms
	const parent_dir = resolve(skill_path, '..');
	execSync(
		`cd "${parent_dir}" && zip -r "${output_file}" "${skill_name}" -x '${skill_name}/.*' '${skill_name}/*.swp' '${skill_name}/*~' '${skill_name}/.DS_Store'`,
	);

	return output_file;
}

export async function package_command(
	options: PackageOptions,
): Promise<void> {
	const { skill_path, output, skip_validation } = options;

	// Validate path
	if (!existsSync(skill_path)) {
		error(`Skill directory does not exist: ${skill_path}`);
		process.exit(1);
	}

	const stats = statSync(skill_path);
	if (!stats.isDirectory()) {
		error(`Path is not a directory: ${skill_path}`);
		process.exit(1);
	}

	// Check for SKILL.md
	if (!existsSync(join(skill_path, 'SKILL.md'))) {
		error(`SKILL.md not found in ${skill_path}`);
		process.exit(1);
	}

	// Validate skill
	if (!skip_validation) {
		if (!validate_skill(skill_path)) {
			process.exit(1);
		}
	}

	// Package skill
	try {
		const output_dir = output || 'dist';
		const output_file = package_skill(skill_path, output_dir);

		// Print success
		const file_stats = statSync(output_file);
		const size_kb = file_stats.size / 1024;

		console.log('');
		success('Skill packaged successfully!');
		console.log(`   File: ${output_file}`);
		console.log(`   Size: ${size_kb.toFixed(1)} KB`);
		console.log('');
		warning(
			'Note: ZIP packaging is not an official Claude Code distribution method.',
		);
		console.log(
			'   Official distribution uses the plugin system (/plugin install)',
		);
		console.log(
			'   or direct file placement in .claude/skills/.',
		);
		console.log(
			'   See: https://code.claude.com/docs/en/plugins',
		);
		console.log('');
		upload(
			'Upload to Claude.ai: Settings > Features > Skills > Upload',
		);
	} catch (err) {
		error(`Failed to package skill: ${err}`);
		process.exit(1);
	}
}
