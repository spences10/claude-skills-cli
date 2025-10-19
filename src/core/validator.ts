import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import type { ValidationResult, ValidationStats } from '../types.js';

export class SkillValidator {
  private skill_path: string;
  private errors: string[] = [];
  private warnings: string[] = [];
  private stats: ValidationStats = {
    word_count: 0,
    estimated_tokens: 0,
    line_count: 0,
    description_length: 0,
    description_tokens: 0,
    code_blocks: 0,
    sections: 0,
    long_paragraphs: 0,
  };

  // Progressive disclosure limits (from Anthropic guidelines)
  private readonly MAX_WORDS = 5000; // Hard limit
  private readonly RECOMMENDED_WORDS = 1000; // Sweet spot
  private readonly IDEAL_WORDS = 500; // Minimal but effective

  constructor(skill_path: string) {
    this.skill_path = skill_path;
  }

  private error(msg: string): void {
    this.errors.push(`❌ ${msg}`);
  }

  private warning(msg: string): void {
    this.warnings.push(`⚠️  ${msg}`);
  }

  /**
   * Extract body content from SKILL.md (excluding YAML frontmatter)
   */
  private extract_body(content: string): string {
    const parts = content.split('---\n');
    return parts.length >= 3 ? parts.slice(2).join('---\n').trim() : content;
  }

  /**
   * Count words in text
   */
  private count_words(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }

  /**
   * Estimate tokens (rough approximation: 1 word ≈ 1.3 tokens for English)
   */
  private estimate_tokens(word_count: number): number {
    return Math.round(word_count * 1.3);
  }

  /**
   * Estimate tokens for a string by counting words and applying ratio
   */
  private estimate_string_tokens(text: string): number {
    const word_count = this.count_words(text);
    return this.estimate_tokens(word_count);
  }

  /**
   * Validate Level 1 (Description in frontmatter) for progressive disclosure
   */
  private validate_description(description: string): void {
    const desc_length = description.length;
    const desc_tokens = this.estimate_string_tokens(description);

    // Store stats
    this.stats.description_length = desc_length;
    this.stats.description_tokens = desc_tokens;

    // Level 1 progressive disclosure checks
    // Recommended: <200 chars, <30 tokens for optimal Level 1 efficiency
    if (desc_length > 300) {
      this.error(
        `Description is ${desc_length} characters (MAX: 300 for Level 1)\n` +
          `  → Level 1 is always loaded - keep it concise for token efficiency`
      );
    } else if (desc_length > 200) {
      this.warning(
        `Description is ${desc_length} characters (recommended: <200 for Level 1)\n` +
          `  → Estimated ~${desc_tokens} tokens - consider shortening for efficiency`
      );
    }

    // Check for trigger keywords
    const lower_desc = description.toLowerCase();
    const has_trigger =
      lower_desc.includes('use when') ||
      lower_desc.includes('use for') ||
      lower_desc.includes('use to');

    if (!has_trigger) {
      this.warning(
        `Description missing trigger keywords ('Use when...', 'Use for...', 'Use to...')\n` +
          `  → Help Claude know when to activate this skill`
      );
    }

    // Check for list bloat (multiple commas indicating detailed lists)
    const comma_count = (description.match(/,/g) || []).length;
    if (comma_count >= 3) {
      this.warning(
        `Description contains long lists (${comma_count} commas)\n` +
          `  → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)`
      );
    }
  }

  /**
   * Analyze content structure and patterns
   */
  private analyze_content(body: string): void {
    // Count code blocks
    const code_block_matches = body.match(/```[\s\S]*?```/g);
    this.stats.code_blocks = code_block_matches ? code_block_matches.length : 0;

    // Count markdown sections (headings)
    const heading_matches = body.match(/^#{1,6}\s/gm);
    this.stats.sections = heading_matches ? heading_matches.length : 0;

    // Count long paragraphs (>100 words)
    const paragraphs = body.split(/\n\n+/);
    this.stats.long_paragraphs = paragraphs.filter((p) => {
      const words = this.count_words(p);
      return words > 100;
    }).length;
  }

  /**
   * Validate progressive disclosure (word count, token budget, and line count)
   */
  private validate_progressive_disclosure(body: string): void {
    const word_count = this.count_words(body);
    const estimated_tokens = this.estimate_tokens(word_count);
    const line_count = body.trim().split('\n').length;

    this.stats.word_count = word_count;
    this.stats.estimated_tokens = estimated_tokens;
    this.stats.line_count = line_count;

    // Hard limit check (error)
    if (word_count > this.MAX_WORDS) {
      this.error(
        `SKILL.md body has ${word_count} words (MAX: ${this.MAX_WORDS} per Anthropic guidelines)\n` +
          `  → Move detailed content to references/ directory for Level 3 loading`
      );
    }
    // Recommended limit check (warning)
    else if (word_count > this.RECOMMENDED_WORDS) {
      this.warning(
        `SKILL.md body has ${word_count} words (recommended: <${this.RECOMMENDED_WORDS})\n` +
          `  → Consider moving examples/docs to references/ for better token efficiency`
      );
    }

    // Line count validation (Level 2 progressive disclosure)
    // Target: ~50 lines, Warn: >80, Error: >150
    if (line_count > 150) {
      this.error(
        `SKILL.md body is ${line_count} lines (MAX: ~150 for Level 2 progressive disclosure)\n` +
          `  → Move detailed content to references/ directory\n` +
          `  → Target: ~50 lines for optimal scannability`
      );
    } else if (line_count > 80) {
      this.warning(
        `SKILL.md body is ${line_count} lines (recommended: ~50, max: ~80)\n` +
          `  → Consider moving detailed examples to references/ for Level 3 loading`
      );
    }

    // Content analysis warnings
    // Code blocks: Recommend 1-2, warn at >3
    if (this.stats.code_blocks > 3) {
      this.warning(
        `SKILL.md contains ${this.stats.code_blocks} code examples (recommended: 1-2)\n` +
          `  → Move additional examples to references/examples.md for Level 3 loading`
      );
    }

    // Long paragraphs
    if (this.stats.long_paragraphs > 3) {
      this.warning(
        `SKILL.md contains ${this.stats.long_paragraphs} lengthy paragraphs (>100 words)\n` +
          `  → Consider moving detailed explanations to references/`
      );
    }

    // Sections: Recommend 3-5, warn at >8
    if (this.stats.sections > 8) {
      this.warning(
        `SKILL.md contains ${this.stats.sections} sections (recommended: 3-5)\n` +
          `  → Consider splitting into focused reference files`
      );
    }

    // Check for "Quick Start" section
    if (!body.includes('## Quick Start') && !body.includes('## Quick start')) {
      this.warning(
        `Missing "## Quick Start" section\n` +
          `  → Add one minimal working example to help Claude get started quickly`
      );
    }

    // Check for references/ links when body is long
    const has_references = body.includes('references/');
    if (!has_references && line_count > 60) {
      this.warning(
        `No references/ links found but SKILL.md is ${line_count} lines\n` +
          `  → Consider splitting detailed content into reference files`
      );
    }
  }

  private validate_directory(): boolean {
    if (!existsSync(this.skill_path)) {
      this.error(`Skill directory does not exist: ${this.skill_path}`);
      return false;
    }

    const stats = statSync(this.skill_path);
    if (!stats.isDirectory()) {
      this.error(`Path is not a directory: ${this.skill_path}`);
      return false;
    }

    return true;
  }

  private validate_skill_md(): boolean {
    const skill_md_path = join(this.skill_path, 'SKILL.md');

    if (!existsSync(skill_md_path)) {
      this.error('SKILL.md file not found');
      return false;
    }

    const content = readFileSync(skill_md_path, 'utf-8');

    // Check for YAML frontmatter
    if (!content.startsWith('---\n')) {
      this.error('SKILL.md must start with YAML frontmatter (---)');
      return false;
    }

    // Extract frontmatter
    const parts = content.split('---\n');
    if (parts.length < 3) {
      this.error('SKILL.md has malformed YAML frontmatter');
      return false;
    }

    const frontmatter = parts[1];
    const body = parts.slice(2).join('---\n');

    // Validate required fields
    if (!frontmatter.includes('name:')) {
      this.error("SKILL.md frontmatter missing 'name' field");
      return false;
    }

    if (!frontmatter.includes('description:')) {
      this.error("SKILL.md frontmatter missing 'description' field");
      return false;
    }

    // Extract name
    const name_match = frontmatter.match(/name:\s*(.+)/);
    if (name_match) {
      const name = name_match[1].trim();

      // Validate name format
      if (!/^[a-z0-9-]+$/.test(name)) {
        this.error(`Skill name must be lowercase kebab-case: '${name}'`);
      }

      // Check name matches directory
      const dir_name = this.skill_path.split('/').pop() || '';
      if (name !== dir_name) {
        this.warning(
          `Skill name '${name}' doesn't match directory name '${dir_name}'`
        );
      }

      // Check name length
      if (name.length > 64) {
        this.error(`Skill name too long (max 64 chars): ${name.length}`);
      }
    }

    // Extract description
    const desc_match = frontmatter.match(
      /description:\s*(.+?)(?=\n[a-z]+:|$)/s
    );
    if (desc_match) {
      const description = desc_match[1].trim();

      // Hard limit check (Anthropic requirement)
      if (description.length > 1024) {
        this.error(
          `Description too long (max 1024 chars per Anthropic): ${description.length}`
        );
      }

      // Short description check
      if (description.length < 20) {
        this.warning('Description is very short (consider adding more detail)');
      }

      // Comprehensive Level 1 validation
      this.validate_description(description);
    }

    // Validate progressive disclosure (word count, token budget)
    this.validate_progressive_disclosure(body);

    // Analyze content structure
    this.analyze_content(body);

    // Check body content
    if (body.trim().length < 100) {
      this.warning('SKILL.md body is very short');
    }

    // Check for TODO placeholders
    if (
      body.includes('TODO') ||
      body.includes('[Add your') ||
      body.includes('[Provide')
    ) {
      this.warning('SKILL.md contains TODO placeholders');
    }

    return true;
  }

  private validate_references(): boolean {
    const references_dir = join(this.skill_path, 'references');
    const skill_md_path = join(this.skill_path, 'SKILL.md');

    // Check references directory if it exists
    if (existsSync(references_dir)) {
      const files = readdirSync(references_dir);
      const md_files = files.filter((f) => f.endsWith('.md'));

      if (md_files.length === 0) {
        this.warning('references/ directory exists but is empty');
      }

      // Check for references in SKILL.md
      if (existsSync(skill_md_path)) {
        const skill_content = readFileSync(skill_md_path, 'utf-8');

        for (const md_file of md_files) {
          if (!skill_content.includes(md_file)) {
            this.warning(
              `Reference file '${md_file}' not mentioned in SKILL.md`
            );
          }
        }
      }
    }

    // Level 3 validation: Check that all referenced files exist
    if (existsSync(skill_md_path)) {
      const skill_content = readFileSync(skill_md_path, 'utf-8');

      // Extract markdown links to references/ directory
      // Matches: [text](references/file.md) or [text](references/subdir/file.md)
      const reference_link_pattern = /\[([^\]]+)\]\((references\/[^)]+\.md)\)/g;
      const matches = skill_content.matchAll(reference_link_pattern);

      for (const match of matches) {
        const link_text = match[1];
        const file_path = match[2]; // e.g., "references/examples.md"
        const full_path = join(this.skill_path, file_path);

        if (!existsSync(full_path)) {
          this.error(
            `Referenced file not found: ${file_path}\n` +
              `  → Linked from: [${link_text}]\n` +
              `  → Create the file or remove the broken link`
          );
        }
      }
    }

    return true;
  }

  private validate_scripts(): boolean {
    const scripts_dir = join(this.skill_path, 'scripts');

    if (existsSync(scripts_dir)) {
      const files = readdirSync(scripts_dir);
      const script_files = files.filter(
        (f) => f.endsWith('.py') || f.endsWith('.sh')
      );

      if (script_files.length === 0) {
        this.warning('scripts/ directory exists but is empty');
      }

      for (const script_file of script_files) {
        const script_path = join(scripts_dir, script_file);
        const stats = statSync(script_path);

        // Check if executable (0o111 = --x--x--x)
        if ((stats.mode & 0o111) === 0) {
          this.warning(`Script is not executable: ${script_file}`);
        }

        // Check for shebang
        const content = readFileSync(script_path, 'utf-8');
        const first_line = content.split('\n')[0];
        if (!first_line.startsWith('#!')) {
          this.warning(`Script missing shebang: ${script_file}`);
        }
      }
    }

    return true;
  }

  private validate_assets(): boolean {
    const assets_dir = join(this.skill_path, 'assets');

    if (existsSync(assets_dir)) {
      const files = readdirSync(assets_dir);

      if (files.length === 0) {
        this.warning('assets/ directory exists but is empty');
      }
    }

    return true;
  }

  public validate_all(): ValidationResult {
    if (!this.validate_directory()) {
      return {
        errors: this.errors,
        warnings: this.warnings,
        is_valid: false,
        stats: this.stats,
      };
    }

    this.validate_skill_md();
    this.validate_references();
    this.validate_scripts();
    this.validate_assets();

    return {
      errors: this.errors,
      warnings: this.warnings,
      is_valid: this.errors.length === 0,
      stats: this.stats,
    };
  }

  public get_errors(): string[] {
    return this.errors;
  }

  public get_warnings(): string[] {
    return this.warnings;
  }
}
