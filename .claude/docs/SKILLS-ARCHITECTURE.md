# Claude Skills Architecture

## Overview

Claude Skills are modular capabilities that extend Claude's functionality through a filesystem-based architecture. They provide specialized domain expertise, workflows, and tools that transform Claude from a general-purpose agent into a specialist.

## Core Concepts

### What is a Skill?

A Skill is a directory containing:
- **SKILL.md** (required): Instructions and metadata
- **references/** (optional): Detailed documentation
- **scripts/** (optional): Executable code
- **assets/** (optional): Templates and resources

### Why Use Skills?

**Problems Skills Solve:**
- Repeating the same context across conversations
- Claude forgetting project-specific patterns
- Inconsistent handling of specialized workflows
- Token-heavy prompts for domain expertise

**Benefits:**
- **Reusable**: Write once, use automatically
- **Composable**: Multiple skills work together
- **Efficient**: Progressive disclosure minimizes tokens
- **Portable**: Same format across Claude.ai, Claude Code, and API

## Progressive Disclosure (The Secret Sauce)

Skills use a three-level loading system to manage context efficiently:

### Level 1: Metadata (~100 tokens)
**Always loaded in system prompt**

```yaml
---
name: database-patterns
description: Guide for SQLite database operations in devhub-crm...
---
```

Claude sees this at startup and knows:
- What the skill does
- When to use it
- How to trigger it

**Token cost**: ~100 tokens per skill (metadata only)
**When**: At agent startup, every conversation

### Level 2: Instructions (<5k tokens)
**Loaded when skill is triggered**

The markdown body of SKILL.md contains:
- Core patterns and workflows
- Quick reference examples
- Links to references and scripts

```markdown
# Database Patterns

## Core Principles
- Use prepared statements for all queries
- Generate IDs with nanoid()
...

For complete schema, see [references/schema.md](references/schema.md)
```

**Token cost**: ~3-5k tokens typically
**When**: Only when Claude determines skill is relevant

### Level 3: Resources (unlimited)
**Loaded as needed**

- **references/**: Documentation Claude reads into context as needed
- **scripts/**: Executable code Claude runs without loading into context
- **assets/**: Files used in output (templates, images, fonts)

```bash
# Claude can execute scripts without reading them
python scripts/validate_schema.py

# Or read references when needed
cat references/detailed-schema.md
```

**Token cost**:
- Scripts: Only output consumes tokens (not code itself)
- References: Only if explicitly read
- Assets: Zero tokens (used directly in output)

**When**: Only when referenced or needed

## How Claude Accesses Skills

### Discovery Phase
1. User makes a request
2. Claude scans all skill metadata (Level 1)
3. Determines which skills are relevant
4. Triggers appropriate skills

### Loading Phase
1. Claude reads `SKILL.md` via bash command
2. Instructions enter context window (Level 2)
3. Claude sees references to additional files
4. Decides what to load next

### Execution Phase
1. Claude follows instructions from SKILL.md
2. Reads reference files if needed (Level 3)
3. Executes scripts via bash (Level 3)
4. Uses assets in final output (Level 3)

## Skill Structure

### Minimal Skill
```
my-skill/
└── SKILL.md
```

### Complete Skill
```
my-skill/
├── SKILL.md                    # Main instructions
├── README.md                   # Human documentation
├── references/                 # Detailed docs
│   ├── api-reference.md
│   ├── examples.md
│   └── troubleshooting.md
├── scripts/                    # Executable code
│   ├── validate.py
│   ├── generate.py
│   └── test.sh
└── assets/                     # Templates & resources
    ├── template.sql
    ├── schema-diagram.png
    └── boilerplate/
```

## SKILL.md Format

### Required Structure

```markdown
---
name: skill-name
description: What this skill does and when to use it...
---

# Skill Title

[Instructions in markdown...]
```

### Frontmatter Fields

**Required:**
- `name`: Lowercase kebab-case, matches directory name (max 64 chars)
- `description`: What and when to use (max 1024 chars)

**Optional:**
- `license`: License name or file reference
- `allowed-tools`: Pre-approved tools (Claude Code only)
- `metadata`: Custom key-value pairs

### Body Content

**Best Practices:**
- Use imperative voice ("Use X" not "You should use X")
- Provide concrete examples
- Link to references for details
- Keep under 5k words
- Include "when to use" guidance

**Anti-Patterns:**
- ❌ Using second person ("you")
- ❌ Duplicating reference content
- ❌ Including entire API docs inline
- ❌ Generic advice without specifics

## References Directory

### Purpose
Detailed documentation loaded only when needed by Claude.

### When to Use References
- Database schemas
- API documentation
- Detailed workflows
- Large example collections
- Troubleshooting guides

### Naming Convention
- Use descriptive names: `authentication-flow.md` not `auth.md`
- Group related content: `api-users.md`, `api-repos.md`
- Include search keywords if files are large (>10k words)

### Example
```markdown
# In SKILL.md
For complete database schema with all relationships, see [references/schema.md](references/schema.md).

# Claude can then:
cat references/schema.md  # Load when needed
```

## Scripts Directory

### Purpose
Executable code for deterministic operations that don't need token generation.

### When to Use Scripts
- Validation (check data consistency)
- Generation (create boilerplate)
- Analysis (parse files)
- Testing (verify setup)

### Why Scripts Are Efficient
```python
# Option 1: Claude generates code every time (expensive)
"Claude, write Python to validate these timestamps..."
# Result: ~500 tokens each time

# Option 2: Claude runs existing script (cheap)
python scripts/validate_timestamps.py
# Result: ~50 tokens (just the output)
```

### Best Practices
- Include shebang (`#!/usr/bin/env python3`)
- Make executable (`chmod +x`)
- Add docstrings with usage
- Handle errors gracefully
- Return meaningful output

## Assets Directory

### Purpose
Files used in output, not loaded into context.

### Common Assets
- Templates (HTML, React, SQL)
- Images (logos, icons, diagrams)
- Fonts (typography files)
- Boilerplate (starter projects)

### Usage Pattern
```python
# Claude copies/modifies assets without reading into context
cp assets/template.html output/index.html
# Modify the template as needed
```

## Token Economics

### Example: Database Skill

**Without Skill:**
```
User prompt: ~500 tokens (repeated every conversation)
Schema context: ~2000 tokens
Example queries: ~1000 tokens
Total: ~3500 tokens per conversation
```

**With Skill:**
```
Metadata (always): ~100 tokens
SKILL.md (when triggered): ~3000 tokens
Schema reference (if needed): ~2000 tokens
Total: 100 tokens normally, 3100-5100 when used
```

**Savings**: Skill metadata is loaded once. Without skill, you pay ~3500 tokens every conversation even if not needed.

## Skill Composition

Multiple skills can work together automatically:

```
User: "Create a dashboard showing GitHub contacts with database stats"

Claude activates:
1. database-patterns (query contacts)
2. github-integration (fetch GitHub data)
3. daisyui-conventions (style dashboard)
4. sveltekit-patterns (build component)

Each skill loads independently, shares context naturally.
```

## Where Skills Work

### Claude Code (Local)
- Location: `~/.claude/skills/` or `.claude/skills/`
- Format: Directory with SKILL.md
- Installation: Copy folder or use plugin marketplace
- Scope: Personal or project-specific

### Claude.ai (Web)
- Location: Upload via Settings > Features > Skills
- Format: Zip file containing skill directory
- Installation: Manual upload
- Scope: Individual user only

### Claude API (Programmatic)
- Location: Upload via `/v1/skills` endpoint
- Format: Zip file or directory
- Installation: API call with skill package
- Scope: Organization-wide

## Best Practices Summary

### Do:
✅ Keep SKILL.md concise and actionable
✅ Use imperative voice for instructions
✅ Provide concrete examples
✅ Link to references for details
✅ Include "when to use" in description
✅ Use scripts for deterministic operations
✅ Group related content in references
✅ Test skills on real tasks

### Don't:
❌ Duplicate content between SKILL.md and references
❌ Use second person ("you")
❌ Include entire documentation inline
❌ Forget to specify when to use skill
❌ Make descriptions too generic
❌ Leave TODO placeholders
❌ Skip validation before packaging

## Next Steps

- Read [SKILL-DEVELOPMENT.md](SKILL-DEVELOPMENT.md) for creation workflow
- See [SKILL-EXAMPLES.md](SKILL-EXAMPLES.md) for real-world examples
- Use `python init_skill.py` to create your first skill
