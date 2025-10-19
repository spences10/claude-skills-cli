export const SKILL_MD_TEMPLATE = (
  name: string,
  description: string,
  title: string
) => `---
name: ${name}
description: ${description}
---

# ${title}

<!-- ============================================ -->
<!-- PROGRESSIVE DISCLOSURE GUIDELINES            -->
<!-- ============================================ -->
<!-- This file uses the 3-level loading system:   -->
<!--                                              -->
<!-- Level 1: Metadata (above) - Always loaded    -->
<!--   ~100 tokens: name + description            -->
<!--                                              -->
<!-- Level 2: This body - Loaded when triggered   -->
<!--   Recommended: <1000 words (<1300 tokens)    -->
<!--   Maximum: <5000 words (<6500 tokens)        -->
<!--   What to include: Quick start, core patterns-->
<!--   What to exclude: Full docs, many examples  -->
<!--                                              -->
<!-- Level 3: references/ - Loaded as needed      -->
<!--   Unlimited: Detailed guides, API docs,      -->
<!--   extensive examples, schemas                -->
<!-- ============================================ -->

## Quick Start
<!-- Keep this section under 300 words -->
<!-- Show the most common workflow only -->

[Provide a minimal working example showing the most common use case]

\`\`\`typescript
// Single example demonstrating core functionality
// Keep this concise - detailed examples go in references/examples.md
\`\`\`

## Core Patterns
<!-- Limit to 2-3 most frequently used patterns -->
<!-- Each pattern should be <200 words -->

### Pattern 1: [Most Common Pattern]

[Brief description with minimal example]

\`\`\`typescript
// Essential code only
\`\`\`

### Pattern 2: [Second Most Common Pattern]

[Brief description with minimal example]

\`\`\`typescript
// Essential code only
\`\`\`

## Common Mistakes to Avoid

❌ Don't [common mistake]
✅ Do [correct approach]

## Advanced Usage
<!-- Link to Level 3 resources instead of including detailed content here -->

For comprehensive documentation, see:
- [references/detailed-guide.md](references/detailed-guide.md) - Complete API reference
- [references/examples.md](references/examples.md) - Extensive code examples

## Scripts

Scripts provide deterministic operations without consuming context:
- \`scripts/example.py\`: [What this script does]

## Notes

- Keep this file under 1000 words for optimal token efficiency
- Move detailed content to references/ for Level 3 loading
- Link to reference files instead of duplicating content
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
