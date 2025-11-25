import { basename } from 'node:path';
import { SkillValidator } from '../core/validator.js';
import type { ValidateOptions } from '../types.js';
import {
	display_validation_stats,
	error,
	info,
	success,
} from '../utils/output.js';

export function validate_command(options: ValidateOptions): void {
	const {
		skill_path,
		strict,
		format = 'text',
		lenient = false,
		loose = false,
	} = options;
	// Normalize path by removing trailing slashes before extracting basename
	const normalized_path = skill_path.replace(/\/+$/, '');
	const skill_name = basename(normalized_path);

	// Determine validation mode: loose > lenient > strict (default)
	const mode = loose ? 'loose' : lenient ? 'lenient' : 'strict';
	const validator = new SkillValidator(skill_path, { mode });
	const result = validator.validate_all();

	// JSON output
	if (format === 'json') {
		const json_output = {
			skill_name,
			valid: result.is_valid,
			errors: result.errors,
			warnings: result.warnings,
			validation: result.validation,
			stats: result.stats,
		};
		console.log(JSON.stringify(json_output, null, 2));

		// Exit codes for JSON mode
		if (!result.is_valid) {
			process.exit(1);
		}
		if (strict && result.warnings.length > 0) {
			process.exit(1);
		}
		process.exit(0);
	}

	// Text output (existing)
	info(`Validating skill: ${skill_name}`);
	console.log('='.repeat(60));

	// Display progressive disclosure stats
	if (result.stats) {
		display_validation_stats(result.stats);
	}

	// Print errors
	if (result.errors.length > 0) {
		console.log('\n❌ Errors:');
		for (const err of result.errors) {
			console.log(`  ${err}`);
		}
	}

	// Print warnings
	if (result.warnings.length > 0) {
		console.log('\n⚠️  Warnings:');
		for (const warn of result.warnings) {
			console.log(`  ${warn}`);
		}
	}

	// Print final status
	if (!result.errors.length && !result.warnings.length) {
		console.log('');
		success('Skill is valid!');
	} else if (!result.errors.length) {
		console.log('');
		success('Skill is valid (with warnings)');
	} else {
		console.log('');
		error(
			`Skill validation failed with ${result.errors.length} error(s)`,
		);
	}

	// Handle exit codes
	if (!result.is_valid) {
		process.exit(1);
	}

	if (strict && result.warnings.length > 0) {
		console.log('\n❌ Failed in strict mode due to warnings');
		process.exit(1);
	}

	process.exit(0);
}
