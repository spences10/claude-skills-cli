import { defineCommand } from 'citty';
import { stats_command } from './stats.js';

export default defineCommand({
	meta: {
		name: 'stats',
		description: 'Show overview of all skills in a directory',
	},
	args: {
		directory: {
			type: 'positional',
			description:
				'Directory containing skills (default: .claude/skills)',
			required: false,
		},
	},
	run({ args }) {
		stats_command({ directory: args.directory });
	},
});
