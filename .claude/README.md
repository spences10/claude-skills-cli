# Claude Skills Infrastructure

Professional skills development system for Claude Code and Claude API.

## What's Included

### ✅ Portable (Use in Any Project)

These files are project-agnostic and ready to use anywhere:

#### Scripts (`scripts/`)
- `init_skill.py` - Create new skills with proper structure
- `validate_skill.py` - Validate skill format and content
- `package_skill.py` - Package skills for distribution

#### Documentation (`docs/`)
- `SKILLS-ARCHITECTURE.md` - Complete system overview
- `SKILL-DEVELOPMENT.md` - 6-step creation workflow
- `SKILL-EXAMPLES.md` - Real-world examples and patterns

#### Templates (`templates/`)
- `SKILL-TEMPLATE.md` - Boilerplate for new skills
- `skill-structure/` - Complete directory structure example

#### Meta Skill (`skills/skill-creator/`)
- Complete guide for building skills
- Embedded in the skills system itself
- References best practices and examples

### 🎯 Project-Specific (devhub-crm)

These skills are tailored to this project:

#### Skills (`skills/`)
- `database-patterns/` - SQLite with better-sqlite3, devhub schema
- *(Additional skills to be created: sveltekit-patterns, github-integration, daisyui-conventions)*

## Quick Start

### Create a New Skill

```bash
# Initialize skill structure
python .claude/scripts/init_skill.py \
  --name my-skill \
  --description "What it does and when to use it"

# Edit the skill
vim .claude/skills/my-skill/SKILL.md

# Validate
python .claude/scripts/validate_skill.py .claude/skills/my-skill

# Package for distribution
python .claude/scripts/package_skill.py .claude/skills/my-skill
```

### Use in Another Project

Copy the portable infrastructure to your new project:

```bash
# Copy portable files only
cp -r .claude/scripts /path/to/new-project/.claude/
cp -r .claude/docs /path/to/new-project/.claude/
cp -r .claude/templates /path/to/new-project/.claude/
cp -r .claude/skills/skill-creator /path/to/new-project/.claude/skills/

# Then create project-specific skills in new project
cd /path/to/new-project
python .claude/scripts/init_skill.py --name my-project-skill --description "..."
```

## TypeScript Version

The scripts are currently in Python for rapid prototyping. To convert to TypeScript:

1. Maintain the same CLI interfaces (args, output format)
2. Use Node.js for file operations and zip creation
3. Keep the same directory structure and YAML parsing
4. Preserve validation rules and error messages

This allows the skills system to integrate naturally with Node.js/TypeScript projects.

## Architecture

Skills use **progressive disclosure** - a three-level loading system:

### Level 1: Metadata (~100 tokens)
**Always loaded**
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
- `references/` - Detailed documentation
- `scripts/` - Executable code
- `assets/` - Templates and resources

## File Structure

```
.claude/
├── scripts/              # ✅ Portable - Skill development tools
│   ├── init_skill.py
│   ├── validate_skill.py
│   └── package_skill.py
├── docs/                 # ✅ Portable - Documentation
│   ├── SKILLS-ARCHITECTURE.md
│   ├── SKILL-DEVELOPMENT.md
│   └── SKILL-EXAMPLES.md
├── templates/            # ✅ Portable - Boilerplate
│   ├── SKILL-TEMPLATE.md
│   └── skill-structure/
├── skills/               # Mixed - Portable + Project-specific
│   ├── skill-creator/    # ✅ Portable - Meta skill
│   └── database-patterns/ # 🎯 Project-specific
└── README.md             # This file
```

## Development Workflow

1. **Understand** - Gather 3-5 concrete examples of skill usage
2. **Plan** - Identify what goes in SKILL.md vs references vs scripts
3. **Initialize** - Run `init_skill.py` to create structure
4. **Edit** - Write SKILL.md with imperative voice, add references
5. **Validate** - Run `validate_skill.py` to check format
6. **Test** - Use skill in real conversations, iterate
7. **Package** - Run `package_skill.py` for distribution

## Best Practices

### Do:
✅ Use imperative voice ("Use X" not "You should use X")
✅ Include "when to use" keywords in description
✅ Keep SKILL.md under 5k words
✅ Move detailed content to references/
✅ Use scripts for repeated code
✅ Test on real tasks

### Don't:
❌ Use second person ("you")
❌ Create generic descriptions
❌ Duplicate content across files
❌ Leave TODO placeholders
❌ Skip validation before packaging

## Resources

- [SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) - System design and token economics
- [SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - Complete creation workflow
- [SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real examples with analysis
- [Anthropic Skills Repo](https://github.com/anthropics/skills) - Official examples
- [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks/tree/main/skills) - Practical guides

## Contributing

When creating new project-specific skills for devhub-crm:

1. Follow the 6-step process in `skill-creator/SKILL.md`
2. Use real examples from the codebase (not invented)
3. Validate before committing
4. Test in actual conversations
5. Document iteration insights

## License

Portable infrastructure (scripts, docs, templates, skill-creator) can be freely used in other projects. Project-specific skills (database-patterns, etc.) contain devhub-crm conventions and should be adapted for other projects.

---

**Questions?** See [SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) or reference the `skill-creator` skill.
