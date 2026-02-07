#!/usr/bin/env node

import { add_hook_command } from './commands/add-hook.js';
import { doctor_command } from './commands/doctor.js';
import { init_command } from './commands/init.js';
import { install_command } from './commands/install.js';
import { package_command } from './commands/package.js';
import { stats_command } from './commands/stats.js';
import { validate_command } from './commands/validate.js';
import {
	ADD_HOOK_HELP,
	DOCTOR_HELP,
	INIT_HELP,
	INSTALL_HELP,
	PACKAGE_HELP,
	STATS_HELP,
	VALIDATE_HELP,
	show_command_help,
	show_main_help,
} from './help.js';

const args = process.argv.slice(2);
const command = args[0];

function parse_args(
	args: string[],
): Record<string, string | boolean> {
	const parsed: Record<string, string | boolean> = {};
	const positional: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith('--')) {
			const key = arg.substring(2);
			const next = args[i + 1];

			if (next && !next.startsWith('--')) {
				parsed[key] = next;
				i++;
			} else {
				parsed[key] = true;
			}
		} else if (arg.startsWith('-') && arg.length === 2) {
			const key = arg.substring(1);
			const next = args[i + 1];

			if (next && !next.startsWith('-')) {
				parsed[key] = next;
				i++;
			} else {
				parsed[key] = true;
			}
		} else {
			positional.push(arg);
		}
	}

	if (positional.length > 0) {
		parsed._positional = positional.join(' ');
	}

	return parsed;
}

async function main() {
	if (!command || command === '--help' || command === '-h') {
		const parsed = parse_args(args.slice(1));
		show_main_help(parsed.format as string);
		process.exit(0);
	}

	if (command === '--version' || command === '-v') {
		console.log('claude-skills-cli v0.0.1');
		process.exit(0);
	}

	const parsed = parse_args(args.slice(1));

	switch (command) {
		case 'init':
			if (parsed.help === true || parsed.h === true) {
				show_command_help(INIT_HELP, parsed.format as string);
				process.exit(0);
			}
			init_command({
				name: parsed.name as string | undefined,
				description: parsed.description as string | undefined,
				path: parsed.path as string | undefined,
				with_examples: parsed['with-examples'] === true,
			});
			break;

		case 'install': {
			if (parsed.help === true || parsed.h === true) {
				show_command_help(INSTALL_HELP, parsed.format as string);
				process.exit(0);
			}
			const skill_name = parsed._positional as string;
			install_command({
				skill_name,
				force: parsed.force === true,
			});
			break;
		}

		case 'validate': {
			const skill_path = parsed._positional as string;
			if (parsed.help === true || parsed.h === true) {
				show_command_help(VALIDATE_HELP, parsed.format as string);
				process.exit(0);
			}
			if (!skill_path) {
				console.error('Error: skill path required');
				console.log(
					'\nUsage: claude-skills-cli validate <skill_path> [--format json] [--strict] [--lenient] [--loose]',
				);
				process.exit(1);
			}
			const format = parsed.format as string | undefined;
			validate_command({
				skill_path,
				strict: parsed.strict === true,
				format: format === 'json' ? 'json' : 'text',
				lenient: parsed.lenient === true,
				loose: parsed.loose === true,
			});
			break;
		}

		case 'doctor': {
			if (parsed.help === true || parsed.h === true) {
				show_command_help(DOCTOR_HELP, parsed.format as string);
				process.exit(0);
			}
			const skill_path = parsed._positional as string;
			if (!skill_path) {
				console.error('Error: skill path required');
				console.log('\nUsage: claude-skills-cli doctor <skill_path>');
				process.exit(1);
			}
			doctor_command({
				skill_path,
			});
			break;
		}

		case 'package': {
			const skill_path = parsed._positional as string;
			if (parsed.help === true || parsed.h === true) {
				show_command_help(PACKAGE_HELP, parsed.format as string);
				process.exit(0);
			}
			if (!skill_path) {
				console.error('Error: skill path required');
				console.log(
					'\nUsage: claude-skills-cli package <skill_path>',
				);
				process.exit(1);
			}
			await package_command({
				skill_path,
				output: parsed.output as string | undefined,
				skip_validation: parsed['skip-validation'] === true,
			});
			break;
		}

		case 'stats': {
			if (parsed.help === true || parsed.h === true) {
				show_command_help(STATS_HELP, parsed.format as string);
				process.exit(0);
			}
			const directory = parsed._positional as string | undefined;
			stats_command({
				directory,
			});
			break;
		}

		case 'add-hook':
			if (parsed.help === true || parsed.h === true) {
				show_command_help(ADD_HOOK_HELP, parsed.format as string);
				process.exit(0);
			}
			add_hook_command({
				local: parsed.local === true,
				project: parsed.project === true,
				type: parsed.type as
					| 'simple-inline'
					| 'simple-script'
					| 'forced-eval'
					| 'llm-eval'
					| undefined,
				force: parsed.force === true,
			});
			break;

		default:
			console.error(`Unknown command: ${command}`);
			console.log('');
			show_main_help(parsed.format as string);
			process.exit(1);
	}
}

main().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
