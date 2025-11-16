import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
	FORCED_EVAL_HOOK_TEMPLATE,
	LLM_EVAL_HOOK_TEMPLATE,
	SIMPLE_HOOK_TEMPLATE,
} from '../core/templates.js';
import type { AddHookOptions } from '../types.js';
import { ensure_dir, make_executable } from '../utils/fs.js';
import { error, info, success, warning } from '../utils/output.js';

interface SettingsJson {
	hooks?: {
		UserPromptSubmit?: Array<{
			hooks: Array<{
				type: string;
				command: string;
			}>;
		}>;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

const HOOK_TYPES = {
	'simple-inline': {
		name: 'Simple Inline',
		success_rate: '20%',
		description: 'Echo command in settings.json',
		command:
			"echo 'INSTRUCTION: If the prompt matches any available skill keywords, use Skill(skill-name) to activate it.'",
		script: null,
	},
	'simple-script': {
		name: 'Simple Script',
		success_rate: '20%',
		description: 'Script file with basic instruction',
		command: null,
		script: 'skill-activation-simple.sh',
		template: SIMPLE_HOOK_TEMPLATE,
	},
	'forced-eval': {
		name: 'Forced Evaluation',
		success_rate: '84%',
		description: 'Mandatory 3-step evaluation process',
		command: null,
		script: 'skill-activation-forced-eval.sh',
		template: FORCED_EVAL_HOOK_TEMPLATE,
	},
	'llm-eval': {
		name: 'LLM Evaluation',
		success_rate: '80%',
		description:
			'Claude API pre-evaluation (requires ANTHROPIC_API_KEY)',
		command: null,
		script: 'skill-activation-llm-eval.sh',
		template: LLM_EVAL_HOOK_TEMPLATE,
	},
} as const;

type HookType = keyof typeof HOOK_TYPES;

export function add_hook_command(options: AddHookOptions = {}): void {
	// Default to forced-eval for best performance
	const hook_type: HookType = (options.type ||
		'forced-eval') as HookType;

	if (!HOOK_TYPES[hook_type]) {
		error(`Invalid hook type: ${hook_type}`);
		info(
			'Valid types: simple-inline, simple-script, forced-eval, llm-eval',
		);
		process.exit(1);
	}

	const hook_config = HOOK_TYPES[hook_type];

	// Determine which settings file to use
	let settings_path: string;
	let hooks_dir: string;
	let scope: string;

	if (options.local) {
		// Project-specific local (gitignored)
		settings_path = join('.claude', 'settings.local.json');
		hooks_dir = join('.claude', 'hooks');
		scope = 'project-local';
	} else if (options.project) {
		// Project-specific shared (committed)
		settings_path = join('.claude', 'settings.json');
		hooks_dir = join('.claude', 'hooks');
		scope = 'project';
	} else {
		// Global (default)
		settings_path = join(homedir(), '.claude', 'settings.json');
		hooks_dir = join(homedir(), '.claude', 'hooks');
		scope = 'global';
	}

	let settings: SettingsJson = {};

	// Check if settings.json exists
	if (existsSync(settings_path)) {
		try {
			const content = readFileSync(settings_path, 'utf-8');
			settings = JSON.parse(content);

			// Check if UserPromptSubmit hook already exists
			if (
				settings.hooks?.UserPromptSubmit &&
				Array.isArray(settings.hooks.UserPromptSubmit) &&
				settings.hooks.UserPromptSubmit.length > 0
			) {
				// Get the first (and should be only) UserPromptSubmit object
				const userPromptSubmit = settings.hooks.UserPromptSubmit[0];

				// Find existing skill activation hook (check for various patterns)
				const existing_hook = userPromptSubmit.hooks?.find(
					(h) =>
						h.type === 'command' &&
						(h.command.includes('skill-activation') ||
							h.command.includes('skill-forced-eval-hook') ||
							h.command.includes('skill-llm-eval-hook') ||
							h.command.includes('skill-simple-instruction-hook') ||
							h.command.includes(
								'If the prompt matches any available skill keywords',
							)),
				);

				if (existing_hook) {
					warning(
						`Skill activation hook already exists in ${scope} settings`,
					);
					info(`Current hook: ${existing_hook.command}`);
					console.log('');

					if (options.force) {
						info('--force flag provided, replacing existing hook...');
						// Remove the existing hook
						userPromptSubmit.hooks = userPromptSubmit.hooks?.filter(
							(h) => h !== existing_hook,
						);
					} else {
						info('No changes made.');
						info(
							'To replace, run with --force flag or manually remove the existing hook.',
						);
						return;
					}
				}
			}
		} catch (err) {
			error(`Failed to parse ${settings_path}: ${err}`);
			process.exit(1);
		}
	}

	// Determine the command to use
	let hook_command: string;

	if (hook_config.script) {
		// Script-based hook: create the script file
		const script_path = join(hooks_dir, hook_config.script);

		info(`Creating ${hook_config.name} hook script...`);

		try {
			ensure_dir(hooks_dir);

			// Write the script file
			if (hook_config.template) {
				writeFileSync(script_path, hook_config.template(), 'utf-8');
			}

			// Make it executable
			make_executable(script_path);

			success(`Script created: ${script_path}`);
		} catch (err) {
			error(`Failed to create hook script: ${err}`);
			process.exit(1);
		}

		// Use relative path for project hooks, absolute for global
		if (scope === 'global') {
			hook_command = script_path;
		} else {
			hook_command = `.claude/hooks/${hook_config.script}`;
		}
	} else {
		// Inline command
		hook_command = hook_config.command!;
	}

	// Update or create settings.json
	if (existsSync(settings_path)) {
		// Add to existing settings
		const userPromptSubmit = settings.hooks?.UserPromptSubmit?.[0];

		if (userPromptSubmit) {
			// Add to existing hooks array
			if (!userPromptSubmit.hooks) {
				userPromptSubmit.hooks = [];
			}
			userPromptSubmit.hooks.push({
				type: 'command',
				command: hook_command,
			});

			info(
				`Adding ${hook_config.name} hook to existing ${scope} settings...`,
			);
		} else {
			// Create UserPromptSubmit section
			settings.hooks = settings.hooks || {};
			settings.hooks.UserPromptSubmit = [
				{
					hooks: [
						{
							type: 'command',
							command: hook_command,
						},
					],
				},
			];

			info(`Adding ${hook_config.name} hook to ${scope} settings...`);
		}
	} else {
		// Create new settings.json
		info(
			`Creating ${scope} settings with ${hook_config.name} hook...`,
		);
		settings = {
			hooks: {
				UserPromptSubmit: [
					{
						hooks: [
							{
								type: 'command',
								command: hook_command,
							},
						],
					},
				],
			},
		};
	}

	// Write settings.json
	try {
		ensure_dir(
			scope === 'global' ? join(homedir(), '.claude') : '.claude',
		);
		writeFileSync(
			settings_path,
			JSON.stringify(settings, null, 2),
			'utf-8',
		);
		success(
			`${hook_config.name} hook added successfully! (${scope})`,
		);
		console.log('');
		info(`Settings: ${settings_path}`);
		if (hook_config.script) {
			info(`Script: ${join(hooks_dir, hook_config.script)}`);
		}
		console.log('');
		info(`Hook Type: ${hook_config.name}`);
		info(`Success Rate: ${hook_config.success_rate}`);
		info(`Description: ${hook_config.description}`);
		console.log('');

		if (hook_type === 'llm-eval') {
			warning(
				'LLM eval hook requires ANTHROPIC_API_KEY environment variable',
			);
			info('Set with: export ANTHROPIC_API_KEY=your-key-here');
			info('Falls back to simple instruction if API key not found');
			console.log('');
		}

		info('Next steps:');
		console.log(
			'  1. Create skills with: claude-skills-cli init --name <name>',
		);
		console.log(
			'  2. Validate with: claude-skills-cli validate <path>',
		);
	} catch (err) {
		error(`Failed to write ${settings_path}: ${err}`);
		process.exit(1);
	}
}
