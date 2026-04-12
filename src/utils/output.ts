import {
	DESCRIPTION_MAX_LENGTH,
	LIMITS,
	TOKEN_BUDGET,
} from '../constants.js';
import type { ValidationStats } from '../types.js';

export const success = (msg: string) => console.log(`✅ ${msg}`);
export const error = (msg: string) => console.log(`❌ ${msg}`);
export const warning = (msg: string) => console.log(`⚠️  ${msg}`);
export const info = (msg: string) => console.log(`📋 ${msg}`);
export const step = (msg: string) => console.log(`  ${msg}`);
export const package_ = (msg: string) => console.log(`📦 ${msg}`);
export const upload = (msg: string) => console.log(`📤 ${msg}`);
export const search = (msg: string) => console.log(`🔍 ${msg}`);

const S = LIMITS.strict;

/**
 * Display progressive disclosure statistics
 */
export function display_validation_stats(
	stats: ValidationStats,
): void {
	console.log('\n📊 Progressive Disclosure Stats:');

	// Level 1: Description
	console.log('\n  Level 1 (Metadata - Always Loaded):');
	const desc_status =
		stats.description_length <= DESCRIPTION_MAX_LENGTH
			? '✅ Optimal'
			: '❌ Too long';

	console.log(
		`    Description: ${stats.description_length} chars, ~${stats.description_tokens} tokens ${desc_status}`,
	);
	console.log(
		`    (Target: <${DESCRIPTION_MAX_LENGTH} chars for Level 1 efficiency)`,
	);

	// Level 2: SKILL.md Body
	console.log('\n  Level 2 (SKILL.md Body - Loaded when triggered):');

	// Line count
	let line_status: string;
	if (stats.line_count <= S.lines.excellent) {
		line_status = '✅ Excellent';
	} else if (stats.line_count <= S.lines.good) {
		line_status = '✅ Good';
	} else if (stats.line_count <= S.lines.max) {
		line_status = '⚠️  Consider splitting';
	} else {
		line_status = '❌ Too large';
	}

	console.log(
		`    Lines: ${stats.line_count} (max: ${S.lines.max}) ${line_status}`,
	);

	// Word count
	let word_status: string;
	if (stats.word_count < S.words.excellent) {
		word_status = '✅ Excellent';
	} else if (stats.word_count < S.words.good) {
		word_status = '✅ Good';
	} else if (stats.word_count < S.words.max) {
		word_status = '⚠️  Consider splitting';
	} else {
		word_status = '❌ Too large';
	}

	console.log(
		`    Words: ${stats.word_count} (max: ${S.words.max}) ${word_status}`,
	);

	// Token estimation
	const token_status =
		stats.estimated_tokens < TOKEN_BUDGET
			? 'within budget'
			: 'exceeds budget';

	console.log(
		`    Est. tokens: ~${stats.estimated_tokens} (budget: <${TOKEN_BUDGET}) ${token_status}`,
	);

	// Code blocks
	const code_status =
		stats.code_blocks > 3
			? ' (recommended: 1-2)'
			: stats.code_blocks <= 2
				? ' ✅'
				: '';
	console.log(`    Code blocks: ${stats.code_blocks}${code_status}`);

	// Sections
	const section_status =
		stats.sections > 8
			? ' (recommended: 3-5)'
			: stats.sections >= 3 && stats.sections <= 5
				? ' ✅'
				: '';
	console.log(`    Sections: ${stats.sections}${section_status}`);

	// Long paragraphs
	if (stats.long_paragraphs > 0) {
		const para_status =
			stats.long_paragraphs > 3
				? ' (consider moving to references/)'
				: '';
		console.log(
			`    Long paragraphs: ${stats.long_paragraphs}${para_status}`,
		);
	}

	// Level 3 info
	console.log('\n  Level 3+ (References - Loaded as needed):');
	console.log(
		'    Use references/ directory for detailed docs (unlimited size)',
	);

	// Overall assessment (based on strict defaults)
	console.log('\n  Overall Assessment:');
	if (
		stats.line_count <= S.lines.excellent &&
		stats.description_length <= DESCRIPTION_MAX_LENGTH
	) {
		console.log('    ✅ Excellent progressive disclosure!');
	} else if (
		stats.line_count <= S.lines.max &&
		stats.description_length <= DESCRIPTION_MAX_LENGTH
	) {
		console.log('    ✅ Good progressive disclosure');
	} else if (
		stats.line_count <= LIMITS.lenient.lines.max &&
		stats.word_count < LIMITS.lenient.words.max
	) {
		console.log(
			'    ⚠️  Consider splitting content into references/',
		);
	} else {
		console.log(
			'    ❌ Violates progressive disclosure (move content to references/)',
		);
	}
}
