import { defineCommand } from 'citty';
import { doctor_command } from './doctor.js';

export default defineCommand({
	meta: {
		name: 'doctor',
		description: 'Fix common skill issues automatically',
	},
	args: {
		skill_path: {
			type: 'positional',
			description: 'Path to skill directory',
			required: true,
		},
	},
	run({ args }) {
		doctor_command({ skill_path: args.skill_path });
	},
});
