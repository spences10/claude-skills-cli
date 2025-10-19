import { basename } from 'path';
import { SkillValidator } from '../core/validator.js';
import type { ValidateOptions } from '../types.js';
import {
  display_validation_stats,
  error,
  info,
  success,
} from '../utils/output.js';

export function validate_command(options: ValidateOptions): void {
  const { skill_path, strict } = options;
  const skill_name = basename(skill_path);

  info(`Validating skill: ${skill_name}`);
  console.log('='.repeat(60));

  const validator = new SkillValidator(skill_path);
  const result = validator.validate_all();

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
    error(`Skill validation failed with ${result.errors.length} error(s)`);
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
