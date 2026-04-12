import { describe, expect, it } from 'vitest';
import {
	analyze_content_structure,
	validate_content,
} from './content-validator.js';

describe('analyze_content_structure', () => {
	it('should count code blocks', () => {
		const body = '```js\ncode\n```\n\n```py\ncode\n```';
		const result = analyze_content_structure(body);
		expect(result.code_blocks).toBe(2);
	});

	it('should count sections', () => {
		const body = '# One\n## Two\n### Three';
		const result = analyze_content_structure(body);
		expect(result.sections).toBe(3);
	});

	it('should count long paragraphs', () => {
		const long = Array(150).fill('word').join(' ');
		const body = `${long}\n\nshort paragraph`;
		const result = analyze_content_structure(body);
		expect(result.long_paragraphs).toBe(1);
	});
});

describe('validate_content', () => {
	it('should pass concise content in strict mode', () => {
		const body = '## Quick Start\n\nDo the thing.\n';
		const result = validate_content(body, { mode: 'strict' });
		expect(result.errors).toHaveLength(0);
	});

	it('should error when lines exceed strict max', () => {
		const body = Array(60).fill('line').join('\n');
		const result = validate_content(body, { mode: 'strict' });
		const line_errors = result.errors.filter(
			(e) => e.type === 'line_count',
		);
		expect(line_errors).toHaveLength(1);
	});

	it('should pass same content in loose mode', () => {
		const body = Array(60).fill('line').join('\n');
		const result = validate_content(body, { mode: 'loose' });
		const line_errors = result.errors.filter(
			(e) => e.type === 'line_count',
		);
		expect(line_errors).toHaveLength(0);
	});

	it('should error when words exceed strict max', () => {
		const body = Array(1100).fill('word').join(' ');
		const result = validate_content(body, { mode: 'strict' });
		const word_errors = result.errors.filter(
			(e) => e.type === 'word_count',
		);
		expect(word_errors).toHaveLength(1);
	});

	it('should warn on missing Quick Start section', () => {
		const body = '## Usage\n\nDo the thing.\n';
		const result = validate_content(body);
		const qs_warnings = result.warnings.filter(
			(w) => w.type === 'missing_quick_start',
		);
		expect(qs_warnings).toHaveLength(1);
	});

	it('should not warn when Quick Start exists', () => {
		const body = '## Quick Start\n\nDo the thing.\n';
		const result = validate_content(body);
		const qs_warnings = result.warnings.filter(
			(w) => w.type === 'missing_quick_start',
		);
		expect(qs_warnings).toHaveLength(0);
	});

	it('should warn on TODO placeholders', () => {
		const body = '## Quick Start\n\nTODO: Add instructions\n';
		const result = validate_content(body);
		const todo_warnings = result.warnings.filter(
			(w) => w.type === 'todo_placeholders',
		);
		expect(todo_warnings).toHaveLength(1);
	});
});
