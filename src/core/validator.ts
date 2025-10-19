import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ValidationResult } from '../types.js';

export class SkillValidator {
  private skill_path: string;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(skill_path: string) {
    this.skill_path = skill_path;
  }

  private error(msg: string): void {
    this.errors.push(`❌ ${msg}`);
  }

  private warning(msg: string): void {
    this.warnings.push(`⚠️  ${msg}`);
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

      // Check description length
      if (description.length > 1024) {
        this.error(
          `Description too long (max 1024 chars): ${description.length}`
        );
      }

      if (description.length < 20) {
        this.warning('Description is very short (consider adding more detail)');
      }

      // Check for "when to use" guidance
      const lower_desc = description.toLowerCase();
      if (!lower_desc.includes('when') && !lower_desc.includes('use')) {
        this.warning("Consider adding 'when to use' guidance to description");
      }
    }

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

    if (existsSync(references_dir)) {
      const files = readdirSync(references_dir);
      const md_files = files.filter((f) => f.endsWith('.md'));

      if (md_files.length === 0) {
        this.warning('references/ directory exists but is empty');
      }

      // Check for references in SKILL.md
      const skill_md_path = join(this.skill_path, 'SKILL.md');
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
    };
  }

  public get_errors(): string[] {
    return this.errors;
  }

  public get_warnings(): string[] {
    return this.warnings;
  }
}
