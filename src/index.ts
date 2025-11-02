#!/usr/bin/env node

import { doctor_command } from './commands/doctor.js';
import { init_command } from './commands/init.js';
import { install_command } from './commands/install.js';
import { package_command } from './commands/package.js';
import { stats_command } from './commands/stats.js';
import { validate_command } from './commands/validate.js';

const args = process.argv.slice(2);
const command = args[0];

function show_help(): void {
	console.log(
		'claude-skills-cli - CLI toolkit for creating Claude Agent Skills\n',
	);
	console.log('Usage:');
	console.log('  claude-skills-cli <command> [options]\n');
	console.log('Commands:');
	console.log('  init        Create a new skill');
	console.log(
		'  install     Install a bundled skill (e.g., skill-creator)',
	);
	console.log('  validate    Validate a skill');
	console.log('  doctor      Fix common skill issues automatically');
	console.log('  package     Package a skill to zip');
	console.log(
		'  stats       Show overview of all skills in a directory\n',
	);
	console.log('Options:');
	console.log('  --help, -h          Show help');
	console.log('  --version, -v       Show version');
	console.log(
		'  --with-examples     Include example files when creating skill',
	);
	console.log(
		'  --format <type>     Output format: text (default) or json',
	);
	console.log(
		'  --strict            Fail validation if warnings present\n',
	);
	console.log('Examples:');
	console.log(
		'  claude-skills-cli init --name my-skill --description "Description"',
	);
	console.log(
		'  claude-skills-cli init --name my-skill --description "..." --with-examples',
	);
	console.log('  claude-skills-cli install skill-creator');
	console.log('  claude-skills-cli validate .claude/skills/my-skill');
	console.log(
		'  claude-skills-cli validate .claude/skills/my-skill --format json',
	);
	console.log(
		'  claude-skills-cli validate .claude/skills/my-skill --strict',
	);
	console.log('  claude-skills-cli doctor .claude/skills/my-skill');
	console.log('  claude-skills-cli package .claude/skills/my-skill');
	console.log('  claude-skills-cli stats .claude/skills');
	console.log('\n⚠️  IMPORTANT FOR LLMs:');
	console.log(
		'  ALWAYS run validate after creating or editing a skill:',
	);
	console.log('    claude-skills-cli validate <skill-path>');
	console.log('  Skills MUST pass validation before use.');
	console.log(
		'  Fix all errors immediately. Address warnings promptly.',
	);
}

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
		show_help();
		process.exit(0);
	}

	if (command === '--version' || command === '-v') {
		console.log('claude-skills-cli v0.0.1');
		process.exit(0);
	}

	const parsed = parse_args(args.slice(1));

	switch (command) {
		case 'init':
			init_command({
				name: parsed.name as string | undefined,
				description: parsed.description as string | undefined,
				path: parsed.path as string | undefined,
				with_examples: parsed['with-examples'] === true,
			});
			break;

		case 'install': {
			const skill_name = parsed._positional as string;
			install_command({
				skill_name,
				force: parsed.force === true,
			});
			break;
		}

		case 'validate': {
			const skill_path = parsed._positional as string;
			if (!skill_path) {
				console.error('Error: skill path required');
				console.log(
					'\nUsage: claude-skills-cli validate <skill_path> [--format json] [--strict]',
				);
				process.exit(1);
			}
			const format = parsed.format as string | undefined;
			validate_command({
				skill_path,
				strict: parsed.strict === true,
				format: format === 'json' ? 'json' : 'text',
			});
			break;
		}

		case 'doctor': {
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
			const directory = parsed._positional as string | undefined;
			stats_command({
				directory,
			});
			break;
		}

		default:
			console.error(`Unknown command: ${command}`);
			console.log('');
			show_help();
			process.exit(1);
	}
}

main().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
