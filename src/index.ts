#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
);

const main = defineCommand({
	meta: {
		name: 'claude-skills-cli',
		version: pkg.version,
		description:
			'CLI toolkit for creating and managing Claude Agent Skills\n\nIMPORTANT FOR LLMs:\n  ALWAYS run validate after creating or editing a skill:\n    claude-skills-cli validate <skill-path>\n  Skills MUST pass validation before use.\n  Fix all errors immediately. Address warnings promptly.\n\nResources:\n  Pre-built skills: https://github.com/spences10/claude-code-toolkit',
	},
	subCommands: {
		init: () =>
			import('./commands/init.cmd.js').then((r) => r.default),
		install: () =>
			import('./commands/install.cmd.js').then((r) => r.default),
		validate: () =>
			import('./commands/validate.cmd.js').then((r) => r.default),
		doctor: () =>
			import('./commands/doctor.cmd.js').then((r) => r.default),
		package: () =>
			import('./commands/package.cmd.js').then((r) => r.default),
		stats: () =>
			import('./commands/stats.cmd.js').then((r) => r.default),
		'add-hook': () =>
			import('./commands/add-hook.cmd.js').then((r) => r.default),
	},
});

runMain(main);
