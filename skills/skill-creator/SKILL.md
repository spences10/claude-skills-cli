---
name: skill-creator
description: Create Claude Skills using claude-skills-cli. Use when building new skills, running validation, or packaging skills for distribution with TypeScript/Node.
---

# Skill Creator

Create effective Claude Skills using the `claude-skills-cli` tool (TypeScript/Node).

## Quick Start

```bash
# Create skill
npx claude-skills init --name my-skill \
  --description "What it does. Use when [trigger keywords]"

# Validate
npx claude-skills validate .claude/skills/my-skill

# Package
npx claude-skills package .claude/skills/my-skill
```

## Progressive Disclosure System

Skills load in 3 levels:

| Level                       | When Loaded    | Token Budget |
| --------------------------- | -------------- | ------------ |
| **Level 1** - Metadata      | Always         | ~100 tokens  |
| **Level 2** - SKILL.md body | When triggered | <5k tokens   |
| **Level 3** - Bundled files | As needed      | Unlimited    |

**Key principle**: Keep Level 1 & 2 lean. Move details to Level 3.

## CLI Commands

### init - Create Skill

```bash
npx claude-skills init --name skill-name \
  --description "Brief description with trigger keywords"
```

Creates: `SKILL.md`, `README.md`, `references/`

### validate - Check Quality

```bash
npx claude-skills validate .claude/skills/skill-name
npx claude-skills validate .claude/skills/skill-name --strict
```

Checks progressive disclosure compliance.

### package - Create Zip

```bash
npx claude-skills package .claude/skills/skill-name
```

Creates uploadable zip for Claude.ai or API.

## Writing Tips

**Level 1 (Description)**:

- Format: `[Tech] + [Operations] + [Trigger]`
- Target: <200 chars
- Include: "Use when...", "Use for...", "Use to..."

**Level 2 (SKILL.md Body)**:

- Target: ~50 lines
- Structure: Quick Start, Core Patterns (3-5), Links to references
- Voice: Imperative ("Use X"), not second person ("You should use X")

**Level 3 (References)**:

- Move detailed docs to `references/`
- Link from SKILL.md
- Unlimited size

## Reference Documentation

For detailed guidance:

- [cli-reference.md](references/cli-reference.md) - Complete CLI commands and options
- [cli-feedback.md](references/cli-feedback.md) - Real-world usage patterns and tips
- [anthropic-resources.md](references/anthropic-resources.md) - Official Anthropic best practices
- [writing-guide.md](references/writing-guide.md) - Voice, structure, and code examples
- [skill-examples.md](references/skill-examples.md) - Example skills and patterns

## Notes

- Skills are iterative - start minimal, refine based on usage
- Description drives discovery - make it keyword-rich
- Validate frequently during development
- Test in real conversations

<!--
PROGRESSIVE DISCLOSURE:
- This is Level 2 - keep lean and scannable
- Move detailed content to references/
- Target: ~50 lines for optimal scannability
-->
