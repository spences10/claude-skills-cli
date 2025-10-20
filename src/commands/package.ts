import archiver from 'archiver';
import {
	createWriteStream,
	existsSync,
	readdirSync,
	statSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { SkillValidator } from '../core/validator.js';
import type { PackageOptions } from '../types.js';
import { ensure_dir } from '../utils/fs.js';
import {
	error,
	package_,
	search,
	step,
	success,
	upload,
} from '../utils/output.js';

function validate_skill(skill_path: string): boolean {
	search('Validating skill...');

	const validator = new SkillValidator(skill_path);
	const result = validator.validate_all();

	if (result.errors.length > 0) {
		console.log('\n❌ Errors:');
		for (const err of result.errors) {
			console.log(`  ${err}`);
		}
	}

	if (result.warnings.length > 0) {
		console.log('\n⚠️  Warnings:');
		for (const warn of result.warnings) {
			console.log(`  ${warn}`);
		}
	}

	if (result.is_valid) {
		success('Skill is valid!');
		console.log('');
		return true;
	} else {
		error('Validation failed. Fix errors before packaging.');
		return false;
	}
}

function package_skill(
	skill_path: string,
	output_dir: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const skill_name = basename(skill_path);
		const output_file = join(output_dir, `${skill_name}.zip`);

		package_(`Packaging skill: ${skill_name}`);

		// Ensure output directory exists
		ensure_dir(output_dir);

		// Create output stream
		const output = createWriteStream(output_file);
		const archive = archiver('zip', {
			zlib: { level: 9 },
		});

		// Listen for all archive data to be written
		output.on('close', () => {
			resolve(output_file);
		});

		// Handle errors
		archive.on('error', (err) => {
			reject(err);
		});

		// Pipe archive data to the file
		archive.pipe(output);

		// Add files recursively
		function add_files(dir_path: string, base_path: string) {
			const items = readdirSync(dir_path);

			for (const item of items) {
				const item_path = join(dir_path, item);
				const stats = statSync(item_path);

				// Skip hidden files and directories
				if (item.startsWith('.')) {
					continue;
				}

				// Skip common temporary files
				if (item.endsWith('.swp') || item.endsWith('~')) {
					continue;
				}

				if (item === '.DS_Store') {
					continue;
				}

				if (stats.isDirectory()) {
					add_files(item_path, base_path);
				} else {
					const relative_path = item_path.replace(
						base_path + '/',
						'',
					);
					archive.file(item_path, { name: relative_path });
					step(`+ ${relative_path}`);
				}
			}
		}

		add_files(
			skill_path,
			skill_path.substring(0, skill_path.lastIndexOf('/')),
		);

		// Finalize the archive
		archive.finalize();
	});
}

export async function package_command(
	options: PackageOptions,
): Promise<void> {
	const { skill_path, output, skip_validation } = options;

	// Validate path
	if (!existsSync(skill_path)) {
		error(`Skill directory does not exist: ${skill_path}`);
		process.exit(1);
	}

	const stats = statSync(skill_path);
	if (!stats.isDirectory()) {
		error(`Path is not a directory: ${skill_path}`);
		process.exit(1);
	}

	// Check for SKILL.md
	if (!existsSync(join(skill_path, 'SKILL.md'))) {
		error(`SKILL.md not found in ${skill_path}`);
		process.exit(1);
	}

	// Validate skill
	if (!skip_validation) {
		if (!validate_skill(skill_path)) {
			process.exit(1);
		}
	}

	// Package skill
	try {
		const output_dir = output || 'dist';
		const output_file = await package_skill(skill_path, output_dir);

		// Print success
		const file_stats = statSync(output_file);
		const size_kb = file_stats.size / 1024;

		console.log('');
		success('Skill packaged successfully!');
		console.log(`   File: ${output_file}`);
		console.log(`   Size: ${size_kb.toFixed(1)} KB`);
		console.log('');
		upload(
			'Upload to Claude.ai: Settings > Features > Skills > Upload',
		);
	} catch (err) {
		error(`Failed to package skill: ${err}`);
		process.exit(1);
	}
}
