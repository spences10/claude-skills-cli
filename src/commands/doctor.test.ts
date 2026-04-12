import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { doctor_command } from './doctor.js';

describe('doctor_command', () => {
	let tmp_dir: string;
	let skill_path: string;
	let exit_spy: ReturnType<typeof vi.spyOn>;
	let console_log_spy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tmp_dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
		skill_path = join(tmp_dir, 'test-skill');
		mkdirSync(skill_path);
		// Prevent process.exit from actually exiting
		exit_spy = vi
			.spyOn(process, 'exit')
			.mockImplementation((() => {}) as never);
		console_log_spy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => {});
	});

	afterEach(() => {
		rmSync(tmp_dir, { recursive: true, force: true });
		exit_spy.mockRestore();
		console_log_spy.mockRestore();
	});

	it('should report no issues for valid single-line description', () => {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: A valid single line description.\n---\n# Test',
		);
		doctor_command({ skill_path });
		const output = console_log_spy.mock.calls
			.map((c: unknown[]) => c[0])
			.join('\n');
		expect(output).toContain('No issues found');
	});

	it('should fix multi-line description', () => {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: First line\n  continued here\n---\n# Test',
		);
		doctor_command({ skill_path });

		const fixed = readFileSync(join(skill_path, 'SKILL.md'), 'utf-8');
		expect(fixed).toContain('prettier-ignore');
		expect(fixed).toContain('description: First line continued here');
		expect(fixed).not.toMatch(/description:.*\n\s+continued/);
	});

	it('should report missing package dependencies', () => {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: A valid description for testing.\ndepends-on-packages: [nonexistent-pkg-xyz-999]\n---\n# Test',
		);
		doctor_command({ skill_path });
		const output = console_log_spy.mock.calls
			.map((c: unknown[]) => String(c[0]))
			.join('\n');
		expect(output).toContain('nonexistent-pkg-xyz-999');
		expect(output).toContain('Missing');
	});

	it('should not report issues for installed packages', () => {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: A valid description for testing.\ndepends-on-packages: [vitest]\n---\n# Test',
		);
		doctor_command({ skill_path });
		const output = console_log_spy.mock.calls
			.map((c: unknown[]) => String(c[0]))
			.join('\n');
		expect(output).toContain('No issues found');
	});

	it('should count issues and fixes correctly', () => {
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: First line\n  continued here\ndepends-on-packages: [nonexistent-pkg-xyz-999]\n---\n# Test',
		);
		doctor_command({ skill_path });
		const output = console_log_spy.mock.calls
			.map((c: unknown[]) => String(c[0]))
			.join('\n');
		expect(output).toContain('2 issue');
		expect(output).toContain('1 fix');
	});
});
