export const SKILL_MD_TEMPLATE = (
	name: string,
	description: string,
	title: string,
	include_examples: boolean = false,
) => {
	const minimal_template = `---
name: ${name}
# IMPORTANT: Keep description on ONE line for Claude Code compatibility
# prettier-ignore
description: ${description}
---

# ${title}

## Quick Start

[Provide ONE minimal working example - the most common use case]

\`\`\`typescript
// Keep this concise - show essential code only
// Move detailed examples to references/ for Level 3 loading
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
- [references/](references/) - Add detailed guides here

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

LLM WORKFLOW (when editing this file):
1. Write/edit SKILL.md
2. Format (if formatter available)
3. Run: claude-skills-cli validate <path>
4. If multi-line description warning: run claude-skills-cli doctor <path>
5. Validate again to confirm
-->
`;

	const full_template = `---
name: ${name}
# IMPORTANT: Keep description on ONE line for Claude Code compatibility
# prettier-ignore
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

- \`scripts/example.js\` - [What this script does]

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

LLM WORKFLOW (when editing this file):
1. Write/edit SKILL.md
2. Format (if formatter available)
3. Run: claude-skills-cli validate <path>
4. If multi-line description warning: run claude-skills-cli doctor <path>
5. Validate again to confirm
-->
`;

	return include_examples ? full_template : minimal_template;
};

export const REFERENCE_TEMPLATE = (
	title: string,
) => `# ${title} Reference

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

export const SCRIPT_TEMPLATE = (
	filename: string,
) => `#!/usr/bin/env node

/**
 * Description of what this script does.
 *
 * Usage:
 *   node ${filename}
 */

function main() {
  console.log('Script executed successfully');
}

main();
`;

// Hook templates for skill activation
export const SIMPLE_HOOK_TEMPLATE = () => `#!/bin/bash
echo 'INSTRUCTION: If the prompt matches any available skill keywords, use Skill(skill-name) to activate it.'
`;

export const FORCED_EVAL_HOOK_TEMPLATE = () => `#!/bin/bash
# UserPromptSubmit hook that forces explicit skill evaluation
#
# This hook requires Claude to explicitly evaluate each available skill
# before proceeding with implementation.
#
# Installation: Copy to .claude/hooks/UserPromptSubmit

cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Step 1 - EVALUATE (do this in your response):
For each skill in <available_skills>, state: [skill-name] - YES/NO - [reason]

Step 2 - ACTIVATE (do this immediately after Step 1):
IF any skills are YES → Use Skill(skill-name) tool for EACH relevant skill NOW
IF no skills are YES → State "No skills needed" and proceed

Step 3 - IMPLEMENT:
Only after Step 2 is complete, proceed with implementation.

CRITICAL: You MUST call Skill() tool in Step 2. Do NOT skip to implementation.
The evaluation (Step 1) is WORTHLESS unless you ACTIVATE (Step 2) the skills.

Example of correct sequence:
- research: NO - not a research task
- svelte5-runes: YES - need reactive state
- sveltekit-structure: YES - creating routes

[Then IMMEDIATELY use Skill() tool:]
> Skill(svelte5-runes)
> Skill(sveltekit-structure)

[THEN and ONLY THEN start implementation]
EOF
`;

export const LLM_EVAL_HOOK_TEMPLATE = () => `#!/bin/bash
# UserPromptSubmit hook that uses Claude API for intelligent skill evaluation
#
# This hook analyses each user prompt and uses the Claude API to determine which
# skills (if any) are relevant. It then instructs Claude to activate those skills
# before proceeding with implementation.
#
# COST ANALYSIS (per prompt):
# Current model: Claude Haiku 3.5 ($0.80/$4 per MTok input/output)
# - Estimated: ~400 input tokens + ~20 output tokens
# - Cost: ~$0.0004 per evaluation (0.04 cents)
# - Volume: $0.40 per 1,000 prompts
#
# MODEL CONFIGURATION:
# Uncomment the model you want to use below
#
# Alternative: Claude Haiku 4.5 ($1/$5 per MTok) - 25% more expensive
# - Better accuracy and alignment
# - Cost: ~$0.0005 per evaluation (0.05 cents)
# - Trade-off: Extra 0.01¢ per call for improved skill matching
#
# REQUIREMENTS:
# 1. Set ANTHROPIC_API_KEY environment variable
#    export ANTHROPIC_API_KEY=your-key-here
# 2. Ensure jq is installed for JSON parsing

# ============================================================================
# MODEL CONFIGURATION - Uncomment the model you want to use
# ============================================================================

# Haiku 3.5 - Faster, cheaper, good for simple classification
MODEL="claude-3-5-haiku-20241022"

# Haiku 4.5 - Better accuracy, 25% more expensive (verify model ID from Anthropic docs)
# MODEL="claude-haiku-4-5-20251015"

# ============================================================================

# Read JSON input from stdin with timeout
INPUT_JSON=$(timeout 2 cat || echo '{}')

# Extract user prompt and cwd from JSON
USER_PROMPT=$(echo "$INPUT_JSON" | jq -r '.prompt // ""' 2>/dev/null)
CWD=$(echo "$INPUT_JSON" | jq -r '.cwd // ""' 2>/dev/null)

# Use CLAUDE_PROJECT_DIR if CWD is empty
if [ -z "$CWD" ] || [ "$CWD" = "null" ]; then
	CWD="\${CLAUDE_PROJECT_DIR:-.}"
fi

# Get available skills with descriptions from both global and project skills
AVAILABLE_SKILLS=""

# Function to scan a skills directory
scan_skills_dir() {
	local dir="$1"

	if [ -d "$dir" ]; then
		for skill_dir in "$dir"/*/; do
			if [ -d "$skill_dir" ]; then
				skill_file="$skill_dir/SKILL.md"
				if [ -f "$skill_file" ]; then
					skill_name=$(basename "$skill_dir")
					# Extract description from YAML frontmatter (between --- markers)
					skill_desc=$(sed -n '/^---$/,/^---$/p' "$skill_file" | grep '^description:' | sed 's/^description: *//' | head -n 1)

					if [ -n "$skill_desc" ]; then
						AVAILABLE_SKILLS="\${AVAILABLE_SKILLS}- \${skill_name}: \${skill_desc}\\n"
					else
						AVAILABLE_SKILLS="\${AVAILABLE_SKILLS}- \${skill_name}\\n"
					fi
				fi
			fi
		done
	fi
}

# Scan global skills
scan_skills_dir "$HOME/.claude/skills"

# Scan project skills
scan_skills_dir "$CWD/.claude/skills"

if [ -z "$AVAILABLE_SKILLS" ]; then
	AVAILABLE_SKILLS="No skills found"
fi


# Fallback instruction message
FALLBACK_INSTRUCTION="INSTRUCTION: If the prompt matches any available skill keywords, use Skill(skill-name) to activate it."

# If no API key in environment, fall back
if [ -z "$ANTHROPIC_API_KEY" ]; then
	echo "$FALLBACK_INSTRUCTION"
	exit 0
fi

# Prepare the optimized evaluation prompt
EVAL_PROMPT=$(cat <<EOF
Return ONLY a JSON array of skill names that match this request.

Request: \${USER_PROMPT}

Skills:
\${AVAILABLE_SKILLS}
Format: ["skill-name"] or []
EOF
)

# Call Claude API with optimized parameters
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \\
	-H "content-type: application/json" \\
	-H "x-api-key: $ANTHROPIC_API_KEY" \\
	-H "anthropic-version: 2023-06-01" \\
	-d "{
		\\"model\\": \\"$MODEL\\",
		\\"max_tokens\\": 200,
		\\"temperature\\": 0,
		\\"system\\": \\"You are a skill matcher. Return only valid JSON arrays.\\",
		\\"messages\\": [{
			\\"role\\": \\"user\\",
			\\"content\\": $(echo "$EVAL_PROMPT" | jq -Rs .)
		}]
	}")

# Extract the skill list from response
RAW_TEXT=$(echo "$RESPONSE" | jq -r '.content[0].text' 2>/dev/null)

# Check if we got a valid response
if [ $? -ne 0 ] || [ -z "$RAW_TEXT" ]; then
	echo "$FALLBACK_INSTRUCTION"
	exit 0
fi

# Strip markdown code fences if present and extract JSON
SKILLS=$(echo "$RAW_TEXT" | sed -n '/^\\[/,/^\\]/p' | head -n 1)

# If that didn't work, try the whole text
if [ -z "$SKILLS" ]; then
	SKILLS="$RAW_TEXT"
fi

# Parse the skills array
SKILL_COUNT=$(echo "$SKILLS" | jq 'length' 2>/dev/null)

if [ "$SKILL_COUNT" = "0" ]; then
	echo "INSTRUCTION: LLM evaluation determined no skills are needed for this task."
elif [ -n "$SKILL_COUNT" ] && [ "$SKILL_COUNT" != "null" ]; then
	SKILL_NAMES=$(echo "$SKILLS" | jq -r '.[]' | paste -sd ',' -)
	echo "INSTRUCTION: LLM evaluation determined these skills are relevant: $SKILL_NAMES"
	echo ""
	echo "You MUST activate these skills using the Skill() tool BEFORE implementation:"
	echo "$SKILLS" | jq -r '.[] | "- Skill(\\(.))"'
else
	# Fallback if parsing failed
	echo "$FALLBACK_INSTRUCTION"
fi
`;
