---
name: skill-creator
description:
  Design and create Claude Skills using progressive disclosure
  principles. Use when building new skills, planning skill
  architecture, or writing skill content.
---

# Skill Creator

Principles and patterns for designing effective Claude Skills.

## Quick Start

Creating a minimal skill:

1. Create directory: `.claude/skills/my-skill/`
2. Create `SKILL.md` with frontmatter (name, description) and body
3. Test in conversation
4. Add references/ as content grows

## When to Create a Skill

Create a skill when you notice:

- **Repeating context** across conversations (same schema, patterns,
  rules)
- **Domain expertise** needed repeatedly (API integration, framework
  conventions)
- **Project-specific knowledge** that Claude should know automatically

Example: "I keep explaining this database schema" → Create a
database-schema skill.

## Skill Architecture

Skills are directories with this structure:

```
my-skill/
├── SKILL.md          # Required: Instructions + metadata
├── references/       # Optional: Detailed documentation
├── scripts/          # Optional: Executable operations
└── assets/           # Optional: Templates, images, files
```

**SKILL.md** - Core instructions with YAML frontmatter (name,
description) + markdown body

**references/** - Detailed docs loaded only when Claude needs them
(schemas, API docs, guides)

**scripts/** - Deterministic operations Claude can execute without
generating code (validation, generation)

**assets/** - Files used directly in output without loading into
context (templates, images)

## Progressive Disclosure

Skills load in 3 levels:

**Level 1: Metadata** (~100 tokens, always loaded) - YAML frontmatter
determines skill triggering

**Level 2: Instructions** (<5k tokens, when triggered) - SKILL.md body
with core patterns and links

**Level 3: Resources** (unlimited, as needed) - references/ scripts/
assets/ loaded only when used

**Key principle**: Keep Levels 1 & 2 lean. Move details to Level 3.

## Development Process

1. **Recognize** - Notice repeated context or domain needs
2. **Gather** - Collect 3-5 concrete examples of skill usage
3. **Plan** - Decide what goes in SKILL.md vs references/ vs scripts/
4. **Structure** - Create directory with SKILL.md and needed
   subdirectories
5. **Write** - Craft description, then SKILL.md body following
   patterns
6. **Enhance** - Add references, scripts, assets as needed
7. **Iterate** - Test in conversations, refine based on actual usage

## Writing Effective Content

**Descriptions**: Include "Use when..." triggers, <200 chars optimal.
Format: [Domain] + [Operations] + [Trigger keywords]

**SKILL.md Body**: Target ~50 lines, max ~150. Structure: Quick
Start + Core Patterns (3-5) + Links. Use imperative voice, concrete
examples.

**References**: Detailed docs with no size limit. Use descriptive
filenames.

## Common Patterns

**Succeeds**: Domain expertise, concrete examples, keyword-rich
descriptions, clear triggers, scripts for deterministic tasks

**Fails**: Generic descriptions, bloated SKILL.md, second person
voice, missing triggers, vague content

See [skill-examples.md](references/skill-examples.md) for detailed
patterns.

## Implementation

Skills can be created manually (mkdir, touch SKILL.md) or using tools
like `claude-skills-cli`.

For tool usage, see [cli-reference.md](references/cli-reference.md).

## Reference Documentation

For detailed guidance:

- [anthropic-resources.md](references/anthropic-resources.md) -
  Official Anthropic best practices
- [writing-guide.md](references/writing-guide.md) - Voice, structure,
  and code examples
- [skill-examples.md](references/skill-examples.md) - Real-world
  patterns and anti-patterns
- [cli-reference.md](references/cli-reference.md) - Tool commands
  (claude-skills-cli)

## Notes

- Skills are iterative - start minimal, refine through real usage
- Description drives discovery - invest time in crafting it
- Test in actual conversations to validate effectiveness
- Progressive disclosure is key - resist urge to front-load everything

<!--
PROGRESSIVE DISCLOSURE:
- This is Level 2 - principles and architecture only
- Tool-specific details are in references/
- Target: ~75 lines for optimal scannability
-->
