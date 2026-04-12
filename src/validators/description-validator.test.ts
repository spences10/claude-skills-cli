import { describe, expect, it } from 'vitest';
import {
	analyze_trigger_phrase,
	analyze_user_phrasing,
	validate_description_content,
} from './description-validator.js';

describe('validate_description_content', () => {
	it('should pass a good description', () => {
		const result = validate_description_content(
			'Validates SKILL.md files for correctness. Use when creating or editing skills.',
		);
		expect(result.errors).toHaveLength(0);
	});

	it('should error when description exceeds 250 chars', () => {
		const long_desc = 'a'.repeat(251);
		const result = validate_description_content(long_desc);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].type).toBe('length');
	});

	it('should pass at exactly 250 chars', () => {
		const desc = 'a'.repeat(250);
		const result = validate_description_content(desc);
		const length_errors = result.errors.filter(
			(e) => e.type === 'length',
		);
		expect(length_errors).toHaveLength(0);
	});

	it('should warn when missing trigger keywords', () => {
		const result = validate_description_content(
			'Processes PDF files and extracts text content from them.',
		);
		const trigger_warnings = result.warnings.filter(
			(w) => w.type === 'trigger',
		);
		expect(trigger_warnings).toHaveLength(1);
	});

	it('should not warn when trigger keyword present', () => {
		const result = validate_description_content(
			'Processes PDF files. Use when working with PDFs.',
		);
		const trigger_warnings = result.warnings.filter(
			(w) => w.type === 'trigger',
		);
		expect(trigger_warnings).toHaveLength(0);
	});

	it('should warn on very short description', () => {
		const result = validate_description_content('Short.');
		const short_warnings = result.warnings.filter(
			(w) => w.type === 'short',
		);
		expect(short_warnings).toHaveLength(1);
	});
});

describe('analyze_trigger_phrase', () => {
	it('should detect "Use when" trigger', () => {
		const result = analyze_trigger_phrase(
			'Does things. Use when building APIs.',
		);
		expect(result.has_explicit_trigger).toBe(true);
		expect(result.trigger_phrase).toContain('Use when');
	});

	it('should detect "Use for" trigger', () => {
		const result = analyze_trigger_phrase(
			'Does things. Use for testing code.',
		);
		expect(result.has_explicit_trigger).toBe(true);
	});

	it('should report missing trigger', () => {
		const result = analyze_trigger_phrase(
			'Just a plain description.',
		);
		expect(result.has_explicit_trigger).toBe(false);
		expect(result.trigger_type).toBe('missing');
	});
});

describe('analyze_user_phrasing', () => {
	it('should warn on first person', () => {
		const { warnings } = analyze_user_phrasing(
			'I can help you write code.',
		);
		const fp = warnings.filter((w) => w.type === 'first_person');
		expect(fp).toHaveLength(1);
	});

	it('should warn on second person', () => {
		const { warnings } = analyze_user_phrasing(
			'You can use this to build apps.',
		);
		const sp = warnings.filter((w) => w.type === 'second_person');
		expect(sp).toHaveLength(1);
	});

	it('should not warn on third person', () => {
		const { warnings } = analyze_user_phrasing(
			'Generates commit messages from git diffs.',
		);
		const person_warnings = warnings.filter(
			(w) => w.type === 'first_person' || w.type === 'second_person',
		);
		expect(person_warnings).toHaveLength(0);
	});

	it('should warn on vague terms', () => {
		const { warnings } = analyze_user_phrasing(
			'A helper utility for various tasks.',
		);
		const vague = warnings.filter((w) => w.type === 'vague');
		expect(vague.length).toBeGreaterThan(0);
	});
});
