/**
 * Description validation (Level 1 progressive disclosure)
 */

import {
	DESCRIPTION_MAX_LENGTH,
	DESCRIPTION_MIN_LENGTH,
} from '../constants.js';
import type {
	TriggerPhraseAnalysis,
	UserPhrasingAnalysis,
} from '../types.js';
import { estimate_string_tokens } from './text-analysis.js';

export interface DescriptionStats {
	description_length: number;
	description_tokens: number;
}

export interface DescriptionWarning {
	type:
		| 'length'
		| 'trigger'
		| 'list_bloat'
		| 'short'
		| 'first_person'
		| 'second_person'
		| 'vague'
		| 'passive';
	message: string;
}

export interface DescriptionError {
	type: 'length';
	message: string;
}

export interface DescriptionValidation {
	stats: DescriptionStats;
	warnings: DescriptionWarning[];
	errors: DescriptionError[];
}

/**
 * Validate description length and quality
 */
export function validate_description_content(
	description: string,
): DescriptionValidation {
	const desc_length = description.length;
	const desc_tokens = estimate_string_tokens(description);

	const validation: DescriptionValidation = {
		stats: {
			description_length: desc_length,
			description_tokens: desc_tokens,
		},
		warnings: [],
		errors: [],
	};

	// Enforced limit: Claude truncates descriptions at this limit in skill listing
	if (desc_length > DESCRIPTION_MAX_LENGTH) {
		validation.errors.push({
			type: 'length',
			message:
				`Description is ${desc_length} characters (MAX: ${DESCRIPTION_MAX_LENGTH} — Claude truncates at this limit)\n` +
				`  → Keep descriptions concise - anything past ${DESCRIPTION_MAX_LENGTH} chars is never seen`,
		});
	}

	// Check for trigger keywords
	const lower_desc = description.toLowerCase();
	const has_trigger =
		lower_desc.includes('use when') ||
		lower_desc.includes('use for') ||
		lower_desc.includes('use to');

	if (!has_trigger) {
		validation.warnings.push({
			type: 'trigger',
			message:
				`Description missing trigger keywords ('Use when...', 'Use for...', 'Use to...')\n` +
				`  → Help Claude know when to activate this skill`,
		});
	}

	// Check for list bloat (multiple commas indicating detailed lists)
	// Only warn if BOTH long description AND many commas (allows concise technical lists)
	const comma_count = (description.match(/,/g) || []).length;
	if (desc_length > 150 && comma_count >= 5) {
		validation.warnings.push({
			type: 'list_bloat',
			message:
				`Description contains long lists (${comma_count} commas, ${desc_length} chars)\n` +
				`  → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)`,
		});
	}

	// Short description check
	if (desc_length < DESCRIPTION_MIN_LENGTH) {
		validation.warnings.push({
			type: 'short',
			message:
				`Description is very short (${desc_length} chars, minimum recommended: ${DESCRIPTION_MIN_LENGTH})\n` +
				`  → Must answer both "what does it do" AND "when to use it"`,
		});
	}

	return validation;
}

/**
 * Analyze trigger phrase in description
 */
export function analyze_trigger_phrase(
	description: string,
): TriggerPhraseAnalysis {
	const lower = description.toLowerCase();
	const has_trigger =
		lower.includes('use when') ||
		lower.includes('use for') ||
		lower.includes('use to');

	let trigger_phrase: string | null = null;
	let trigger_type: 'specific' | 'generic' | 'missing' = 'missing';

	if (has_trigger) {
		const match = description.match(
			/(use when|use for|use to)[^.!?]*/i,
		);
		if (match) {
			trigger_phrase = match[0].trim();
			trigger_type =
				trigger_phrase.length > 50 ? 'specific' : 'generic';
		}
	}

	return {
		has_explicit_trigger: has_trigger,
		trigger_phrase,
		trigger_type,
	};
}

/**
 * Analyze user phrasing style
 */
export function analyze_user_phrasing(description: string): {
	analysis: UserPhrasingAnalysis;
	warnings: DescriptionWarning[];
} {
	const issues: Array<{
		type: 'first_person' | 'passive_voice' | 'vague';
		text: string;
		suggestion: string;
	}> = [];
	const warnings: DescriptionWarning[] = [];

	// Check for first person
	const is_third_person = !/\b(I can|I will|I help|my|me)\b/i.test(
		description,
	);
	const first_person_patterns = /\b(I can|I will|I help|my|me)\b/i;
	if (first_person_patterns.test(description)) {
		const match = description.match(first_person_patterns);
		if (match) {
			warnings.push({
				type: 'first_person',
				message:
					`Description uses first person: "${match[0]}"\n` +
					`  → Anthropic requires third-person voice (e.g., "Generates..." not "I can generate...")`,
			});
		}
	}

	// Check for second person
	const second_person_patterns =
		/\b(You can|You should|You could|You'll|You will|You need|your)\b/i;
	if (second_person_patterns.test(description)) {
		const match = description.match(second_person_patterns);
		if (match) {
			warnings.push({
				type: 'second_person',
				message:
					`Description uses second person: "${match[0]}"\n` +
					`  → Anthropic requires third-person voice (e.g., "Processes..." not "You can process...")`,
			});
		}
	}

	// Check for vague terms
	const vague_patterns =
		/\b(helper|utility|tool|various|several|some)\b/i;
	if (vague_patterns.test(description)) {
		const match = description.match(vague_patterns);
		if (match) {
			warnings.push({
				type: 'vague',
				message:
					`Description contains vague term: "${match[0]}"\n` +
					`  → Be specific about what the skill does`,
			});
		}
	}

	// Check for gerund form (verbs ending in -ing)
	const uses_gerund = /\b\w+ing\b/i.test(description);

	// Check for action-oriented (starts with action verbs)
	const action_verbs =
		/^(create|build|design|analyze|test|validate|generate|process|manage|execute|handle|provide)/i;
	const is_action_oriented = action_verbs.test(description.trim());

	// Suggest action-oriented language if neither gerund nor action verb
	if (!uses_gerund && !is_action_oriented) {
		warnings.push({
			type: 'passive',
			message:
				`Description lacks action-oriented language\n` +
				`  → Start with a verb or gerund (e.g., "Generates...", "Managing...", "Extract...")`,
		});
	}

	const analysis: UserPhrasingAnalysis = {
		style_checks: {
			is_third_person,
			uses_gerund_form: uses_gerund,
			is_action_oriented,
		},
		issues,
	};

	return { analysis, warnings };
}
