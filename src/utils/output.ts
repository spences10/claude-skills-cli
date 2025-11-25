import chalk from 'chalk';
import type { ValidationStats } from '../types.js';

export const success = (msg: string) => console.log(`✅ ${msg}`);
export const error = (msg: string) => console.log(`❌ ${msg}`);
export const warning = (msg: string) => console.log(`⚠️  ${msg}`);
export const info = (msg: string) => console.log(`📋 ${msg}`);
export const step = (msg: string) => console.log(`  ${msg}`);
export const package_ = (msg: string) => console.log(`📦 ${msg}`);
export const upload = (msg: string) => console.log(`📤 ${msg}`);
export const search = (msg: string) => console.log(`🔍 ${msg}`);

/**
 * Display progressive disclosure statistics with color-coded feedback
 */
export function display_validation_stats(
	stats: ValidationStats,
): void {
	console.log(chalk.cyan('\n📊 Progressive Disclosure Stats:'));

	// Level 1: Description
	console.log(chalk.bold('\n  Level 1 (Metadata - Always Loaded):'));
	const desc_status =
		stats.description_length <= 200
			? chalk.green('✅ Optimal')
			: stats.description_length <= 300
				? chalk.yellow('⚠️  Long')
				: chalk.red('❌ Too long');

	console.log(
		`    Description: ${stats.description_length} chars, ~${stats.description_tokens} tokens ${desc_status}`,
	);
	console.log(
		`    ${chalk.dim('(Target: <200 chars, <30 tokens for Level 1 efficiency)')}`,
	);

	// Level 2: SKILL.md Body
	console.log(
		chalk.bold(
			'\n  Level 2 (SKILL.md Body - Loaded when triggered):',
		),
	);

	// Line count (strict defaults: max 50)
	let line_status: string;
	if (stats.line_count <= 30) {
		line_status = chalk.green('✅ Excellent');
	} else if (stats.line_count <= 40) {
		line_status = chalk.green('✅ Good');
	} else if (stats.line_count <= 50) {
		line_status = chalk.yellow('⚠️  Consider splitting');
	} else {
		line_status = chalk.red('❌ Too large');
	}

	console.log(
		`    Lines: ${stats.line_count} (max: 50) ${line_status}`,
	);

	// Word count with recommendations (strict defaults: max 1000)
	let word_status: string;
	if (stats.word_count < 300) {
		word_status = chalk.green('✅ Excellent');
	} else if (stats.word_count < 500) {
		word_status = chalk.green('✅ Good');
	} else if (stats.word_count < 1000) {
		word_status = chalk.yellow('⚠️  Consider splitting');
	} else {
		word_status = chalk.red('❌ Too large');
	}

	console.log(
		`    Words: ${stats.word_count} (max: 1000) ${word_status}`,
	);

	// Token estimation
	const token_budget = 6500; // Level 2 budget (~5000 words * 1.3)
	const token_status =
		stats.estimated_tokens < token_budget
			? chalk.green('within budget')
			: chalk.red('exceeds budget');

	console.log(
		`    Est. tokens: ~${stats.estimated_tokens} (budget: <${token_budget}) ${token_status}`,
	);

	// Code blocks
	const code_status =
		stats.code_blocks > 3
			? chalk.yellow(' (recommended: 1-2)')
			: stats.code_blocks <= 2
				? chalk.green(' ✅')
				: '';
	console.log(`    Code blocks: ${stats.code_blocks}${code_status}`);

	// Sections
	const section_status =
		stats.sections > 8
			? chalk.yellow(' (recommended: 3-5)')
			: stats.sections >= 3 && stats.sections <= 5
				? chalk.green(' ✅')
				: '';
	console.log(`    Sections: ${stats.sections}${section_status}`);

	// Long paragraphs
	if (stats.long_paragraphs > 0) {
		const para_status =
			stats.long_paragraphs > 3
				? chalk.yellow(' (consider moving to references/)')
				: '';
		console.log(
			`    Long paragraphs: ${stats.long_paragraphs}${para_status}`,
		);
	}

	// Level 3 info
	console.log(
		chalk.bold('\n  Level 3+ (References - Loaded as needed):'),
	);
	console.log(
		`    ${chalk.dim('Use references/ directory for detailed docs (unlimited size)')}`,
	);

	// Overall assessment (based on strict defaults)
	console.log(chalk.bold('\n  Overall Assessment:'));
	if (stats.line_count <= 30 && stats.description_length <= 200) {
		console.log(
			chalk.green('    ✅ Excellent progressive disclosure!'),
		);
	} else if (
		stats.line_count <= 50 &&
		stats.description_length <= 300
	) {
		console.log(chalk.green('    ✅ Good progressive disclosure'));
	} else if (stats.line_count <= 150 && stats.word_count < 5000) {
		console.log(
			chalk.yellow(
				'    ⚠️  Consider splitting content into references/',
			),
		);
	} else {
		console.log(
			chalk.red(
				'    ❌ Violates progressive disclosure (move content to references/)',
			),
		);
	}
}
