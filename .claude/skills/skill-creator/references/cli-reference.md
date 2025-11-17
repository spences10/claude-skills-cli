# claude-skills-cli Reference

Complete command-line reference for the `claude-skills-cli` tool
(TypeScript/Node).

## Installation

### Global Installation

```bash
npm install -g claude-skills-cli
claude-skills-cli --version
```

### Using npx (No Installation)

```bash
npx claude-skills-cli <command>
```

### Using pnpm

```bash
pnpx claude-skills-cli <command>
```

### As Dev Dependency

```bash
npm install --save-dev claude-skills-cli

# Use via package.json scripts
{
  "scripts": {
    "skill:init": "claude-skills-cli init",
    "skill:validate": "claude-skills-cli validate",
    "skill:package": "claude-skills-cli package"
  }
}
```

---

## Commands

### `init` - Create New Skill

Create a new skill directory with standard structure.

#### Syntax

```bash
claude-skills-cli init [options]
```

#### Options

| Option                 | Type   | Required | Description                                          |
| ---------------------- | ------ | -------- | ---------------------------------------------------- |
| `--name <name>`        | string | Yes\*    | Skill name (kebab-case, lowercase)                   |
| `--description <desc>` | string | No       | Skill description (default: "TODO: Add description") |
| `--path <path>`        | string | No       | Custom path (mutually exclusive with --name)         |

\*Either `--name` or `--path` must be provided

#### Examples

```bash
# Create skill with default location (.claude/skills/)
npx claude-skills-cli init --name my-skill

# With description
npx claude-skills-cli init --name my-skill \
  --description "SQLite queries. Use when writing database operations"

# Custom path
npx claude-skills-cli init --path /custom/path/my-skill

# Custom path with description
npx claude-skills-cli init --path /custom/path/my-skill \
  --description "Brief description"
```

#### Created Structure

```
.claude/skills/my-skill/
├── SKILL.md          # Main skill instructions
└── references/       # Level 3 detailed documentation
```

#### Name Validation

- Must be lowercase
- Must be kebab-case (alphanumeric with hyphens)
- No spaces or special characters
- Example valid names: `database-queries`, `auth-patterns`,
  `ui-components`

#### Output

```
✅ Skill created at: .claude/skills/my-skill

Next steps:
1. Edit .claude/skills/my-skill/SKILL.md with your skill instructions
2. Add detailed documentation to references/
3. Add executable scripts to scripts/
4. Remove example files you don't need

Validate with: claude-skills-cli validate .claude/skills/my-skill
```

---

### `validate` - Validate Skill Structure

Validate skill structure and progressive disclosure compliance.

#### Syntax

```bash
claude-skills-cli validate <skill_path> [options]
```

#### Arguments

| Argument       | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `<skill_path>` | string | Yes      | Path to skill directory |

#### Options

| Option     | Type    | Description                            |
| ---------- | ------- | -------------------------------------- |
| `--strict` | boolean | Treat warnings as errors (exit code 1) |

#### Examples

```bash
# Validate skill
npx claude-skills-cli validate .claude/skills/my-skill

# Strict mode (warnings = errors)
npx claude-skills-cli validate .claude/skills/my-skill --strict

# Validate multiple skills
npx claude-skills-cli validate .claude/skills/skill-1
npx claude-skills-cli validate .claude/skills/skill-2
```

#### Validation Checks

**Level 1 (Metadata):**

- Description length: <200 chars (optimal), <300 chars (warning),
  <1024 chars (max)
- Description format: Must be on single line (warns if multi-line,
  suggests `doctor` command)
- Description includes trigger keywords ("Use when...", "Use for...",
  "Use to...")
- Description comma count (warns if >3, suggesting list bloat)
- Name format (lowercase, kebab-case)
- Name length (<64 chars)
- Name matches directory name

**Level 2 (SKILL.md Body):**

- Line count: ~50 (optimal), <80 (good), <150 (warning)
- Word count: <1000 (optimal), <5000 (max)
- Code blocks: 1-2 (optimal), ≤3 (good), >3 (warning)
- Sections: 3-5 (optimal), ≤8 (good), >8 (warning)
- Long paragraphs: ≤3 (warns if >3 paragraphs over 100 words)
- "Quick Start" section present
- Links to references/ when body is long (>60 lines)
- No TODO placeholders

**Level 3 (References):**

- Referenced files exist (errors on broken links)
- No empty directories (warnings)
- Scripts are executable (warnings)
- Scripts have shebang (#!)

#### Output Format

**Valid Skill:**

```
✅ Skill is valid!

📊 Progressive Disclosure Stats:

  Level 1 (Metadata - Always Loaded):
    Description: 156 chars, ~18 tokens ✅ Optimal
    (Target: <200 chars, <30 tokens for Level 1 efficiency)

  Level 2 (SKILL.md Body - Loaded when triggered):
    Lines: 48 (target: ~50, max: ~150) ✅ Excellent
    Words: 342 (recommended: <1000, max: <5000) ✅ Excellent
    Est. tokens: ~445 (budget: <6500) within budget
    Code blocks: 1 ✅
    Sections: 5 ✅

  Level 3+ (References - Loaded as needed):
    Use references/ directory for detailed docs (unlimited size)

  Overall Assessment:
    ✅ Excellent progressive disclosure!
```

**With Warnings:**

```
⚠️ Skill is valid (with warnings)

⚠️ Warnings:
  ⚠️  Description contains long lists (5 commas)
      → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)
  ⚠️  SKILL.md body is 85 lines (recommended: ~50, max: ~80)
      → Consider moving detailed examples to references/ for Level 3 loading

📊 Progressive Disclosure Stats:
  [... stats output ...]
```

**With Errors:**

```
❌ Skill validation failed

❌ Errors:
  ❌ Referenced file not found: references/examples.md
      → Linked from: [references/examples.md]
      → Create the file or remove the broken link
  ❌ Description too long (max 1024 chars per Anthropic): 1250

📊 Progressive Disclosure Stats:
  [... stats output ...]
```

#### Exit Codes

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| 0    | Valid (no errors)                             |
| 1    | Invalid (has errors)                          |
| 1    | Valid but has warnings (only with `--strict`) |

---

### `doctor` - Fix Common Issues

Automatically fix common skill issues to ensure compatibility with
Claude Code.

#### Syntax

```bash
claude-skills-cli doctor <skill_path>
```

#### Arguments

| Argument       | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `<skill_path>` | string | Yes      | Path to skill directory |

#### What It Fixes

**Multi-line Descriptions:**

When formatters like Prettier wrap descriptions across multiple lines,
Claude Code cannot recognize the skill. The doctor command:

1. Detects multi-line descriptions in YAML frontmatter
2. Adds `# prettier-ignore` comment before the description field
3. Reflows the description to a single line

**Example:**

Before:

```yaml
---
name: my-skill
description:
  This is a long description that got wrapped by prettier across
  multiple lines
---
```

After:

```yaml
---
name: my-skill
# prettier-ignore
description: This is a long description that got wrapped by prettier across multiple lines
---
```

#### Examples

```bash
# Fix multi-line description
npx claude-skills-cli doctor .claude/skills/my-skill

# Common workflow after formatting
npx prettier --write .claude/skills/my-skill/SKILL.md
npx claude-skills-cli doctor .claude/skills/my-skill
npx claude-skills-cli validate .claude/skills/my-skill
```

#### Output

**When issues are found:**

```
📋 Running doctor on: my-skill
============================================================
📋 Found multi-line description. Fixing...
✅ Fixed multi-line description!

Changes made:
  • Added # prettier-ignore comment before description
  • Reflowed description to single line

✓ Run validate command to confirm the fix
```

**When no issues exist:**

```
📋 Running doctor on: my-skill
============================================================
✅ No issues found. Description is already on a single line.
```

#### Exit Codes

| Code | Meaning                      |
| ---- | ---------------------------- |
| 0    | Success (fixed or no issues) |
| 1    | Error (file not found, etc.) |

#### When to Use

Run `doctor` when:

- Validation warns about multi-line descriptions
- After running code formatters (Prettier, dprint, etc.)
- After manually editing SKILL.md files
- Before packaging or distributing skills

---

### `package` - Create Distribution Zip

Package skill into a zip file for distribution.

#### Syntax

```bash
claude-skills-cli package <skill_path> [options]
```

#### Arguments

| Argument       | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `<skill_path>` | string | Yes      | Path to skill directory |

#### Options

| Option              | Type    | Description                         |
| ------------------- | ------- | ----------------------------------- |
| `--output <path>`   | string  | Output directory (default: `dist/`) |
| `--skip-validation` | boolean | Skip validation before packaging    |

#### Examples

```bash
# Package skill (validates first)
npx claude-skills-cli package .claude/skills/my-skill

# Custom output directory
npx claude-skills-cli package .claude/skills/my-skill --output builds/

# Skip validation (not recommended)
npx claude-skills-cli package .claude/skills/my-skill --skip-validation
```

#### Excluded Files

The packager automatically excludes:

- Hidden files (`.gitignore`, `.git/`, `.env`, etc.)
- Editor temp files (`.swp`, `~`, `.bak`)
- OS files (`.DS_Store`)

#### Output

```
✅ Skill validation passed

📦 Packaging skill: my-skill
✅ Package created: dist/my-skill.zip
```

**With validation errors (without --skip-validation):**

```
❌ Skill validation failed
Packaging aborted. Fix errors or use --skip-validation
```

#### Distribution

The created zip can be:

1. Uploaded to Claude.ai (Settings > Features > Skills)
2. Uploaded via API (`/v1/skills` endpoint)
3. Shared with team members
4. Version controlled in git

---

## Common Workflows

### Create and Validate New Skill

```bash
# 1. Create skill
npx claude-skills-cli init --name database-queries \
  --description "SQLite queries. Use when writing SELECT, INSERT, UPDATE"

# 2. Edit SKILL.md
vim .claude/skills/database-queries/SKILL.md

# 3. Add references
vim .claude/skills/database-queries/references/schema.md

# 4. Format (if using formatter)
npx prettier --write .claude/skills/database-queries/SKILL.md

# 5. Fix any formatting issues
npx claude-skills-cli doctor .claude/skills/database-queries

# 6. Validate
npx claude-skills-cli validate .claude/skills/database-queries

# 7. Fix any remaining issues, re-validate
npx claude-skills-cli validate .claude/skills/database-queries

# 8. Package
npx claude-skills-cli package .claude/skills/database-queries
```

### Strict Validation in CI

```bash
# package.json
{
  "scripts": {
    "test:skills": "claude-skills-cli validate .claude/skills/* --strict"
  }
}

# Run in CI
npm run test:skills
```

### Batch Validate All Skills

```bash
# Bash script to validate all skills
for skill in .claude/skills/*/; do
  echo "Validating $skill"
  npx claude-skills-cli validate "$skill" || exit 1
done
```

### Quick Skill Creation

```bash
# One-liner with validation
npx claude-skills-cli init --name my-skill --description "Brief desc" && \
  npx claude-skills-cli validate .claude/skills/my-skill
```

---

## Environment Variables

Currently, the CLI does not use environment variables. All
configuration is via command-line flags.

---

## Error Messages

### Common Errors

**Invalid skill name:**

```
❌ Skill name must be lowercase: MySkill
```

**Missing required field:**

```
❌ SKILL.md frontmatter missing 'description' field
```

**Broken reference link:**

```
❌ Referenced file not found: references/examples.md
    → Linked from: [references/examples.md]
    → Create the file or remove the broken link
```

**Description too long:**

```
❌ Description too long (max 1024 chars per Anthropic): 1250
```

---

## Tips and Best Practices

### Naming Skills

✅ Good names:

- `database-queries`
- `auth-patterns`
- `ui-components`
- `api-client`

❌ Bad names:

- `DatabaseQueries` (not lowercase)
- `db queries` (spaces not allowed)
- `api_client` (underscores not recommended)

### Writing Descriptions

✅ Good descriptions:

```yaml
description:
  SQLite database operations using better-sqlite3 for contacts,
  companies, and interactions. Use when writing SELECT, INSERT,
  UPDATE, or DELETE operations.
```

❌ Bad descriptions:

```yaml
description: Database helper
```

### Progressive Disclosure

**Keep Level 1 & 2 lean:**

- Level 1: <200 chars, keyword-rich
- Level 2: ~50 lines, quick reference
- Level 3: Move details to references/

### Validation Workflow

1. Run `validate` frequently during development
2. Fix errors before warnings
3. Use `--strict` in CI/CD pipelines
4. Aim for "✅ Excellent progressive disclosure!"

---

## Package.json Integration

```json
{
	"scripts": {
		"skill:new": "claude-skills-cli init",
		"skill:validate": "claude-skills-cli validate .claude/skills/*",
		"skill:validate:strict": "claude-skills-cli validate .claude/skills/* --strict",
		"skill:package": "claude-skills-cli package",
		"skill:check": "npm run skill:validate:strict"
	},
	"devDependencies": {
		"claude-skills-cli": "^0.0.3"
	}
}
```

---

## Version Information

```bash
# Check CLI version
npx claude-skills-cli --version

# Show help
npx claude-skills-cli --help
npx claude-skills-cli init --help
```

---

## Resources

- [GitHub Repository](https://github.com/spences10/claude-skills-cli)
- [Anthropic Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
