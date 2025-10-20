import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SkillValidator } from '../core/validator.js';
import type { StatsOptions } from '../types.js';
import { error } from '../utils/output.js';

export function stats_command(options: StatsOptions): void {
	const directory = options.directory || '.claude/skills';

	// Verify directory exists
	if (!existsSync(directory)) {
		error(`Directory not found: ${directory}`);
		process.exit(1);
	}

	const dir_stats = statSync(directory);
	if (!dir_stats.isDirectory()) {
		error(`Path is not a directory: ${directory}`);
		process.exit(1);
	}

	// Find all skill directories (containing SKILL.md)
	const entries = readdirSync(directory);
	const skills: string[] = [];

	for (const entry of entries) {
		const skill_path = join(directory, entry);
		const stat = statSync(skill_path);

		if (stat.isDirectory()) {
			const skill_md_path = join(skill_path, 'SKILL.md');
			if (existsSync(skill_md_path)) {
				skills.push(skill_path);
			}
		}
	}

	if (skills.length === 0) {
		console.log(`No skills found in ${directory}`);
		console.log(
			'\nCreate a skill with: claude-skills-cli init --name my-skill --description "..."\n',
		);
		return;
	}

	// Display overview header
	console.log('📊 Skills Overview');
	console.log(
		'============================================================',
	);
	console.log(
		`${skills.length} skill${skills.length === 1 ? '' : 's'} found:\n`,
	);

	// Validate and display each skill
	for (const skill_path of skills) {
		const skill_name = skill_path.split('/').pop() || '';
		const validator = new SkillValidator(skill_path);
		const result = validator.validate_all();

		// Determine status icon
		let status_icon = '✅';
		let status_text = 'valid';
		if (!result.is_valid) {
			status_icon = '❌';
			status_text = 'errors';
		} else if (result.warnings.length > 0) {
			status_icon = '⚠️ ';
			status_text = 'warnings';
		}

		console.log(`${skill_name} (${status_icon} ${status_text})`);

		if (result.stats) {
			// Description length
			const desc_length = result.stats.description_length;
			let desc_status = '';
			if (desc_length > 0) {
				if (desc_length <= 200) {
					desc_status = 'optimal';
				} else if (desc_length <= 300) {
					desc_status = 'good';
				} else {
					desc_status = 'long';
				}
				console.log(
					`  Description: ${desc_length} chars (${desc_status})`,
				);
			}

			// Body stats
			const lines = result.stats.line_count;
			const words = result.stats.word_count;

			let line_status = '';
			if (lines <= 50) {
				line_status = 'excellent';
			} else if (lines <= 80) {
				line_status = 'good';
			} else if (lines <= 150) {
				line_status = 'consider splitting';
			} else {
				line_status = 'too long';
			}

			let word_status = '';
			if (words < 500) {
				word_status = 'excellent';
			} else if (words < 1000) {
				word_status = 'good';
			} else if (words < 5000) {
				word_status = 'acceptable';
			} else {
				word_status = 'too long';
			}

			console.log(
				`  Body: ${lines} lines, ${words} words (${line_status})`,
			);

			// Count reference files
			const references_dir = join(skill_path, 'references');
			if (existsSync(references_dir)) {
				const ref_files = readdirSync(references_dir).filter((f) =>
					f.endsWith('.md'),
				);
				if (ref_files.length > 0) {
					// Calculate total size
					let total_size = 0;
					for (const ref_file of ref_files) {
						const ref_path = join(references_dir, ref_file);
						const ref_stat = statSync(ref_path);
						total_size += ref_stat.size;
					}
					const size_kb = (total_size / 1024).toFixed(1);
					console.log(
						`  References: ${ref_files.length} file${ref_files.length === 1 ? '' : 's'} (${size_kb} KB)`,
					);
				}
			}
		}

		// Show error/warning count
		if (!result.is_valid) {
			console.log(
				`  ${result.errors.length} error${result.errors.length === 1 ? '' : 's'}`,
			);
		}
		if (result.warnings.length > 0) {
			console.log(
				`  ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}`,
			);
		}

		console.log(''); // Blank line between skills
	}

	// Summary
	const valid_skills = skills.filter((path) => {
		const validator = new SkillValidator(path);
		const result = validator.validate_all();
		return result.is_valid;
	}).length;

	const skills_with_warnings = skills.filter((path) => {
		const validator = new SkillValidator(path);
		const result = validator.validate_all();
		return result.is_valid && result.warnings.length > 0;
	}).length;

	const invalid_skills = skills.length - valid_skills;

	console.log('Summary:');
	if (invalid_skills === 0 && skills_with_warnings === 0) {
		console.log(
			`✅ All ${skills.length} skills are valid with no warnings`,
		);
	} else {
		console.log(`  Valid: ${valid_skills}`);
		if (skills_with_warnings > 0) {
			console.log(`  With warnings: ${skills_with_warnings}`);
		}
		if (invalid_skills > 0) {
			console.log(`  Invalid: ${invalid_skills}`);
		}
	}
}
