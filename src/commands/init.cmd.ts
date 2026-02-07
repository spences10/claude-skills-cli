import { defineCommand } from 'citty';
import { init_command } from './init.js';

export default defineCommand({
	meta: { name: 'init', description: 'Create a new skill' },
	args: {
		name: {
			type: 'string',
			description: 'Skill name (kebab-case, lowercase)',
		},
		description: {
			type: 'string',
			description: 'Brief description with trigger keywords',
		},
		path: {
			type: 'string',
			description: 'Custom path (alternative to --name)',
		},
		'with-examples': {
			type: 'boolean',
			description: 'Include example files (scripts/, assets/)',
		},
	},
	run({ args }) {
		init_command({
			name: args.name,
			description: args.description,
			path: args.path,
			with_examples: args['with-examples'],
		});
	},
});
