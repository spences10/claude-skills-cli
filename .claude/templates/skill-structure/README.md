# Skill Structure Template

This directory shows the complete structure of a well-organized Claude skill.

## Directory Layout

```
skill-name/
├── SKILL.md                    # Required: Main skill instructions
├── README.md                   # Optional: Human documentation
├── references/                 # Optional: Detailed documentation
│   ├── detailed-guide.md
│   ├── api-reference.md
│   └── examples.md
├── scripts/                    # Optional: Executable code
│   ├── validate.py
│   ├── generate.py
│   └── test.sh
└── assets/                     # Optional: Templates and resources
    ├── templates/
    ├── images/
    └── data/
```

## File Purposes

### SKILL.md (Required)
- Only required file
- Contains YAML frontmatter with name and description
- Provides core patterns and quick reference
- Links to references for detailed information
- Should be under 5k words

### README.md (Optional)
- Human-readable documentation
- Explains skill purpose to developers
- Installation and usage instructions
- Not read by Claude

### references/ (Optional)
- Detailed documentation loaded as needed
- API references, complete schemas, examples
- Each file should be focused on one topic
- Loaded only when Claude needs specific information

### scripts/ (Optional)
- Executable Python, Bash, or other scripts
- For deterministic operations (validation, generation)
- More efficient than having Claude generate code
- Should be self-contained with clear usage

### assets/ (Optional)
- Templates, images, fonts, boilerplate
- Used in output, not loaded into context
- Copied or modified by Claude as needed
- Keeps skill token-efficient

## Usage

To create a new skill based on this structure:

```bash
# Option 1: Use init_skill.py script
python .claude/scripts/init_skill.py --name my-skill --description "What it does"

# Option 2: Manual copy
cp -r .claude/templates/skill-structure .claude/skills/my-skill
# Then edit files as needed
```

## Progressive Disclosure

The structure supports Claude's three-level loading:

1. **Level 1** (always): Name + description from SKILL.md frontmatter (~100 tokens)
2. **Level 2** (when triggered): SKILL.md body (~3-5k tokens)
3. **Level 3** (as needed): references/, scripts/, assets/ (unlimited)

## Best Practices

- Start minimal (just SKILL.md)
- Add references when SKILL.md grows too large
- Add scripts for repeated code patterns
- Add assets for templates and resources
- Delete unused directories
- Validate before sharing

## See Also

- [SKILLS-ARCHITECTURE.md](../../docs/SKILLS-ARCHITECTURE.md) - Complete architecture guide
- [SKILL-DEVELOPMENT.md](../../docs/SKILL-DEVELOPMENT.md) - Development workflow
- [SKILL-EXAMPLES.md](../../docs/SKILL-EXAMPLES.md) - Real-world examples
