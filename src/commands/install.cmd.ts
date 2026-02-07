import { defineCommand } from 'citty';
import { install_command } from './install.js';

export default defineCommand({
	meta: { name: 'install', description: 'Install a bundled skill' },
	args: {
		skill_name: {
			type: 'positional',
			description: 'Name of bundled skill',
			required: true,
		},
		force: {
			type: 'boolean',
			description: 'Replace existing skill without prompting',
		},
	},
	run({ args }) {
		install_command({
			skill_name: args.skill_name,
			force: args.force,
		});
	},
});
