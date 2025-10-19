export const SKILL_MD_TEMPLATE = (
  name: string,
  description: string,
  title: string
) => `---
name: ${name}
description: ${description}
---

# ${title}

## Quick Start

[Provide ONE minimal working example - the most common use case]

\`\`\`typescript
// Keep this concise - show essential code only
// Detailed examples go in references/examples.md
\`\`\`

## Core Principles

- Principle 1: [Key concept]
- Principle 2: [Key concept]
- Principle 3: [Key concept]

## Common Patterns

### [Most Frequent Pattern]

[Brief description - keep under 100 words]

## Reference Files

For detailed documentation, see:
- [references/detailed-guide.md](references/detailed-guide.md) - Complete guide
- [references/examples.md](references/examples.md) - Additional examples

## Scripts

- \`scripts/example.py\` - [What this script does]

## Notes

- Important note 1
- Important note 2

<!--
PROGRESSIVE DISCLOSURE GUIDELINES:
- Keep this file ~50 lines total (max ~150 lines)
- Use 1-2 code blocks only (recommend 1)
- Keep description <200 chars for Level 1 efficiency
- Move detailed docs to references/ for Level 3 loading
- This is Level 2 - quick reference ONLY, not a manual
-->
`;

export const REFERENCE_TEMPLATE = (title: string) => `# ${title} Reference

<!-- This is a Level 3 resource file -->
<!-- It's loaded on-demand when Claude needs detailed information -->
<!-- No size limits - include comprehensive documentation here -->

## Overview

[Detailed explanation of this topic]

## Complete Examples

### Example 1: [Scenario]

[Comprehensive example with full context]

\`\`\`typescript
// Detailed code with comments
// Include edge cases and variations
\`\`\`

### Example 2: [Scenario]

[Another detailed example]

\`\`\`typescript
// More extensive code
\`\`\`

## Advanced Topics

[Deep dive into complex aspects]

## API Reference

[Complete API documentation if applicable]

## Best Practices

- [Detailed best practice 1]
- [Detailed best practice 2]
- [Detailed best practice 3]

## Troubleshooting

### Issue 1

**Problem:** [Description]
**Solution:** [Detailed solution]

### Issue 2

**Problem:** [Description]
**Solution:** [Detailed solution]
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
