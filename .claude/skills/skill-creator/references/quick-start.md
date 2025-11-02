# Quick Start Guide

## Creating Your First Skill

1. **Create the skill directory**

   ```bash
   mkdir -p .claude/skills/my-skill
   ```

2. **Create SKILL.md with frontmatter**

   ```markdown
   ---
   name: my-skill
   description: Brief description of what this skill does
   ---

   # My Skill

   Core instructions go here...
   ```

3. **Test in conversation**
   - Invoke the skill using the Skill tool
   - Verify it loads and provides correct guidance

4. **Iterate and expand**
   - Add references/ directory for detailed documentation
   - Add scripts/ for executable operations
   - Add assets/ for templates and files

## Skill Structure Details

### Directory Layout

```
my-skill/
├── SKILL.md          # Core instructions + YAML frontmatter
├── references/       # Detailed documentation (loaded as needed)
│   ├── guide.md
│   └── examples.md
├── scripts/          # Executable shell scripts or programs
│   └── setup.sh
└── assets/           # Templates, images, configuration files
    └── template.yaml
```

### SKILL.md Anatomy

```markdown
---
name: skill-name # Unique identifier
description: Short desc # <200 chars, shows in skill list
---

# Skill Title

Brief overview of what this skill does.

## Section 1

Core patterns and instructions...

## Section 2

More essential guidance...
```

## Progressive Disclosure Strategy

### Level 1: Metadata (Always Loaded)

- YAML frontmatter only
- Target: <200 chars, <30 tokens
- Used for: Skill discovery and triggering

### Level 2: Instructions (Loaded When Triggered)

- SKILL.md body content
- Target: <50 lines, <1000 words, <680 tokens
- Contains: Core patterns, essential rules, reference links

### Level 3: Resources (Loaded On Demand)

- references/ scripts/ assets/ directories
- Size: Unlimited
- Contains: Detailed docs, code, templates

## Tips for Effective Skills

- **Start minimal**: Begin with just SKILL.md
- **Iterate**: Add references/ as complexity grows
- **Link clearly**: Use relative links to reference files
- **Test often**: Validate with `pnpx claude-skills-cli validate`
- **Stay focused**: One skill = one clear purpose
