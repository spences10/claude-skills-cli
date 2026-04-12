import { describe, expect, it } from 'vitest';
import {
	DESCRIPTION_MAX_LENGTH,
	DESCRIPTION_MIN_LENGTH,
	LIMITS,
	LONG_PARAGRAPH_WORDS,
	MIN_BODY_LENGTH,
	NAME_MAX_LENGTH,
	TOKEN_BUDGET,
} from './constants.js';

describe('constants', () => {
	it('should have correct Anthropic spec limits', () => {
		expect(NAME_MAX_LENGTH).toBe(64);
		expect(DESCRIPTION_MAX_LENGTH).toBe(250);
	});

	it('should have sensible minimum values', () => {
		expect(DESCRIPTION_MIN_LENGTH).toBeLessThan(
			DESCRIPTION_MAX_LENGTH,
		);
		expect(MIN_BODY_LENGTH).toBeGreaterThan(0);
		expect(LONG_PARAGRAPH_WORDS).toBeGreaterThan(0);
		expect(TOKEN_BUDGET).toBeGreaterThan(0);
	});

	it('should have strict limits tighter than lenient', () => {
		expect(LIMITS.strict.lines.max).toBeLessThan(
			LIMITS.lenient.lines.max,
		);
		expect(LIMITS.strict.words.max).toBeLessThan(
			LIMITS.lenient.words.max,
		);
	});

	it('should have lenient limits tighter than loose', () => {
		expect(LIMITS.lenient.lines.max).toBeLessThan(
			LIMITS.loose.lines.max,
		);
		expect(LIMITS.lenient.words.max).toBeLessThan(
			LIMITS.loose.words.max,
		);
	});

	it('should have loose line limit at 500 per Anthropic docs', () => {
		expect(LIMITS.loose.lines.max).toBe(500);
	});
});
