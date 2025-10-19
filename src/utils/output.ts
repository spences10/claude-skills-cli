import chalk from 'chalk';
import type { ValidationStats } from '../types.js';

export const success = (msg: string) => console.log(`✅ ${msg}`);
export const error = (msg: string) => console.log(`❌ ${msg}`);
export const warning = (msg: string) => console.log(`⚠️  ${msg}`);
export const info = (msg: string) => console.log(`📋 ${msg}`);
export const step = (msg: string) => console.log(`  ${msg}`);
export const package_ = (msg: string) => console.log(`📦 ${msg}`);
export const upload = (msg: string) => console.log(`📤 ${msg}`);
export const search = (msg: string) => console.log(`🔍 ${msg}`);

/**
 * Display progressive disclosure statistics with color-coded feedback
 */
export function display_validation_stats(stats: ValidationStats): void {
  console.log(chalk.cyan('\n📊 Progressive Disclosure Stats:'));

  // Word count with recommendations
  const word_status =
    stats.word_count < 500
      ? chalk.green('✅ Excellent')
      : stats.word_count < 1000
        ? chalk.green('✅ Good')
        : stats.word_count < 5000
          ? chalk.yellow('⚠️  Consider splitting')
          : chalk.red('❌ Too large');

  console.log(
    `  Words: ${stats.word_count} (recommended: <1000, max: <5000) ${word_status}`
  );

  // Token estimation
  const token_budget = 6500; // Level 2 budget (~5000 words * 1.3)
  const token_status =
    stats.estimated_tokens < token_budget
      ? chalk.green('within budget')
      : chalk.red('exceeds budget');

  console.log(
    `  Est. tokens: ~${stats.estimated_tokens} (Level 2 budget: <${token_budget}) ${token_status}`
  );

  // Code blocks
  const code_status =
    stats.code_blocks > 10
      ? chalk.yellow(' (consider references/examples.md)')
      : '';
  console.log(`  Code blocks: ${stats.code_blocks}${code_status}`);

  // Sections
  const section_status =
    stats.sections > 20 ? chalk.yellow(' (consider splitting)') : '';
  console.log(`  Sections: ${stats.sections}${section_status}`);

  // Long paragraphs
  if (stats.long_paragraphs > 0) {
    const para_status =
      stats.long_paragraphs > 3
        ? chalk.yellow(' (consider moving to references/)')
        : '';
    console.log(`  Long paragraphs: ${stats.long_paragraphs}${para_status}`);
  }

  // Overall assessment
  if (stats.word_count < 500) {
    console.log(chalk.green('\n  ✅ Excellent progressive disclosure!'));
  } else if (stats.word_count < 1000) {
    console.log(chalk.green('\n  ✅ Good progressive disclosure'));
  } else if (stats.word_count < 5000) {
    console.log(chalk.yellow('\n  ⚠️  Consider splitting into references/'));
  } else {
    console.log(
      chalk.red(
        '\n  ❌ Violates progressive disclosure (move content to references/)'
      )
    );
  }
}
