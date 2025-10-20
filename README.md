# claude-skills-cli

TypeScript CLI toolkit for creating, validating, and packaging Claude Agent Skills with **progressive disclosure validation**.

## What This Is

A command-line tool for managing Claude Agent Skills. It enforces the 3-level progressive disclosure system from [Anthropic's Skills documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview), ensuring skills are token-efficient and scannable.

```bash
npx claude-skills init --name my-skill --description "Brief description"
npx claude-skills validate .claude/skills/my-skill
npx claude-skills stats .claude/skills
npx claude-skills package .claude/skills/my-skill
```

## Commands

### `init` - Create a new skill

```bash
claude-skills init --name my-skill --description "Brief description with trigger keywords"

# With example files (for learning)
claude-skills init --name my-skill --description "..." --with-examples
```

**Default behavior** (minimal scaffolding):

- **SKILL.md** - Minimal ~30 line template with progressive disclosure guidelines
- **README.md** - Skill documentation
- **references/** - Empty directory for Level 3 detailed documentation

**With `--with-examples` flag** (full scaffolding):

- All of the above, plus:
- **scripts/example.js** - Example executable script
- **assets/** - Directory for templates and resources
- **references/detailed-guide.md** - Example reference file

The generated SKILL.md template follows best practices:

- 1-2 code blocks maximum
- Clear "Quick Start" section
- Links to references/ for detailed content
- Progressive disclosure comments inline (not counted in line validation)

### `validate` - Validate skill structure

```bash
claude-skills validate .claude/skills/my-skill
claude-skills validate .claude/skills/my-skill --strict
```

**Progressive Disclosure Validation** (3-Level System):

| Level                      | Content           | Checks                                                                                                                                                                                                                                       |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Level 1: Metadata**      | YAML frontmatter  | Description <200 chars (warn), <300 chars (error)<br>Trigger keywords present ("Use when/for/to")<br>No list bloat (warn if >150 chars AND ≥5 commas)                                                                                        |
| **Level 2: SKILL.md Body** | Main instructions | Line count ~50 (warn >80, error >150) - excludes HTML comments<br>Word count <1000 (warn), <5000 (error)<br>Code blocks ≤3 (recommend 1-2)<br>Sections ≤8 (recommend 3-5)<br>"Quick Start" section present<br>Links to references/ when long |
| **Level 3: References**    | Bundled files     | Referenced files exist (error on broken links)<br>No empty directories                                                                                                                                                                       |

**Validation Output:**

The validator displays a detailed progressive disclosure stats breakdown:

```
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

**Exit codes:**

- 0 = Valid (or valid with warnings)
- 1 = Validation errors
- 1 with `--strict` = Warnings treated as errors

### `package` - Create uploadable zip

```bash
claude-skills package .claude/skills/my-skill
claude-skills package .claude/skills/my-skill --output dist/
claude-skills package .claude/skills/my-skill --skip-validation
```

Creates a zip file ready to upload to Claude.ai, excluding:

- Hidden files (.\*)
- Build artifacts (dist/, build/)
- Swap files (~, .swp)

Runs validation first unless `--skip-validation` is specified.

### `stats` - View all skills overview

```bash
claude-skills stats
claude-skills stats .claude/skills
```

Displays an overview of all skills in a directory with:

- Validation status (✅ valid, ⚠️ warnings, ❌ errors)
- Description length and quality rating
- Body size (lines, words) with quality rating
- Reference file count and total size
- Summary statistics

**Example output:**

```
📊 Skills Overview
============================================================
3 skills found:

auth-patterns (✅ valid)
  Description: 127 chars (optimal)
  Body: 76 lines, 258 words (excellent)
  References: 3 files (20.8 KB)

styling-patterns (⚠️  warnings)
  Description: 106 chars (optimal)
  Body: 85 lines, 284 words (good)
  References: 1 file (11.2 KB)
  2 warnings

Summary:
  Valid: 2
  With warnings: 1
```

## The Progressive Disclosure System

Claude Skills use a 3-level loading system to optimize token usage:

| Level  | File                           | Context Window             | Token Budget |
| ------ | ------------------------------ | -------------------------- | ------------ |
| **1**  | SKILL.md Metadata (YAML)       | Always loaded              | ~100 tokens  |
| **2**  | SKILL.md Body (Markdown)       | Loaded when skill triggers | <5k tokens   |
| **3+** | references/, scripts/, assets/ | Loaded as-needed by Claude | Unlimited    |

### Why This Matters

- **Level 1** is always in Claude's context, so keep descriptions <200 chars
- **Level 2** loads when Claude thinks the skill is relevant, so keep it scannable (~50 lines)
- **Level 3** loads on-demand, so move detailed docs, examples, and schemas there

The validator enforces these constraints to ensure skills are token-efficient.

## Installation

### As a project dependency:

```bash
npm install claude-skills-cli --save-dev
```

### Global installation:

```bash
npm install -g claude-skills-cli
```

### Using npx (no install):

```bash
npx claude-skills-cli init my-skill
```

## Example Workflow

```bash
# 1. Create a new skill (minimal by default)
npx claude-skills init --name database-queries \
  --description "SQLite queries for contacts and companies. Use when querying the database."

# 2. Edit the generated SKILL.md
# - Keep it under 50 lines
# - Use 1 minimal code example in Quick Start
# - Add detailed docs to references/ directory

# 3. Validate before using
npx claude-skills validate .claude/skills/database-queries

# 4. View all skills
npx claude-skills stats .claude/skills

# 5. Fix any warnings (or use --strict to enforce)
npx claude-skills validate .claude/skills/database-queries --strict

# 6. Package for sharing
npx claude-skills package .claude/skills/database-queries
```

## Validation Best Practices

### ✅ Good Skill (Passes Validation)

````markdown
---
name: api-client
description: REST API client for our service. Use when making HTTP requests to api.example.com.
---

# API Client

## Quick Start

```typescript
import { apiClient } from '$lib/api';

const response = await apiClient.get('/users');
```
````

## Core Principles

- Use typed requests and responses
- Handle errors with try/catch
- Include authentication headers

## Reference Files

- [references/endpoints.md](references/endpoints.md) - Complete API reference
- [references/examples.md](references/examples.md) - Request/response examples

````

**Why it's good:**
- Description: 81 chars with trigger keywords ✅
- Lines: ~25 lines ✅
- Code blocks: 1 ✅
- Has Quick Start section ✅
- Links to references/ for details ✅

### ❌ Bad Skill (Fails Validation)

```markdown
---
name: api-client
description: Comprehensive REST API client for making HTTP requests to our service endpoints including GET, POST, PUT, DELETE, PATCH operations with authentication, error handling, retries, rate limiting, and response caching for users, posts, comments, tags, categories, and settings endpoints.
---

# API Client

[186 lines of detailed documentation with 7 code blocks...]
````

**Problems:**

- Description: 287 chars, no trigger keywords ❌
- Lines: 186 (max 150) ❌
- Code blocks: 7 (recommend 1-2) ❌
- No Quick Start section ❌
- Should split into references/ ❌

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
node dist/index.js validate path/to/skill

# Format code
npm run format

# Type check
npx tsc --noEmit
```

## Resources

### Official Documentation

- [Agent Skills Overview](https://www.anthropic.com/news/skills)
- [Engineering Blog: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Docs: Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)

### Included Documentation

- [docs/SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) - Progressive disclosure system
- [docs/SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - Skill creation workflow
- [docs/SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real-world examples

## License

MIT © Scott Spence

## Contributing

Contributions welcome! This tool is designed to help Claude use skills efficiently. When proposing changes, consider:

1. **Token efficiency** - Does this help reduce token usage?
2. **Ergonomics for Claude** - Is it easy for Claude to understand and use?
3. **Progressive disclosure** - Does it enforce the 3-level system?

See the feedback document at [skills/skill-creator/references/cli-feedback.md](skills/skill-creator/references/cli-feedback.md) for real-world usage patterns and implemented improvements.
