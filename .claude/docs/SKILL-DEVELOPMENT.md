# Skill Development Workflow

## Quick Start

```bash
# Create a new skill
python .claude/scripts/init_skill.py --name my-skill --description "What it does"

# Validate the skill
python .claude/scripts/validate_skill.py .claude/skills/my-skill

# Package for distribution
python .claude/scripts/package_skill.py .claude/skills/my-skill
```

## The 6-Step Process

Based on Anthropic's skill-creator methodology, adapted for devhub-crm.

### Step 1: Understanding with Concrete Examples

**Goal**: Clearly understand how the skill will be used in practice.

**Process**:
1. Identify specific scenarios where skill is needed
2. Collect real examples from your workflow
3. Note what Claude struggles with currently
4. Validate examples with actual usage

**Example Questions**:
- "What task am I repeating that needs this skill?"
- "Can I give 3-5 concrete examples of using this?"
- "What would trigger Claude to use this skill?"
- "What information does Claude need that I keep providing?"

**Output**: 3-5 concrete examples of skill usage

---

### Step 2: Planning Reusable Contents

**Goal**: Analyze examples to determine what to include in skill.

**For each example, ask**:
1. What would Claude need to execute this from scratch?
2. What code is being rewritten repeatedly? → `scripts/`
3. What context is repeated each time? → `SKILL.md` or `references/`
4. What templates or assets are reused? → `assets/`

**Decision Matrix**:

| Content Type | Goes In | Example |
|--------------|---------|---------|
| Core workflow patterns | SKILL.md | "Always use prepared statements" |
| Detailed documentation | references/ | Complete API reference |
| Repeated code | scripts/ | Validation logic |
| Templates/resources | assets/ | Boilerplate HTML |

**Output**: List of files to create with their purposes

---

### Step 3: Initializing the Skill

**Command**:
```bash
python .claude/scripts/init_skill.py \
  --name database-patterns \
  --description "Guide for SQLite operations..."
```

**What This Creates**:
```
.claude/skills/database-patterns/
├── SKILL.md                    # With frontmatter template
├── README.md                   # Human documentation
├── references/
│   └── detailed-guide.md       # Example reference
├── scripts/
│   └── example.py              # Example script
└── assets/                     # Empty directory
```

**Next**: Customize or delete example files as needed

---

### Step 4: Editing the Skill

**Focus**: Write content for another instance of Claude to use effectively.

#### Start with Reusable Contents

1. **Add scripts** (if identified in Step 2)
   ```bash
   cd .claude/skills/database-patterns/scripts/
   # Create validation, generation, or analysis scripts
   ```

2. **Add references** (if identified in Step 2)
   ```bash
   cd references/
   # Create detailed documentation files
   ```

3. **Add assets** (if identified in Step 2)
   ```bash
   cd assets/
   # Copy templates, images, or other resources
   ```

4. **Delete unused directories**
   ```bash
   # If you don't need scripts:
   rm -rf scripts/
   ```

#### Update SKILL.md

**Writing Guidelines**:
- ✅ Use imperative/infinitive form: "Use prepared statements"
- ❌ Not second person: "You should use prepared statements"
- ✅ Be specific: "Generate IDs with nanoid()"
- ❌ Not vague: "Use appropriate IDs"

**Structure to Include**:

```markdown
---
name: skill-name
description: [What it does + When to use it]
---

# Skill Title

## Overview
[2-3 sentences on purpose]

## Quick Start
[Minimal example showing basic usage]

## Core Patterns

### Pattern 1
[Common workflow with code example]

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

**Questions to Answer**:
1. What is the purpose? (2-3 sentences)
2. When should this be used? (triggers/contexts)
3. How should Claude use this? (step-by-step)
4. What bundled resources exist? (references, scripts, assets)

---

### Step 5: Packaging the Skill

**Validation First**:
```bash
python .claude/scripts/validate_skill.py .claude/skills/database-patterns

# Output shows:
# ✅ All required fields present
# ✅ SKILL.md structure correct
# ⚠️  Warning: Reference file not mentioned in SKILL.md
```

**Fix Validation Issues**, then package:
```bash
python .claude/scripts/package_skill.py .claude/skills/database-patterns

# Creates:
# dist/database-patterns.zip
```

**The package includes**:
- All files from skill directory
- Maintains directory structure
- Excludes hidden files and temp files
- Ready to upload to Claude.ai or share

---

### Step 6: Iterate

**Test the Skill**:
1. Use skill in real conversations
2. Notice where it struggles or excels
3. Collect feedback from actual usage
4. Update SKILL.md or references based on observations

**Iteration Workflow**:
```bash
# Edit skill content
vim .claude/skills/database-patterns/SKILL.md

# Validate changes
python .claude/scripts/validate_skill.py .claude/skills/database-patterns

# Test in conversation
# (Skills auto-reload in Claude Code)

# Package new version if needed
python .claude/scripts/package_skill.py .claude/skills/database-patterns
```

**Common Iterations**:
- Add more examples to SKILL.md
- Move detailed content to references
- Create new scripts for repeated tasks
- Clarify confusing instructions
- Add "when to use" guidance

---

## Development Best Practices

### Start Small
Begin with minimal SKILL.md, add complexity only as needed:
```markdown
# Version 1: Just core patterns
# Version 2: Add references
# Version 3: Add scripts
# Version 4: Add assets
```

### Test Early and Often
Don't wait until skill is "complete":
- Test after basic SKILL.md is written
- Iterate based on actual usage
- Skills are never truly "done"

### Use Real Examples
Pull examples from actual code, not invented scenarios:
```typescript
// ✅ Good: From your actual codebase
const stmt = db.prepare('SELECT * FROM contacts WHERE user_id = ?');
const contacts = stmt.all(user_id) as Contact[];

// ❌ Bad: Generic example
const result = database.query('SELECT * FROM table');
```

### Keep SKILL.md Lean
When it grows beyond 5k words, split content:
- Core workflows → stay in SKILL.md
- Detailed docs → move to references/
- API reference → definitely references/

### Write for Claude, Not Humans
Claude needs different information than developers:
- ✅ Procedural: "To do X, follow these steps..."
- ✅ Specific: "Use nanoid() to generate IDs"
- ✅ Concrete: "Store timestamps as Date.now()"
- ❌ Conceptual: "Think about data integrity..."
- ❌ Opinion: "We prefer approach X over Y..."

### Document Your Intent
Add comments explaining WHY, not just WHAT:
```markdown
## ID Generation

Generate IDs with nanoid() to ensure uniqueness without database overhead.
<!-- Not just: "Use nanoid()" -->
```

### Validate Before Sharing
Always run validation:
```bash
python .claude/scripts/validate_skill.py .claude/skills/my-skill --strict
```

Strict mode treats warnings as errors - use before packaging for distribution.

---

## Troubleshooting

### Skill Not Triggering

**Problem**: Claude doesn't use the skill when expected

**Solutions**:
1. Check description includes "when to use" keywords
2. Make description more specific
3. Test with explicit request: "Use the database-patterns skill to..."
4. Verify SKILL.md frontmatter is valid YAML

### Token Limit Exceeded

**Problem**: Skill uses too many tokens

**Solutions**:
1. Move detailed content from SKILL.md to references/
2. Use scripts for code instead of inline examples
3. Split large references into focused files
4. Link to references instead of duplicating content

### Skill Conflicts

**Problem**: Multiple skills trying to handle same task

**Solutions**:
1. Make descriptions more specific
2. Define clear boundaries between skills
3. Use skill composition intentionally
4. Add "when NOT to use" guidance

### Invalid Package

**Problem**: Packaged skill doesn't work

**Solutions**:
1. Run validator before packaging
2. Check YAML frontmatter syntax
3. Ensure required fields present
4. Test skill locally before packaging

---

## File Templates

### Minimal SKILL.md
```markdown
---
name: my-skill
description: Brief description including when to use this skill
---

# My Skill

## Quick Start

[Minimal working example]

## Core Pattern

[Most common usage]
```

### Reference File
```markdown
# Topic Reference

## Overview

[Brief intro]

## Section 1

[Detailed content]

## Section 2

[More detail]

## Examples

[Concrete examples]
```

### Script File
```python
#!/usr/bin/env python3
"""
Description of what this script does.

Usage:
    python script_name.py [arguments]

Example:
    python validate.py --check-all
"""

import sys

def main():
    # Script logic here
    pass

if __name__ == "__main__":
    main()
```

---

## Next Steps

1. Read [SKILLS-ARCHITECTURE.md](SKILLS-ARCHITECTURE.md) for system overview
2. See [SKILL-EXAMPLES.md](SKILL-EXAMPLES.md) for real examples
3. Create your first skill with `python .claude/scripts/init_skill.py`
4. Join skill development workflow for devhub-crm
