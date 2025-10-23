/**
 * Alignment validation - checks description and content alignment
 */

import { extract_keywords } from './text-analysis.js';
import type { KeywordAnalysis, AlignmentAnalysis } from '../types.js';

export interface AlignmentWarning {
	type: 'low_overlap';
	message: string;
}

export interface AlignmentValidation {
	keywords: KeywordAnalysis;
	alignment: AlignmentAnalysis;
	warnings: AlignmentWarning[];
}

/**
 * Analyze description and content alignment
 */
export function analyze_alignment(
	description: string,
	body: string,
): AlignmentValidation {
	const desc_keywords = extract_keywords(description);
	const content_keywords = extract_keywords(body);

	const overlap = desc_keywords.filter((k) =>
		content_keywords.includes(k),
	);
	const desc_only = desc_keywords.filter(
		(k) => !content_keywords.includes(k),
	);
	const content_only = content_keywords
		.filter((k) => !desc_keywords.includes(k))
		.slice(0, 20);

	const overlap_ratio =
		desc_keywords.length > 0
			? overlap.length / desc_keywords.length
			: 0;

	let severity: 'good' | 'moderate' | 'critical' = 'good';
	let explanation = 'Description aligns well with content';

	if (overlap_ratio < 0.2 && desc_keywords.length > 5) {
		severity = 'critical';
		explanation = `Very low keyword overlap (${Math.round(overlap_ratio * 100)}%). Description may not match skill content.`;
	} else if (overlap_ratio < 0.3 && desc_keywords.length > 5) {
		severity = 'moderate';
		explanation = `Low keyword overlap (${Math.round(overlap_ratio * 100)}%). Description may not accurately reflect skill content.`;
	}

	const keywords: KeywordAnalysis = {
		description_keywords: desc_keywords,
		content_keywords: content_keywords.slice(0, 30),
		overlap,
		description_only: desc_only,
		content_only,
	};

	const alignment: AlignmentAnalysis = {
		severity,
		description_focus: desc_keywords.slice(0, 10),
		content_focus: content_keywords.slice(0, 10),
		matches: overlap,
		mismatches: desc_only,
		explanation,
	};

	const warnings: AlignmentWarning[] = [];

	if (overlap_ratio < 0.3 && desc_keywords.length > 5) {
		warnings.push({
			type: 'low_overlap',
			message:
				`Low keyword overlap between description and content (${Math.round(overlap_ratio * 100)}%)\n` +
				`  → Description may not accurately reflect skill content`,
		});
	}

	return { keywords, alignment, warnings };
}
