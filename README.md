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

For Claude Code to read, this id detailed in the CLI

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
```

Validates progressive disclosure compliance:

- Level 1: Description length, trigger keywords, no list bloat
- Level 2: Line count (~50), word count (<1000), code blocks (1-2),
  sections (3-5)
- Level 3: Referenced files exist, no broken links

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

## Resources

**Included docs:**

- [docs/SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) -
  Progressive disclosure system
- [docs/SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - Skill
  creation workflow
- [docs/SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real-world
  examples
- [skills/skill-creator/](skills/skill-creator/) - Skill for creating
  skills

**Official Anthropic docs:**

- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Repository](https://github.com/anthropics/skills)
