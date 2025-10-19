---
name: skill-creator
description: Guide for creating effective Claude skills for devhub-crm. Use when users want to create a new skill or update an existing skill that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

Guide for creating effective Claude skills following Anthropic's best practices, adapted for devhub-crm.

## Overview

Skills are modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tools. Think of them as onboarding guides for specific domains that transform Claude from a general-purpose agent into a specialist equipped with procedural knowledge.

## The 6-Step Creation Process

### Step 1: Understanding with Concrete Examples

**Goal**: Clearly understand how the skill will be used in practice.

**Questions to ask**:
- "What specific task needs this skill?"
- "Can you give 3-5 concrete examples of using this?"
- "What would trigger Claude to use this skill?"
- "What context are you repeatedly providing?"

**Example**:
```
User: "I need a database skill"
Claude: "What specific database operations would you use this for?"
User: "Querying contacts, managing relationships, writing migrations"
Claude: "Can you give me actual query examples you use frequently?"
```

**Output**: 3-5 concrete usage examples before proceeding.

---

### Step 2: Planning Reusable Contents

**Goal**: Determine what goes in the skill.

**For each example, identify**:
1. What code is rewritten repeatedly? → `scripts/`
2. What context is repeated? → `SKILL.md` or `references/`
3. What templates are reused? → `assets/`

**Decision Matrix**:

| Content | Location | Example |
|---------|----------|---------|
| Core workflows | SKILL.md | "Use prepared statements" |
| Detailed docs | references/ | Complete schema with all columns |
| Repeated code | scripts/ | Validation logic, generators |
| Templates | assets/ | Boilerplate files, images |

**Output**: List of files to create with their purposes.

---

### Step 3: Initialize the Skill

**Use the init script**:
```bash
python .claude/scripts/init_skill.py \
  --name skill-name \
  --description "What it does and when to use it"
```

**This creates**:
```
.claude/skills/skill-name/
├── SKILL.md
├── README.md
├── references/detailed-guide.md
├── scripts/example.py
└── assets/
```

**Next**: Customize or delete example files as needed.

---

### Step 4: Edit the Skill

**Writing Guidelines**:
- ✅ Use imperative voice: "Use prepared statements"
- ❌ Not second person: "You should use prepared statements"
- ✅ Be specific: "Generate IDs with nanoid()"
- ❌ Not vague: "Use appropriate IDs"

**SKILL.md Structure**:

```markdown
---
name: skill-name
description: [What it does + when to use it, keywords for discovery]
---

# Skill Title

## Overview
[2-3 sentences on purpose]

## Quick Start
[Minimal working example]

## Core Patterns

### Pattern 1
[Common workflow with code]

### Pattern 2
[Another common workflow]

## Advanced Usage

For detailed information:
- [references/file1.md](references/file1.md)
- [references/file2.md](references/file2.md)

## Scripts

- `scripts/validate.py`: Description
- `scripts/generate.py`: Description

## Notes

- Important consideration 1
- Important consideration 2
```

**Key Questions to Answer**:
1. What is the purpose? (2-3 sentences)
2. When should this be used? (triggers/contexts)
3. How should Claude use this? (step-by-step)
4. What resources are bundled? (references, scripts, assets)

**References Guidelines**:
- One topic per file
- Descriptive names: `authentication-flow.md` not `auth.md`
- Include examples and code
- Link from SKILL.md

**Scripts Guidelines**:
- Include shebang (`#!/usr/bin/env python3`)
- Make executable (`chmod +x`)
- Add usage documentation
- Handle errors gracefully

**Assets Guidelines**:
- Templates that get copied/modified
- Images used in output
- Boilerplate code
- Configuration files

---

### Step 5: Validate and Package

**Validate first**:
```bash
python .claude/scripts/validate_skill.py .claude/skills/skill-name
```

**Fix any errors**, then package:
```bash
python .claude/scripts/package_skill.py .claude/skills/skill-name
```

**Creates**: `dist/skill-name.zip` ready for distribution.

**Validation checks**:
- YAML frontmatter format
- Required fields present
- Name matches directory
- References mentioned in SKILL.md
- Scripts are executable
- No TODO placeholders

---

### Step 6: Test and Iterate

**Testing**:
1. Use skill in real conversations
2. Notice struggles or inefficiencies
3. Update based on observations

**Iteration workflow**:
```bash
# Edit skill
vim .claude/skills/skill-name/SKILL.md

# Validate
python .claude/scripts/validate_skill.py .claude/skills/skill-name

# Test in conversation
# (Skills auto-reload in Claude Code)

# Package if sharing
python .claude/scripts/package_skill.py .claude/skills/skill-name
```

**Common improvements**:
- Add more examples
- Move details to references
- Create scripts for repeated patterns
- Clarify confusing instructions
- Enhance "when to use" guidance

---

## Progressive Disclosure Principle

Skills load in three levels:

### Level 1: Metadata (~100 tokens)
**Always in context**
```yaml
name: skill-name
description: What it does and when to use it
```

### Level 2: Instructions (<5k tokens)
**Loaded when triggered**
- SKILL.md body with core patterns
- Links to references and scripts

### Level 3: Resources (unlimited)
**Loaded as needed**
- references/: Documentation Claude reads
- scripts/: Code Claude executes
- assets/: Files Claude uses in output

## Best Practices

### Do:
✅ Start with concrete examples
✅ Use imperative voice
✅ Keep SKILL.md under 5k words
✅ Link to references for details
✅ Include "when to use" in description
✅ Test on real tasks
✅ Iterate based on usage

### Don't:
❌ Use second person ("you")
❌ Duplicate content across files
❌ Include everything inline
❌ Use generic descriptions
❌ Leave TODO placeholders
❌ Skip validation

## devhub-crm Skill Patterns

### Database Skills
- Schema in references/schema.md
- Query patterns in SKILL.md
- Validation scripts for consistency
- Migration helpers

### Component Skills
- Basic templates in SKILL.md
- Component catalog in references/
- Example components in assets/
- Type definitions included

### Integration Skills
- Auth patterns in SKILL.md
- API docs in references/
- Connection tests in scripts/
- Rate limit handling

### Styling Skills
- Core conventions in SKILL.md
- Complete reference in references/
- Theme examples in assets/
- Validation for consistency

## Quick Reference Commands

```bash
# Create new skill
python .claude/scripts/init_skill.py --name my-skill --description "..."

# Validate skill
python .claude/scripts/validate_skill.py .claude/skills/my-skill

# Package skill
python .claude/scripts/package_skill.py .claude/skills/my-skill

# Validate strictly (warnings = errors)
python .claude/scripts/validate_skill.py .claude/skills/my-skill --strict
```

## Resources

See also:
- [references/skill-examples.md](references/skill-examples.md) - Real examples from Anthropic
- [references/writing-guide.md](references/writing-guide.md) - Detailed writing guidelines
- [../../docs/SKILLS-ARCHITECTURE.md](../../docs/SKILLS-ARCHITECTURE.md) - Complete architecture
- [../../docs/SKILL-DEVELOPMENT.md](../../docs/SKILL-DEVELOPMENT.md) - Development workflow

## Notes

- Skills are never truly "done" - iterate based on usage
- Start minimal, add complexity as needed
- Test early and often
- Real examples beat invented ones
- Write for Claude, not humans
- Description drives discovery - make it count
