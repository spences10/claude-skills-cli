import { join } from 'node:path';
import {
	REFERENCE_TEMPLATE,
	SCRIPT_TEMPLATE,
	SKILL_MD_TEMPLATE,
} from '../core/templates.js';
import type { InitOptions } from '../types.js';
import {
	ensure_dir,
	is_lowercase,
	make_executable,
	to_title_case,
	write_file,
} from '../utils/fs.js';
import { error, success } from '../utils/output.js';

export function init_command(options: InitOptions): void {
	let skill_path: string;
	let name: string;
	let description: string;

	// Determine path and name
	if (options.path) {
		skill_path = options.path;
		name = skill_path.split('/').pop() || '';
		description = options.description || 'TODO: Add description';
	} else if (options.name) {
		name = options.name;
		description = options.description || 'TODO: Add description';
		// Default to .claude/skills/ directory
		skill_path = join('.claude', 'skills', name);
	} else {
		error('Either --name or --path must be provided');
		console.log('\nUsage:');
		console.log(
			'  claude-skills-cli init --name my-skill --description "Description"',
		);
		console.log(
			'  claude-skills-cli init --path /custom/path/my-skill',
		);
		process.exit(1);
	}

	// Validate name format
	const alphanumeric_check = name.replace(/-/g, '').replace(/_/g, '');
	if (!/^[a-z0-9]+$/.test(alphanumeric_check)) {
		error(`Skill name must be kebab-case alphanumeric: ${name}`);
		process.exit(1);
	}

	if (!is_lowercase(name)) {
		error(`Skill name must be lowercase: ${name}`);
		process.exit(1);
	}

	// Create skill
	create_skill(
		skill_path,
		name,
		description,
		options.with_examples || false,
	);
}

function create_skill(
	path: string,
	name: string,
	description: string,
	with_examples: boolean = false,
): void {
	// Create base directories
	ensure_dir(path);
	ensure_dir(join(path, 'references'));

	// Create SKILL.md
	const title = to_title_case(name);
	const skill_md = SKILL_MD_TEMPLATE(
		name,
		description,
		title,
		with_examples,
	);
	write_file(join(path, 'SKILL.md'), skill_md);

	// Only create example files if requested
	if (with_examples) {
		// Create example directories
		ensure_dir(join(path, 'scripts'));
		ensure_dir(join(path, 'assets'));

		// Create example reference
		const reference_md = REFERENCE_TEMPLATE(title);
		write_file(
			join(path, 'references', 'detailed-guide.md'),
			reference_md,
		);

		// Create example script
		const script_js = SCRIPT_TEMPLATE('example.js');
		const script_path = join(path, 'scripts', 'example.js');
		write_file(script_path, script_js);
		make_executable(script_path);
	}

	success(`Skill created at: ${path}`);
	console.log('\nNext steps:');
	console.log(
		`1. Edit ${path}/SKILL.md with your skill instructions`,
	);
	console.log(`2. Add detailed documentation to references/`);
	if (with_examples) {
		console.log(`3. Add executable scripts to scripts/`);
		console.log(`4. Remove example files you don't need`);
	} else {
		console.log(
			`3. Use --with-examples flag if you need scripts/ and example files`,
		);
	}
	console.log(`\n⚠️  REQUIRED: Validate the skill before use:`);
	console.log(`   claude-skills-cli validate ${path}`);
	console.log(`   Fix all errors immediately.`);
}
