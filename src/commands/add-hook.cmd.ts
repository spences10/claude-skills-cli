import { defineCommand } from 'citty';
import { add_hook_command } from './add-hook.js';

export default defineCommand({
	meta: {
		name: 'add-hook',
		description: 'Add skill activation hook to .claude/settings.json',
	},
	args: {
		local: {
			type: 'boolean',
			description: 'Install in project .claude/settings.local.json',
		},
		project: {
			type: 'boolean',
			description: 'Install in project .claude/settings.json',
		},
		type: {
			type: 'string',
			description:
				'Hook type: simple-inline|simple-script|forced-eval|llm-eval',
		},
		force: {
			type: 'boolean',
			description: 'Replace existing hook without prompting',
		},
	},
	run({ args }) {
		add_hook_command({
			local: args.local,
			project: args.project,
			type: args.type as
				| 'simple-inline'
				| 'simple-script'
				| 'forced-eval'
				| 'llm-eval'
				| undefined,
			force: args.force,
		});
	},
});
