import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { DoctorOptions } from '../types.js';
import { error, info, success } from '../utils/output.js';
import {
	extract_frontmatter,
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
		error(`Failed to read SKILL.md: ${err}`);
		process.exit(1);
	}

	// Extract frontmatter
	const frontmatter_data = extract_frontmatter(content);

	if (!frontmatter_data.description_is_multiline) {
		success(
			'No issues found. Description is already on a single line.',
		);
		process.exit(0);
	}

	info('Found multi-line description. Fixing...');

	// Fix the multi-line description
	const fixed_content = fix_multiline_description(content);

	// Write fixed content back
	try {
		writeFileSync(skill_md_path, fixed_content, 'utf-8');
		success('Fixed multi-line description!');
		console.log('\nChanges made:');
		console.log(
			'  • Added # prettier-ignore comment before description',
		);
		console.log('  • Reflowed description to single line');
		console.log('\n✓ Run validate command to confirm the fix');
		process.exit(0);
	} catch (err) {
		error(`Failed to write SKILL.md: ${err}`);
		process.exit(1);
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
	let description_line_index = -1;

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
			description_line_index = fixed_lines.length;

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
