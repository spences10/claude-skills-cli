/**
 * References validation (Level 3 progressive disclosure)
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReferenceNesting } from '../types.js';

export interface ReferencesValidation {
	files_found: string[];
	files_referenced: string[];
	missing_files: string[];
	orphaned_files: string[];
	nesting: ReferenceNesting[];
	max_nesting_depth: number;
}

export interface ReferencesWarning {
	type: 'empty_directory' | 'orphaned_file' | 'nesting_depth';
	message: string;
}

export interface ReferencesError {
	type: 'missing_file';
	message: string;
}

export interface ReferencesResult {
	validation: ReferencesValidation;
	warnings: ReferencesWarning[];
	errors: ReferencesError[];
}

/**
 * Strip fenced code blocks from content to avoid parsing example links
 */
function strip_code_blocks(content: string): string {
	// Remove fenced code blocks (``` or ~~~)
	return content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
}

/**
 * Check nesting depth of reference files
 */
function check_reference_nesting(
	skill_path: string,
	file_path: string,
	visited: Set<string> = new Set(),
): { depth: number; references: string[] } {
	if (visited.has(file_path)) {
		return { depth: 0, references: [] };
	}
	visited.add(file_path);

	const full_path = join(skill_path, file_path);
	if (!existsSync(full_path)) {
		return { depth: 0, references: [] };
	}

	const content = readFileSync(full_path, 'utf-8');
	// Strip code blocks to avoid parsing example links inside them
	const content_without_code = strip_code_blocks(content);
	const reference_pattern =
		/\[([^\]]+)\]\((references\/[^)]+\.md)\)/g;
	const matches = [
		...content_without_code.matchAll(reference_pattern),
	];
	const references = matches.map((m) => m[2]);

	if (references.length === 0) {
		return { depth: 1, references: [] };
	}

	// Recursively check nested references
	let max_depth = 1;
	for (const ref of references) {
		const nested = check_reference_nesting(
			skill_path,
			ref,
			new Set(visited),
		);
		max_depth = Math.max(max_depth, 1 + nested.depth);
	}

	return { depth: max_depth, references };
}

/**
 * Validate references directory and links
 */
export function validate_references(
	skill_path: string,
): ReferencesResult {
	const references_dir = join(skill_path, 'references');
	const skill_md_path = join(skill_path, 'SKILL.md');

	const files_found: string[] = [];
	const files_referenced: string[] = [];
	const missing_files: string[] = [];
	const nesting_data: ReferenceNesting[] = [];
	const warnings: ReferencesWarning[] = [];
	const errors: ReferencesError[] = [];

	// Check references directory if it exists
	if (existsSync(references_dir)) {
		const files = readdirSync(references_dir);
		const md_files = files.filter((f) => f.endsWith('.md'));
		files_found.push(...md_files);

		if (md_files.length === 0) {
			warnings.push({
				type: 'empty_directory',
				message: 'references/ directory exists but is empty',
			});
		}

		// Check for references in SKILL.md
		if (existsSync(skill_md_path)) {
			const skill_content = readFileSync(skill_md_path, 'utf-8');

			for (const md_file of md_files) {
				if (!skill_content.includes(md_file)) {
					warnings.push({
						type: 'orphaned_file',
						message: `Reference file '${md_file}' not mentioned in SKILL.md`,
					});
				}
			}
		}
	}

	// Level 3 validation: Check that all referenced files exist
	if (existsSync(skill_md_path)) {
		const skill_content = readFileSync(skill_md_path, 'utf-8');
		// Strip code blocks to avoid parsing example links inside them
		const content_without_code = strip_code_blocks(skill_content);

		// Extract markdown links to references/ directory
		// Matches: [text](references/file.md) or [text](references/subdir/file.md)
		const reference_link_pattern =
			/\[([^\]]+)\]\((references\/[^)]+\.md)\)/g;
		const matches = content_without_code.matchAll(
			reference_link_pattern,
		);

		for (const match of matches) {
			const link_text = match[1];
			const file_path = match[2]; // e.g., "references/examples.md"
			const full_path = join(skill_path, file_path);

			files_referenced.push(file_path);

			if (!existsSync(full_path)) {
				missing_files.push(file_path);
				errors.push({
					type: 'missing_file',
					message:
						`Referenced file not found: ${file_path}\n` +
						`  → Linked from: [${link_text}]\n` +
						`  → Create the file or remove the broken link`,
				});
			} else {
				// Check nesting depth
				const nesting = check_reference_nesting(
					skill_path,
					file_path,
				);
				let warning: string | null = null;

				if (nesting.depth > 1) {
					warning = `File has depth ${nesting.depth} (recommended: 1). Keep references one level deep from SKILL.md.`;
					warnings.push({
						type: 'nesting_depth',
						message:
							`${file_path} has nesting depth ${nesting.depth} (recommended: 1)\n` +
							`  → Keep references one level deep from SKILL.md for clarity`,
					});
				}

				nesting_data.push({
					file: file_path,
					references: nesting.references,
					depth: nesting.depth,
					warning,
				});
			}
		}
	}

	// Calculate orphaned files
	const orphaned = files_found.filter(
		(f) => !files_referenced.some((ref) => ref.includes(f)),
	);

	const validation: ReferencesValidation = {
		files_found,
		files_referenced,
		missing_files,
		orphaned_files: orphaned,
		nesting: nesting_data,
		max_nesting_depth:
			nesting_data.length > 0
				? Math.max(...nesting_data.map((n) => n.depth))
				: 0,
	};

	return { validation, warnings, errors };
}
