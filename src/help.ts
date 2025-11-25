// Help data structures and formatting for commands

export interface CommandOption {
	flag: string;
	type?: string;
	required?: boolean;
	description: string;
}

export interface CommandHelp {
	command: string;
	description: string;
	usage: string;
	options: CommandOption[];
	examples: string[];
}

export interface CommandSummary {
	command: string;
	description: string;
}

export interface MainHelp {
	name: string;
	description: string;
	usage: string;
	commands: CommandSummary[];
	globalOptions: CommandOption[];
	examples: string[];
	notes?: string[];
}

export const INIT_HELP: CommandHelp = {
	command: 'init',
	description: 'Create a new skill',
	usage: 'claude-skills-cli init [options]',
	options: [
		{
			flag: '--name',
			type: 'string',
			required: true,
			description: 'Skill name (kebab-case, lowercase)',
		},
		{
			flag: '--description',
			type: 'string',
			required: true,
			description: 'Brief description with trigger keywords',
		},
		{
			flag: '--path',
			type: 'string',
			description: 'Custom path (alternative to --name)',
		},
		{
			flag: '--with-examples',
			type: 'boolean',
			description: 'Include example files (scripts/, assets/)',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli init --name my-skill --description "Brief description"',
		'claude-skills-cli init --name my-skill --description "..." --with-examples',
		'claude-skills-cli init --path /custom/path/my-skill --description "..."',
	],
};

export const INSTALL_HELP: CommandHelp = {
	command: 'install',
	description: 'Install a bundled skill',
	usage: 'claude-skills-cli install <skill-name> [options]',
	options: [
		{
			flag: '<skill-name>',
			required: true,
			description: 'Name of bundled skill (e.g., skill-creator)',
		},
		{
			flag: '--force',
			type: 'boolean',
			description: 'Replace existing skill without prompting',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli install skill-creator',
		'claude-skills-cli install skill-creator --force',
	],
};

export const VALIDATE_HELP: CommandHelp = {
	command: 'validate',
	description: 'Validate a skill',
	usage: 'claude-skills-cli validate <skill-path> [options]',
	options: [
		{
			flag: '<skill-path>',
			required: true,
			description: 'Path to skill directory',
		},
		{
			flag: '--format',
			type: 'json|text',
			description: 'Output format (default: text)',
		},
		{
			flag: '--strict',
			type: 'boolean',
			description: 'Fail validation if warnings present',
		},
		{
			flag: '--lenient',
			type: 'boolean',
			description: 'Use relaxed limits (150 lines max)',
		},
		{
			flag: '--loose',
			type: 'boolean',
			description: 'Use Anthropic official limits (500 lines max)',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli validate .claude/skills/my-skill',
		'claude-skills-cli validate .claude/skills/my-skill --lenient',
		'claude-skills-cli validate .claude/skills/my-skill --loose',
		'claude-skills-cli validate .claude/skills/my-skill --format json',
	],
};

export const DOCTOR_HELP: CommandHelp = {
	command: 'doctor',
	description: 'Fix common skill issues automatically',
	usage: 'claude-skills-cli doctor <skill-path>',
	options: [
		{
			flag: '<skill-path>',
			required: true,
			description: 'Path to skill directory',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: ['claude-skills-cli doctor .claude/skills/my-skill'],
};

export const PACKAGE_HELP: CommandHelp = {
	command: 'package',
	description: 'Package a skill to zip',
	usage: 'claude-skills-cli package <skill-path> [options]',
	options: [
		{
			flag: '<skill-path>',
			required: true,
			description: 'Path to skill directory',
		},
		{
			flag: '--output',
			type: 'string',
			description: 'Output path for zip file',
		},
		{
			flag: '--skip-validation',
			type: 'boolean',
			description: 'Skip validation before packaging',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli package .claude/skills/my-skill',
		'claude-skills-cli package .claude/skills/my-skill --output my-skill.zip',
	],
};

export const STATS_HELP: CommandHelp = {
	command: 'stats',
	description: 'Show overview of all skills in a directory',
	usage: 'claude-skills-cli stats [directory]',
	options: [
		{
			flag: '[directory]',
			description:
				'Directory containing skills (default: .claude/skills)',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli stats',
		'claude-skills-cli stats .claude/skills',
	],
};

export const ADD_HOOK_HELP: CommandHelp = {
	command: 'add-hook',
	description: 'Add skill activation hook to .claude/settings.json',
	usage: 'claude-skills-cli add-hook [options]',
	options: [
		{
			flag: '--type',
			type: 'forced-eval|llm-eval|simple-script|simple-inline',
			description: 'Hook type (default: forced-eval)',
		},
		{
			flag: '--project',
			type: 'boolean',
			description: 'Install in project .claude/settings.json',
		},
		{
			flag: '--local',
			type: 'boolean',
			description: 'Install in project .claude/settings.local.json',
		},
		{
			flag: '--force',
			type: 'boolean',
			description: 'Replace existing hook without prompting',
		},
		{ flag: '--help, -h', description: 'Show this help' },
	],
	examples: [
		'claude-skills-cli add-hook',
		'claude-skills-cli add-hook --type llm-eval',
		'claude-skills-cli add-hook --project',
		'claude-skills-cli add-hook --type forced-eval --force',
	],
};

export const MAIN_HELP: MainHelp = {
	name: 'claude-skills-cli',
	description: 'CLI toolkit for creating Claude Agent Skills',
	usage: 'claude-skills-cli <command> [options]',
	commands: [
		{ command: 'init', description: 'Create a new skill' },
		{
			command: 'install',
			description: 'Install a bundled skill (e.g., skill-creator)',
		},
		{ command: 'validate', description: 'Validate a skill' },
		{
			command: 'doctor',
			description: 'Fix common skill issues automatically',
		},
		{ command: 'package', description: 'Package a skill to zip' },
		{
			command: 'stats',
			description: 'Show overview of all skills in a directory',
		},
		{
			command: 'add-hook',
			description:
				'Add skill activation hook to .claude/settings.json',
		},
	],
	globalOptions: [
		{ flag: '--help, -h', description: 'Show help' },
		{ flag: '--version, -v', description: 'Show version' },
		{
			flag: '--format',
			type: 'text|json',
			description: 'Output format for help (default: text)',
		},
	],
	examples: [
		'claude-skills-cli init --name my-skill --description "Description"',
		'claude-skills-cli validate .claude/skills/my-skill',
		'claude-skills-cli add-hook',
		'claude-skills-cli --help --format json',
	],
	notes: [
		'IMPORTANT FOR LLMs:',
		'  ALWAYS run validate after creating or editing a skill:',
		'    claude-skills-cli validate <skill-path>',
		'  Skills MUST pass validation before use.',
		'  Fix all errors immediately. Address warnings promptly.',
	],
};

export function show_command_help(
	help: CommandHelp,
	format?: string,
): void {
	if (format === 'json') {
		console.log(JSON.stringify(help, null, 2));
		return;
	}

	// Text format (human-friendly)
	console.log(
		`claude-skills-cli ${help.command} - ${help.description}\n`,
	);
	console.log('Usage:');
	console.log(`  ${help.usage}\n`);

	if (help.options.length > 0) {
		console.log('Options:');
		for (const opt of help.options) {
			const flag_part = opt.flag.padEnd(20);
			const type_part = opt.type ? `<${opt.type}>`.padEnd(15) : '';
			const req_part = opt.required ? '[required]'.padEnd(12) : '';
			console.log(`  ${flag_part}${type_part}${opt.description}`);
		}
		console.log('');
	}

	if (help.examples.length > 0) {
		console.log('Examples:');
		for (const example of help.examples) {
			console.log(`  ${example}`);
		}
	}
}

export function show_main_help(format?: string): void {
	if (format === 'json') {
		console.log(JSON.stringify(MAIN_HELP, null, 2));
		return;
	}

	// Text format (human-friendly)
	console.log(`${MAIN_HELP.name} - ${MAIN_HELP.description}\n`);
	console.log('Usage:');
	console.log(`  ${MAIN_HELP.usage}\n`);

	if (MAIN_HELP.commands.length > 0) {
		console.log('Commands:');
		for (const cmd of MAIN_HELP.commands) {
			const cmd_part = cmd.command.padEnd(12);
			console.log(`  ${cmd_part}${cmd.description}`);
		}
		console.log('');
	}

	if (MAIN_HELP.globalOptions.length > 0) {
		console.log('Global Options:');
		for (const opt of MAIN_HELP.globalOptions) {
			const flag_part = opt.flag.padEnd(20);
			const type_part = opt.type ? `<${opt.type}>`.padEnd(15) : '';
			console.log(`  ${flag_part}${type_part}${opt.description}`);
		}
		console.log('');
	}

	if (MAIN_HELP.examples.length > 0) {
		console.log('Examples:');
		for (const example of MAIN_HELP.examples) {
			console.log(`  ${example}`);
		}
	}

	if (MAIN_HELP.notes && MAIN_HELP.notes.length > 0) {
		console.log('');
		for (const note of MAIN_HELP.notes) {
			console.log(note);
		}
	}
}
