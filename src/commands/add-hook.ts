import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ensure_dir } from '../utils/fs.js';
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

interface AddHookOptions {
	local?: boolean;
	project?: boolean;
}

const HOOK_COMMAND =
	"echo '💡 Check .claude/skills/ for relevant skills before responding!'";

export function add_hook_command(options: AddHookOptions = {}): void {
	// Determine which settings file to use
	let settings_path: string;
	let scope: string;

	if (options.local) {
		// Project-specific local (gitignored)
		settings_path = join('.claude', 'settings.local.json');
		scope = 'project-local';
	} else if (options.project) {
		// Project-specific shared (committed)
		settings_path = join('.claude', 'settings.json');
		scope = 'project';
	} else {
		// Global (default)
		settings_path = join(homedir(), '.claude', 'settings.json');
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

				// Check if our specific hook already exists
				const has_skill_hook = userPromptSubmit.hooks?.some(
					(h) =>
						h.type === 'command' &&
						h.command.includes('Check .claude/skills/'),
				);

				if (has_skill_hook) {
					warning(
						`Skill activation hook already exists in ${scope} settings`,
					);
					info('No changes made.');
					return;
				}

				// Add to existing hooks array within the first UserPromptSubmit object
				if (!userPromptSubmit.hooks) {
					userPromptSubmit.hooks = [];
				}
				userPromptSubmit.hooks.push({
					type: 'command',
					command: HOOK_COMMAND,
				});

				info(
					`Adding skill activation hook to existing ${scope} settings...`,
				);
			} else {
				// Create UserPromptSubmit section
				settings.hooks = settings.hooks || {};
				settings.hooks.UserPromptSubmit = [
					{
						hooks: [
							{
								type: 'command',
								command: HOOK_COMMAND,
							},
						],
					},
				];

				info(`Adding skill activation hook to ${scope} settings...`);
			}
		} catch (err) {
			error(`Failed to parse ${settings_path}: ${err}`);
			process.exit(1);
		}
	} else {
		// Create new settings.json
		info(`Creating ${scope} settings with skill activation hook...`);
		settings = {
			hooks: {
				UserPromptSubmit: [
					{
						hooks: [
							{
								type: 'command',
								command: HOOK_COMMAND,
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
		success(`Skill activation hook added successfully! (${scope})`);
		console.log('');
		info(`Location: ${settings_path}`);
		console.log('');
		info(
			'This hook improves skill activation reliability by reminding',
		);
		info('Claude to check for relevant skills before responding.');
		console.log('');
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
