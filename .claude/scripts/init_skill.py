#!/usr/bin/env python3
"""
Initialize a new Claude skill with proper structure.

Usage:
    python init_skill.py --name my-skill-name --description "What this skill does"
    python init_skill.py --path /custom/path/my-skill
"""

import argparse
import sys
from pathlib import Path


SKILL_MD_TEMPLATE = """---
name: {name}
description: {description}
---

# {title}

## Overview

[Provide a brief overview of what this skill does and when to use it]

## Quick Start

```typescript
// Example code showing basic usage
```

## Core Patterns

### Pattern 1: [Name]

[Describe the pattern]

```typescript
// Code example
```

### Pattern 2: [Name]

[Describe the pattern]

```typescript
// Code example
```

## Advanced Usage

For detailed information, see:
- [references/detailed-guide.md](references/detailed-guide.md)
- [references/examples.md](references/examples.md)

## Scripts

- `scripts/example.py`: Description of what this script does

## Notes

- Important note 1
- Important note 2
"""

REFERENCE_TEMPLATE = """# {title} Reference

## Section 1

Content here...

## Section 2

Content here...
"""

SCRIPT_TEMPLATE = """#!/usr/bin/env python3
\"\"\"
Description of what this script does.

Usage:
    python {filename}
\"\"\"

def main():
    print("Script executed successfully")

if __name__ == "__main__":
    main()
"""

README_TEMPLATE = """# {title}

{description}

## Structure

- `SKILL.md` - Main skill instructions
- `references/` - Detailed documentation loaded as needed
- `scripts/` - Executable code for deterministic operations
- `assets/` - Templates, images, or other resources

## Usage

This skill is automatically discovered by Claude when relevant to the task.
"""


def create_skill(path: Path, name: str, description: str):
    """Create a new skill directory with all necessary files."""

    # Create directories
    path.mkdir(parents=True, exist_ok=True)
    (path / "references").mkdir(exist_ok=True)
    (path / "scripts").mkdir(exist_ok=True)
    (path / "assets").mkdir(exist_ok=True)

    # Create SKILL.md
    title = name.replace("-", " ").title()
    skill_md = SKILL_MD_TEMPLATE.format(
        name=name,
        description=description,
        title=title
    )
    (path / "SKILL.md").write_text(skill_md)

    # Create example reference
    reference_md = REFERENCE_TEMPLATE.format(title=title)
    (path / "references" / "detailed-guide.md").write_text(reference_md)

    # Create example script
    script_py = SCRIPT_TEMPLATE.format(filename="example.py")
    script_path = path / "scripts" / "example.py"
    script_path.write_text(script_py)
    script_path.chmod(0o755)

    # Create README
    readme_md = README_TEMPLATE.format(title=title, description=description)
    (path / "README.md").write_text(readme_md)

    print(f"✅ Skill created at: {path}")
    print(f"\nNext steps:")
    print(f"1. Edit {path}/SKILL.md with your skill instructions")
    print(f"2. Add detailed documentation to references/")
    print(f"3. Add executable scripts to scripts/")
    print(f"4. Remove example files you don't need")
    print(f"\nValidate with: python validate_skill.py {path}")


def main():
    parser = argparse.ArgumentParser(
        description="Initialize a new Claude skill",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--name",
        help="Skill name in kebab-case (e.g., 'database-patterns')"
    )
    parser.add_argument(
        "--description",
        help="Brief description of what the skill does and when to use it"
    )
    parser.add_argument(
        "--path",
        help="Full path where skill should be created (overrides --name)"
    )

    args = parser.parse_args()

    # Validate arguments
    if args.path:
        path = Path(args.path)
        name = path.name
        description = args.description or "TODO: Add description"
    elif args.name:
        name = args.name
        description = args.description or "TODO: Add description"
        # Default to .claude/skills/ directory
        path = Path(".claude/skills") / name
    else:
        parser.print_help()
        sys.exit(1)

    # Validate name format
    if not name.replace("-", "").replace("_", "").isalnum():
        print(f"❌ Error: Skill name must be kebab-case alphanumeric: {name}")
        sys.exit(1)

    if name != name.lower():
        print(f"❌ Error: Skill name must be lowercase: {name}")
        sys.exit(1)

    # Create the skill
    create_skill(path, name, description)


if __name__ == "__main__":
    main()
