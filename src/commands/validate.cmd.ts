import { defineCommand } from 'citty';
import { validate_command } from './validate.js';

export default defineCommand({
	meta: { name: 'validate', description: 'Validate a skill' },
	args: {
		skill_path: {
			type: 'positional',
			description: 'Path to skill directory',
			required: true,
		},
		format: {
			type: 'string',
			description: 'Output format (json or text)',
			default: 'text',
		},
		strict: {
			type: 'boolean',
			description: 'Fail validation if warnings present',
		},
		lenient: {
			type: 'boolean',
			description: 'Use relaxed limits (150 lines max)',
		},
		loose: {
			type: 'boolean',
			description: 'Use Anthropic official limits (500 lines max)',
		},
	},
	run({ args }) {
		validate_command({
			skill_path: args.skill_path,
			strict: args.strict,
			format: args.format === 'json' ? 'json' : 'text',
			lenient: args.lenient,
			loose: args.loose,
		});
	},
});
