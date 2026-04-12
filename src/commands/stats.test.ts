import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { classify_complexity } from './stats.js';

describe('classify_complexity', () => {
	let tmp_dir: string;

	beforeEach(() => {
		tmp_dir = mkdtempSync(join(tmpdir(), 'stats-test-'));
	});

	afterEach(() => {
		rmSync(tmp_dir, { recursive: true, force: true });
	});

	function make_skill(
		dirs: string[],
		files?: Record<string, string>,
	): string {
		const skill_path = join(tmp_dir, 'test-skill');
		mkdirSync(skill_path, { recursive: true });
		writeFileSync(
			join(skill_path, 'SKILL.md'),
			'---\nname: test-skill\ndescription: Test\n---\n# Test',
		);

		for (const dir of dirs) {
			mkdirSync(join(skill_path, dir), { recursive: true });
		}

		if (files) {
			for (const [path, content] of Object.entries(files)) {
				writeFileSync(join(skill_path, path), content);
			}
		}

		return skill_path;
	}

	it('should classify SKILL.md-only as simple', () => {
		const path = make_skill([]);
		expect(classify_complexity(path)).toBe('simple');
	});

	it('should classify empty references dir as simple', () => {
		const path = make_skill(['references']);
		expect(classify_complexity(path)).toBe('simple');
	});

	it('should classify populated references as standard', () => {
		const path = make_skill(['references'], {
			'references/guide.md': '# Guide',
		});
		expect(classify_complexity(path)).toBe('standard');
	});

	it('should classify scripts dir with files as standard', () => {
		const path = make_skill(['scripts'], {
			'scripts/run.sh': '#!/bin/bash\necho hello',
		});
		expect(classify_complexity(path)).toBe('standard');
	});

	it('should classify assets with files as advanced', () => {
		const path = make_skill(['assets'], {
			'assets/logo.png': 'fake-png-data',
		});
		expect(classify_complexity(path)).toBe('advanced');
	});

	it('should classify scripts + references as advanced', () => {
		const path = make_skill(['scripts', 'references'], {
			'scripts/run.sh': '#!/bin/bash',
			'references/guide.md': '# Guide',
		});
		expect(classify_complexity(path)).toBe('advanced');
	});

	it('should classify >2 scripts as advanced', () => {
		const path = make_skill(['scripts'], {
			'scripts/a.sh': '#!/bin/bash',
			'scripts/b.sh': '#!/bin/bash',
			'scripts/c.sh': '#!/bin/bash',
		});
		expect(classify_complexity(path)).toBe('advanced');
	});

	it('should classify 2 scripts without references as standard', () => {
		const path = make_skill(['scripts'], {
			'scripts/a.sh': '#!/bin/bash',
			'scripts/b.sh': '#!/bin/bash',
		});
		expect(classify_complexity(path)).toBe('standard');
	});

	it('should classify empty scripts dir as simple', () => {
		const path = make_skill(['scripts']);
		expect(classify_complexity(path)).toBe('simple');
	});
});
