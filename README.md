# claude-skills-cli

CLI for creating Claude Agent Skills with progressive disclosure
validation. Built for Claude Code to use when humans ask it to create
skills.

## For Humans Using Claude Code

Tell Claude Code to create skills with specific package manager
commands.

Using npm:

```
"Use npx -y claude-skills-cli to create a skill for my API client code"
```

Using pnpm:

```
"Use pnpx claude-skills-cli to create a skill for my API client code"
```

This CLI enforces progressive disclosure so Claude doesn't write
500-line documentation files.

## Progressive Disclosure

Skills load in 3 levels to optimize token usage:

| Level | Content                        | When Loaded         | Size Limit |
| ----- | ------------------------------ | ------------------- | ---------- |
| **1** | SKILL.md metadata (YAML)       | Always in context   | <200 chars |
| **2** | SKILL.md body (Markdown)       | When skill triggers | ~50 lines  |
| **3** | references/, scripts/, assets/ | As needed by Claude | Unlimited  |

This CLI enforces these constraints through validation, keeping skills
lean and scannable.

## Commands

### init

```bash
pnpx claude-skills-cli init --name my-skill --description "Brief description with trigger keywords"
pnpx claude-skills-cli init --name my-skill --description "..." --with-examples
```

Creates minimal skill scaffolding by default (SKILL.md, README.md,
references/). Use `--with-examples` for example files.

### validate

```bash
pnpx claude-skills-cli validate .claude/skills/my-skill
pnpx claude-skills-cli validate .claude/skills/my-skill --strict
pnpx claude-skills-cli validate .claude/skills/my-skill --format json
```

Comprehensive validation including:

**Structure & Format:**

- Name format (kebab-case) and directory matching
- YAML frontmatter validity
- Required fields presence

**Level 1 (Metadata):**

- Description length (<200 chars optimal, ~30 tokens)
- Trigger phrase presence and specificity
- User phrasing (third-person, action-oriented, gerunds)
- Keyword richness and alignment with content

**Level 2 (SKILL.md Body):**

- Line count (~50 target, 150 max)
- Word count (<1000 recommended, <5000 max)
- Token estimates (<6500 budget)
- Code blocks (1-2 optimal)
- Sections (3-5 recommended)

**Level 3 (References):**

- Referenced files exist (no broken links)
- Orphaned files detection
- Nesting depth analysis
- Progressive disclosure structure

Use `--strict` to fail on warnings, `--format json` for programmatic
use.

### doctor

```bash
pnpx claude-skills-cli doctor .claude/skills/my-skill
```

Automatically fixes common skill issues:

- **Multi-line descriptions**: Adds `# prettier-ignore` and reflows
  description to single line
- Ensures Claude Code can recognize the skill

Run after formatting or if validation warns about multi-line
descriptions.

### stats

```bash
pnpx claude-skills-cli stats .claude/skills
```

Shows overview of all skills with validation status, sizes, and
quality ratings.

### package

```bash
pnpx claude-skills-cli package .claude/skills/my-skill
```

Creates uploadable zip for Claude.ai. Validates first unless
`--skip-validation` specified.

### add-hook

```bash
pnpx claude-skills-cli add-hook            # Global (all projects)
pnpx claude-skills-cli add-hook --project  # Project (committed)
pnpx claude-skills-cli add-hook --local    # Project-local (gitignored)
```

Adds skill activation hook to improve reliability. By default, adds to
global settings (`~/.claude/settings.json`) to apply across all
projects. Use `--project` for team-shared settings or `--local` for
personal overrides.

## Skill Activation in Claude Code

Skills are designed to auto-activate in Claude Code, but, in reality,
activation can be inconsistent. To improve reliability and make Claude
check for relevant skills more consistently, use the `add-hook`
command:

```bash
pnpx claude-skills-cli add-hook  # Recommended: global (all projects)
```

This adds a hook that:

- Fires before Claude processes each prompt (~15 tokens/prompt)
- Makes Claude consistently check for relevant skills
- Requires no maintenance (unlike pattern-based approaches)
- Claude decides which skills apply to the current task

**Scopes:**

- **Global** (default): `~/.claude/settings.json` - applies to all
  projects
- **Project** (`--project`): `./.claude/settings.json` - committed to
  git, team-shared
- **Local** (`--local`): `./.claude/settings.local.json` - gitignored,
  personal

**Note:** This hook pattern is widely adopted by the community to
improve skill activation reliability.

## Resources

**Included docs:**

- [docs/SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) -
  Progressive disclosure system
- [docs/SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - Skill
  creation workflow
- [docs/SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real-world
  examples
- [.claude/skills/skill-creator/](.claude/skills/skill-creator/) -
  Skill for creating skills (validated example)

**Official Anthropic docs:**

- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Repository](https://github.com/anthropics/skills)
