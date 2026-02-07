import { defineCommand } from 'citty';
import { package_command } from './package.js';

export default defineCommand({
	meta: { name: 'package', description: 'Package a skill to zip' },
	args: {
		skill_path: {
			type: 'positional',
			description: 'Path to skill directory',
			required: true,
		},
		output: {
			type: 'string',
			description: 'Output path for zip file',
		},
		'skip-validation': {
			type: 'boolean',
			description: 'Skip validation before packaging',
		},
	},
	async run({ args }) {
		await package_command({
			skill_path: args.skill_path,
			output: args.output,
			skip_validation: args['skip-validation'],
		});
	},
});
