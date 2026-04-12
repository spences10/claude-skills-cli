/**
 * Anthropic skill spec limits
 * https://code.claude.com/docs/en/skills#frontmatter-reference
 */

/** Max chars for skill name field */
export const NAME_MAX_LENGTH = 64;

/** Max chars for description — Claude truncates at this limit in skill listing */
export const DESCRIPTION_MAX_LENGTH = 250;

/** Min recommended chars for description to be useful */
export const DESCRIPTION_MIN_LENGTH = 50;

/** Token budget for Level 2 content (~5000 words * 1.3) */
export const TOKEN_BUDGET = 6500;

/** Words per paragraph before it's considered "long" */
export const LONG_PARAGRAPH_WORDS = 100;

/** Min body length (chars) before warning about short content */
export const MIN_BODY_LENGTH = 100;

/**
 * Progressive disclosure limits — three tiers for SKILL.md body
 *
 * strict:  opinionated defaults for minimal context usage
 * lenient: relaxed for larger skills
 * loose:   matches Anthropic official limits (500 lines)
 */
export const LIMITS = {
	strict: {
		lines: { excellent: 30, good: 40, max: 50 },
		words: { excellent: 300, good: 500, max: 1000 },
	},
	lenient: {
		lines: { excellent: 50, good: 100, max: 150 },
		words: { excellent: 500, good: 1000, max: 2000 },
	},
	loose: {
		lines: { excellent: 100, good: 200, max: 500 },
		words: { excellent: 1000, good: 2000, max: 5000 },
	},
} as const;

/** Semver format regex for version field validation */
export const SEMVER_REGEX =
	/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/;
