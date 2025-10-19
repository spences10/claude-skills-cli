export const SKILL_MD_TEMPLATE = (
  name: string,
  description: string,
  title: string
) => `---
name: ${name}
description: ${description}
---

# ${title}

## Overview

[Provide a brief overview of what this skill does and when to use it]

## Quick Start

\`\`\`typescript
// Example code showing basic usage
\`\`\`

## Core Patterns

### Pattern 1: [Name]

[Describe the pattern]

\`\`\`typescript
// Code example
\`\`\`

### Pattern 2: [Name]

[Describe the pattern]

\`\`\`typescript
// Code example
\`\`\`

## Advanced Usage

For detailed information, see:
- [references/detailed-guide.md](references/detailed-guide.md)
- [references/examples.md](references/examples.md)

## Scripts

- \`scripts/example.py\`: Description of what this script does

## Notes

- Important note 1
- Important note 2
`;

export const REFERENCE_TEMPLATE = (title: string) => `# ${title} Reference

## Section 1

Content here...

## Section 2

Content here...
`;

export const SCRIPT_TEMPLATE = (filename: string) => `#!/usr/bin/env python3
"""
Description of what this script does.

Usage:
    python ${filename}
"""

def main():
    print("Script executed successfully")

if __name__ == "__main__":
    main()
`;

export const README_TEMPLATE = (
  title: string,
  description: string
) => `# ${title}

${description}

## Structure

- \`SKILL.md\` - Main skill instructions
- \`references/\` - Detailed documentation loaded as needed
- \`scripts/\` - Executable code for deterministic operations
- \`assets/\` - Templates, images, or other resources

## Usage

This skill is automatically discovered by Claude when relevant to the task.
`;
