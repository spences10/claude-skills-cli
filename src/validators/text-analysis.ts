/**
 * Text analysis utilities for skill validation
 */

/**
 * Extract body content from SKILL.md (excluding YAML frontmatter)
 */
export function extract_body(content: string): string {
	const parts = content.split('---\n');
	return parts.length >= 3
		? parts.slice(2).join('---\n').trim()
		: content;
}

/**
 * Count words in text
 */
export function count_words(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0).length;
}

/**
 * Estimate tokens (rough approximation: 1 word ≈ 1.3 tokens for English)
 */
export function estimate_tokens(word_count: number): number {
	return Math.round(word_count * 1.3);
}

/**
 * Estimate tokens for a string by counting words and applying ratio
 */
export function estimate_string_tokens(text: string): number {
	const word_count = count_words(text);
	return estimate_tokens(word_count);
}

/**
 * Remove HTML comments from content (for line counting)
 */
export function strip_html_comments(text: string): string {
	return text.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Extract keywords from text (simplified extraction)
 */
export function extract_keywords(text: string): string[] {
	const words = text
		.toLowerCase()
		.replace(/[^\w\s-]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 3);

	const unique = [...new Set(words)];
	return unique.filter(
		(w) =>
			![
				'this',
				'that',
				'with',
				'from',
				'have',
				'will',
				'when',
				'what',
				'where',
				'which',
				'their',
				'them',
				'then',
				'than',
				'these',
				'those',
				'there',
			].includes(w),
	);
}
