/**
 * Content validation (Level 2 progressive disclosure)
 */

import {
	count_words,
	estimate_tokens,
	strip_html_comments,
} from './text-analysis.js';

export interface ContentStats {
	word_count: number;
	estimated_tokens: number;
	line_count: number;
	code_blocks: number;
	sections: number;
	long_paragraphs: number;
}

export interface ContentWarning {
	type:
		| 'word_count'
		| 'line_count'
		| 'code_blocks'
		| 'long_paragraphs'
		| 'sections'
		| 'missing_quick_start'
		| 'no_references'
		| 'short_body'
		| 'todo_placeholders';
	message: string;
}

export interface ContentError {
	type: 'word_count' | 'line_count';
	message: string;
}

export interface ContentValidation {
	stats: ContentStats;
	warnings: ContentWarning[];
	errors: ContentError[];
}

// Progressive disclosure limits (enforced as hard limits)
const MAX_WORDS = 1000; // Hard limit (was recommended)
const RECOMMENDED_WORDS = 500; // Warning threshold

/**
 * Analyze content structure and patterns
 */
export function analyze_content_structure(
	body: string,
): Pick<
	ContentStats,
	'code_blocks' | 'sections' | 'long_paragraphs'
> {
	// Count code blocks
	const code_block_matches = body.match(/```[\s\S]*?```/g);
	const code_blocks = code_block_matches
		? code_block_matches.length
		: 0;

	// Count markdown sections (headings)
	const heading_matches = body.match(/^#{1,6}\s/gm);
	const sections = heading_matches ? heading_matches.length : 0;

	// Count long paragraphs (>100 words)
	const paragraphs = body.split(/\n\n+/);
	const long_paragraphs = paragraphs.filter((p) => {
		const words = count_words(p);
		return words > 100;
	}).length;

	return { code_blocks, sections, long_paragraphs };
}

/**
 * Validate progressive disclosure (word count, token budget, and line count)
 */
export function validate_content(body: string): ContentValidation {
	const word_count = count_words(body);
	const estimated_tokens = estimate_tokens(word_count);

	// Strip HTML comments before counting lines (progressive disclosure guidance shouldn't inflate count)
	const body_without_comments = strip_html_comments(body);
	const line_count = body_without_comments.trim().split('\n').length;

	// Analyze content structure
	const structure = analyze_content_structure(body);

	const validation: ContentValidation = {
		stats: {
			word_count,
			estimated_tokens,
			line_count,
			...structure,
		},
		warnings: [],
		errors: [],
	};

	// Hard limit check (error) - enforced at 1000 words
	if (word_count > MAX_WORDS) {
		validation.errors.push({
			type: 'word_count',
			message:
				`SKILL.md body has ${word_count} words (MAX: ${MAX_WORDS})\n` +
				`  → Move detailed content to references/ directory for Level 3 loading\n` +
				`  → This is a hard limit - skills must be concise`,
		});
	}
	// Warning threshold at 500 words
	else if (word_count > RECOMMENDED_WORDS) {
		validation.warnings.push({
			type: 'word_count',
			message:
				`SKILL.md body has ${word_count} words (recommended: <${RECOMMENDED_WORDS}, max: ${MAX_WORDS})\n` +
				`  → Consider moving examples/docs to references/ for better token efficiency`,
		});
	}

	// Line count validation (Level 2 progressive disclosure)
	// Hard limit: 50 lines (enforced)
	if (line_count > 50) {
		validation.errors.push({
			type: 'line_count',
			message:
				`SKILL.md body is ${line_count} lines (MAX: 50 for Level 2 progressive disclosure)\n` +
				`  → Move detailed content to references/ directory\n` +
				`  → This is a hard limit - skills must be concise`,
		});
	} else if (line_count > 40) {
		validation.warnings.push({
			type: 'line_count',
			message:
				`SKILL.md body is ${line_count} lines (recommended: ~40, max: 50)\n` +
				`  → Consider moving examples to references/ for Level 3 loading`,
		});
	}

	// Content analysis warnings
	// Code blocks: Recommend 1-2, warn at >3
	if (structure.code_blocks > 3) {
		validation.warnings.push({
			type: 'code_blocks',
			message:
				`SKILL.md contains ${structure.code_blocks} code examples (recommended: 1-2)\n` +
				`  → Move additional examples to references/examples.md for Level 3 loading`,
		});
	}

	// Long paragraphs
	if (structure.long_paragraphs > 3) {
		validation.warnings.push({
			type: 'long_paragraphs',
			message:
				`SKILL.md contains ${structure.long_paragraphs} lengthy paragraphs (>100 words)\n` +
				`  → Consider moving detailed explanations to references/`,
		});
	}

	// Sections: Recommend 3-5, warn at >8
	if (structure.sections > 8) {
		validation.warnings.push({
			type: 'sections',
			message:
				`SKILL.md contains ${structure.sections} sections (recommended: 3-5)\n` +
				`  → Consider splitting into focused reference files`,
		});
	}

	// Check for "Quick Start" section
	if (
		!body.includes('## Quick Start') &&
		!body.includes('## Quick start')
	) {
		validation.warnings.push({
			type: 'missing_quick_start',
			message:
				`Missing "## Quick Start" section\n` +
				`  → Add one minimal working example to help Claude get started quickly`,
		});
	}

	// Check for references/ links when body is long
	const has_references = body.includes('references/');
	if (!has_references && line_count > 60) {
		validation.warnings.push({
			type: 'no_references',
			message:
				`No references/ links found but SKILL.md is ${line_count} lines\n` +
				`  → Consider splitting detailed content into reference files`,
		});
	}

	// Check body content
	if (body.trim().length < 100) {
		validation.warnings.push({
			type: 'short_body',
			message: 'SKILL.md body is very short',
		});
	}

	// Check for TODO placeholders
	if (
		body.includes('TODO') ||
		body.includes('[Add your') ||
		body.includes('[Provide')
	) {
		validation.warnings.push({
			type: 'todo_placeholders',
			message: 'SKILL.md contains TODO placeholders',
		});
	}

	return validation;
}
