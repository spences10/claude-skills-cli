import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { DoctorOptions } from '../types.js';
import { error, info, success } from '../utils/output.js';
import { check_package_dependencies } from '../validators/dependency-validator.js';
import {
	extract_array_field,
	extract_frontmatter,
	has_yaml_frontmatter,
	is_description_multiline,
} from '../validators/frontmatter-validator.js';

export function doctor_command(options: DoctorOptions): void {
	const { skill_path } = options;
	const skill_name = basename(skill_path);
	const skill_md_path = join(skill_path, 'SKILL.md');

	info(`Running doctor on: ${skill_name}`);
	console.log('='.repeat(60));

	// Read SKILL.md
	let content: string;
	try {
		content = readFileSync(skill_md_path, 'utf-8');
	} catch (err) {
		error(`Failed to read SKILL.md: ${String(err)}`);
		process.exit(1);
	}

	let fixes_applied = 0;
	let issues_found = 0;

	// Check 1: Multi-line description
	const frontmatter_data = extract_frontmatter(content);

	if (frontmatter_data.description_is_multiline) {
		issues_found++;
		info('Found multi-line description. Fixing...');

		const fixed_content = fix_multiline_description(content);

		try {
			writeFileSync(skill_md_path, fixed_content, 'utf-8');
			content = fixed_content;
			fixes_applied++;
			success('Fixed multi-line description');
			console.log(
				'  • Added # prettier-ignore comment before description',
			);
			console.log('  • Reflowed description to single line');
		} catch (err) {
			error(`Failed to write SKILL.md: ${String(err)}`);
		}
	}

	// Check 2: Missing package dependencies
	if (has_yaml_frontmatter(content)) {
		const parts = content.split('---\n');
		if (parts.length >= 3) {
			const frontmatter_raw = parts[1];
			const packages = extract_array_field(
				frontmatter_raw,
				'depends-on-packages',
			);

			if (packages && packages.length > 0) {
				const results = check_package_dependencies(packages);
				const missing = results.filter((r) => !r.found);

				if (missing.length > 0) {
					issues_found++;
					console.log('');
					info(
						`Missing ${missing.length} package dependenc${missing.length === 1 ? 'y' : 'ies'}:`,
					);
					for (const dep of missing) {
						console.log(`  • ${dep.name}`);
					}
					console.log('\nSuggested commands:');
					for (const dep of missing) {
						console.log(
							`  npm install ${dep.name}  # or: pip install ${dep.name}`,
						);
					}
				}
			}
		}
	}

	// Summary
	console.log('');
	if (issues_found === 0) {
		success('No issues found');
	} else {
		console.log(
			`Found ${issues_found} issue${issues_found === 1 ? '' : 's'}, applied ${fixes_applied} fix${fixes_applied === 1 ? '' : 'es'}`,
		);
		if (fixes_applied > 0) {
			console.log('\n✓ Run validate command to confirm the fixes');
		}
	}
}

/**
 * Fix multi-line description by adding prettier-ignore and reflowing to single line
 */
function fix_multiline_description(content: string): string {
	const lines = content.split('\n');
	const fixed_lines: string[] = [];
	let in_frontmatter = false;
	let frontmatter_count = 0;
	let in_description = false;
	let description_parts: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Track frontmatter boundaries
		if (line.trim() === '---') {
			frontmatter_count++;

			// If we're closing frontmatter and still collecting description
			if (frontmatter_count === 2 && in_description) {
				// Write out the collected description
				const full_description = description_parts.join(' ');
				fixed_lines.push(`description: ${full_description}`);
				description_parts = [];
				in_description = false;
			}

			in_frontmatter = frontmatter_count === 1;
			fixed_lines.push(line);
			continue;
		}

		// Not in frontmatter, just pass through
		if (!in_frontmatter) {
			fixed_lines.push(line);
			continue;
		}

		// Check if this is the description line
		if (line.match(/^description:/)) {
			// Check if it's already multi-line
			if (!is_description_multiline(lines.slice(i).join('\n'))) {
				// Single line, just pass through
				fixed_lines.push(line);
				continue;
			}

			in_description = true;

			// Extract value on same line (if any)
			const match = line.match(/^description:\s*(.*)$/);
			const value_on_line = match ? match[1].trim() : '';
			if (value_on_line) {
				description_parts.push(value_on_line);
			}

			// Add prettier-ignore comment
			fixed_lines.push('# prettier-ignore');
			// We'll add the description line later
			continue;
		}

		// If we're in description, collect continuation lines
		if (in_description) {
			// Stop if we hit another YAML field
			if (line.match(/^[a-z_-]+:/)) {
				// Done collecting description, write it out
				const full_description = description_parts.join(' ');
				fixed_lines.push(`description: ${full_description}`);
				description_parts = [];
				in_description = false;

				// Add the current line (next field)
				fixed_lines.push(line);
				continue;
			}

			// Continuation line - collect it
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				description_parts.push(trimmed);
			}
			continue;
		}

		// Regular frontmatter line
		fixed_lines.push(line);
	}

	// If we ended while still in description (at end of frontmatter)
	if (in_description && description_parts.length > 0) {
		const full_description = description_parts.join(' ');
		fixed_lines.push(`description: ${full_description}`);
	}

	return fixed_lines.join('\n');
}
