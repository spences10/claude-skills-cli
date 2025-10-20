import { cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InstallOptions } from '../types.js';
import { ensure_dir } from '../utils/fs.js';
import { error, info, success } from '../utils/output.js';

// Get the directory where this module is located (dist/commands/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bundled skills are in dist/skills/ directory
const BUNDLED_SKILLS_DIR = join(__dirname, '..', 'skills');

const AVAILABLE_SKILLS = ['skill-creator'];

export function install_command(options: InstallOptions): void {
	const skill_name = options.skill_name;

	// Validate skill name
	if (!skill_name) {
		error('Skill name required');
		console.log('\nUsage:');
		console.log('  claude-skills-cli install <skill-name>');
		console.log('\nAvailable bundled skills:');
		AVAILABLE_SKILLS.forEach((name) => console.log(`  - ${name}`));
		process.exit(1);
	}

	if (!AVAILABLE_SKILLS.includes(skill_name)) {
		error(`Unknown skill: ${skill_name}`);
		console.log('\nAvailable bundled skills:');
		AVAILABLE_SKILLS.forEach((name) => console.log(`  - ${name}`));
		process.exit(1);
	}

	// Source and destination paths
	const source_path = join(BUNDLED_SKILLS_DIR, skill_name);
	const dest_path = join('.claude', 'skills', skill_name);

	// Check if source exists in bundle
	if (!existsSync(source_path)) {
		error(`Bundled skill not found: ${skill_name}`);
		console.log(
			`Expected at: ${source_path}\n\nThis may be a package installation issue.`,
		);
		process.exit(1);
	}

	// Check if already installed
	if (existsSync(dest_path)) {
		if (options.force) {
			info(
				`Skill already exists at ${dest_path}, overwriting (--force)...`,
			);
		} else {
			info(`Skill already installed at: ${dest_path}`);
			console.log('\nUse --force to overwrite the existing skill.');
			process.exit(0);
		}
	}

	// Create destination directory
	ensure_dir(join('.claude', 'skills'));

	// Copy skill directory
	try {
		cpSync(source_path, dest_path, {
			recursive: true,
			force: options.force || false,
		});
		success(`Installed ${skill_name} to: ${dest_path}`);

		// Skill-specific tips
		if (skill_name === 'skill-creator') {
			console.log(
				'\nThis meta skill teaches principles for designing effective skills.',
			);
			console.log(
				'Use it when creating new skills or planning skill architecture.',
			);
		}
	} catch (err) {
		error(`Failed to install skill: ${(err as Error).message}`);
		process.exit(1);
	}
}
