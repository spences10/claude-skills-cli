# skill-creator Skill: Recommended Updates

Based on ecosystem analysis of 30+ community skills, here are
recommended improvements to the bundled skill-creator skill.

## Executive Summary

**Current state**: The skill-creator is solid with good structure, but
missing emerging best practices.

**Key gaps**:

1. No mention of behavioral testing/validation
2. Hook integration patterns not covered
3. Quality metrics and scoring missing
4. Community patterns not represented
5. Testing strategies underdocumented

## Recommended Changes

### Priority 0: Critical Additions

#### 1. Add Behavioral Testing Section to SKILL.md

**Insert after "Development Process" section (line 85)**:

````markdown
## Testing and Validation

Skills are process documentation. Validate effectiveness through:

**Static validation** - Structure and content:

```bash
npx claude-skills-cli validate .claude/skills/my-skill
```
````

**Behavioral testing** - Does it guide Claude effectively?

- Test with subagents in controlled scenarios
- Observe skill triggering and adherence
- Iterate based on real usage patterns

**Hook-based validation** - Automated checks:

- PostToolUse hooks validate skills after edits
- PreToolUse hooks prevent issues before execution
- See [testing-methodology.md](references/testing-methodology.md)

Key principle: If a subagent can't follow your skill under pressure,
it's ineffective.

````

**Rationale**: Behavioral testing is the biggest innovation from community (obra/superpowers), but not mentioned in current skill-creator.

#### 2. Create New Reference: `references/testing-methodology.md`

```markdown
# Skill Testing Methodology

## Overview

Effective skills require validation beyond syntax checking. This guide covers testing approaches for skill effectiveness.

## Testing Levels

### Level 1: Static Validation

Validates structure, syntax, and progressive disclosure compliance.

**Tools**:
- `claude-skills-cli validate` - Built-in validation
- Pre-commit hooks for automated checks
- CI/CD integration for team consistency

**Checks**:
- YAML frontmatter syntax
- Description quality (length, keywords, triggers)
- Progressive disclosure compliance (line counts, word counts)
- Link integrity (no broken references)
- Script executability

**Example**:
```bash
# Validate before commit
npx claude-skills-cli validate .claude/skills/my-skill --strict

# CI integration
pnpm test:skills # runs validation on all skills
````

### Level 2: Behavioral Testing

Validates that skills effectively guide Claude's behavior.

**Approach**: Test-Driven Development for skills

1. Write test scenarios (pressure cases)
2. Launch subagent without skill (baseline)
3. Observe failure modes
4. Write/refine skill
5. Re-test with subagent
6. Pass = skill effectively guides behavior

**Test Scenario Structure**:

```json
{
	"scenario": "Implement login feature",
	"context": {
		"framework": "React",
		"auth_library": "none yet"
	},
	"expected_behavior": [
		"Creates LoginForm component",
		"Adds authentication logic",
		"Includes form validation",
		"Writes tests for component"
	],
	"pressure_factors": [
		"Unclear auth requirements",
		"Time constraint",
		"Multiple valid approaches"
	],
	"success_criteria": "Completes task following skill patterns"
}
```

**Implementation**:

```bash
# Future CLI command (v0.2.0+)
claude-skills-cli test .claude/skills/my-skill --scenarios test-cases.json
```

**Manual testing**:

- Use Task tool to launch subagents
- Provide scenario as prompt
- Observe if skill triggers and guides behavior
- Document failures and refine skill

### Level 3: Usage-Based Validation

Validates skills through real-world usage and metrics.

**Metrics to track**:

- Trigger frequency (is skill being invoked?)
- Token usage (is it efficient?)
- User corrections (are instructions unclear?)
- Success rate (does it complete tasks correctly?)

**Hook-based tracking**:

```json
{
	"PostToolUse": {
		"*": "python .claude/hooks/track-usage.py"
	}
}
```

**track-usage.py example**:

```python
#!/usr/bin/env python3
import json
import time
from pathlib import Path

log_file = Path.home() / '.claude' / 'skill-usage.jsonl'

entry = {
    'timestamp': time.time(),
    'tool': os.environ.get('CLAUDE_TOOL'),
    'file_paths': os.environ.get('CLAUDE_FILE_PATHS', '').split(',')
}

with open(log_file, 'a') as f:
    f.write(json.dumps(entry) + '\n')
```

## Testing Anti-patterns

### ❌ Testing Only Syntax

**Problem**: Passes validation but doesn't guide Claude effectively

**Example**: Description is well-formed but lacks trigger keywords

### ❌ No Pressure Testing

**Problem**: Works in ideal scenarios, fails under constraints

**Example**: Skill works with clear requirements, but crumbles with
ambiguity

### ❌ One-Time Testing

**Problem**: Skills drift from reality as codebase evolves

**Example**: Skill written once, never updated as patterns change

## Testing Best Practices

### ✅ Test Early and Often

- Validate after each significant edit
- Test with real use cases immediately
- Iterate based on observed behavior

### ✅ Use Pressure Scenarios

- Time constraints
- Unclear requirements
- Multiple valid approaches
- Edge cases and error conditions

### ✅ Document Test Cases

- Keep test scenarios in version control
- Update scenarios as patterns evolve
- Share scenarios with team

### ✅ Automate Where Possible

- Static validation in pre-commit hooks
- Behavioral tests in CI (when tooling available)
- Usage tracking via PostToolUse hooks

## Testing Workflow

```
1. Write/update skill
   ↓
2. Static validation (claude-skills-cli validate)
   ↓
3. Behavioral testing (subagent scenarios)
   ↓
4. Real-world usage (actual tasks)
   ↓
5. Collect metrics (usage tracking)
   ↓
6. Iterate based on feedback
   ↓
7. Repeat
```

## Resources

- [obra/superpowers testing-skills-with-subagents](https://github.com/obra/superpowers/tree/main/skills/testing-skills-with-subagents) -
  Pioneering behavioral testing approach
- [anthropics/skills validation scripts](https://github.com/anthropics/skills/tree/main/skill-creator/scripts) -
  Static validation tools
- claude-skills-cli `test` command documentation (v0.2.0+)

````

#### 3. Create New Reference: `references/hook-integration.md`

```markdown
# Hook Integration Patterns

## Overview

Hooks enable automation in skill development and usage. This guide covers common patterns.

## Hook Types

### PreToolUse Hooks
Execute **before** Claude uses a tool.

**Use cases**:
- Safety checks (prevent destructive operations)
- Input validation
- Permission verification
- Context preparation

**Example - Prevent destructive git operations**:
```json
{
  "PreToolUse": {
    "Bash": "bash .claude/hooks/safety-check.sh"
  }
}
````

```bash
#!/bin/bash
# safety-check.sh
set -euo pipefail

COMMAND="$CLAUDE_COMMAND"

# Block force push to main
if [[ "$COMMAND" =~ "git push".*"--force".*"main" ]]; then
  echo "❌ Force push to main is not allowed"
  exit 1
fi

exit 0  # Allow other operations
```

### PostToolUse Hooks

Execute **after** Claude uses a tool.

**Use cases**:

- Validation after edits
- Automatic testing
- Documentation updates
- Usage tracking

**Example - Validate skills after editing**:

```json
{
	"PostToolUse": {
		"Edit": "bash .claude/hooks/post-edit-skill-validation.sh"
	}
}
```

```bash
#!/bin/bash
# post-edit-skill-validation.sh
set -euo pipefail

FILE_PATH="$CLAUDE_FILE_PATH"

# Only validate if editing SKILL.md
if [[ "$FILE_PATH" =~ SKILL\.md$ ]]; then
  SKILL_DIR=$(dirname "$FILE_PATH")

  echo "Validating skill at $SKILL_DIR..."

  if npx claude-skills-cli validate "$SKILL_DIR" --quiet; then
    echo "✅ Skill validation passed"
    exit 0
  else
    echo "❌ Skill validation failed - please fix errors"
    exit 1
  fi
fi

exit 0
```

## Common Hook Patterns

### Pattern: Pre-commit Validation

```json
{
	"PreToolUse": {
		"Bash": "bash .claude/hooks/pre-commit-checks.sh"
	}
}
```

```bash
#!/bin/bash
set -euo pipefail

COMMAND="$CLAUDE_COMMAND"

# Only run on git commit
if [[ "$COMMAND" =~ ^git\ commit ]]; then
  # Run linter
  if ! npm run lint:check; then
    echo "❌ Linting failed - fix errors before committing"
    exit 1
  fi

  # Run tests
  if ! npm test; then
    echo "❌ Tests failed - fix failures before committing"
    exit 1
  fi

  echo "✅ Pre-commit checks passed"
fi

exit 0
```

### Pattern: Resource Usage Tracking

```json
{
	"PostToolUse": {
		"*": "python .claude/hooks/track-usage.py"
	}
}
```

```python
#!/usr/bin/env python3
import json
import os
import time
from pathlib import Path

log_file = Path.home() / '.claude' / 'usage.jsonl'

entry = {
    'timestamp': time.time(),
    'tool': os.environ.get('CLAUDE_TOOL', 'unknown'),
    'file_paths': os.environ.get('CLAUDE_FILE_PATHS', '').split(',')
}

with open(log_file, 'a') as f:
    f.write(json.dumps(entry) + '\\n')
```

### Pattern: Auto-documentation

```json
{
	"PostToolUse": {
		"Write": "bash .claude/hooks/update-docs.sh"
	}
}
```

```bash
#!/bin/bash
set -euo pipefail

FILE_PATH="$CLAUDE_FILE_PATH"

# Update docs if source files changed
if [[ "$FILE_PATH" =~ ^src/ ]]; then
  npm run docs:generate
  echo "✅ Documentation updated"
fi

exit 0
```

## Hook Best Practices

### ✅ Keep Hooks Fast

- Target <1 second execution
- Avoid network calls in hooks
- Use caching when possible

### ✅ Provide Clear Feedback

```bash
# Good: Clear, actionable feedback
echo "❌ Linting failed: Found 3 errors in src/index.ts"
echo "   Run 'npm run lint:fix' to auto-fix"

# Bad: Unclear what went wrong
echo "Error"
```

### ✅ Use Appropriate Exit Codes

```bash
# Exit 0: Success or non-blocking warning
# Exit 1: Error that should block operation

if [[ $warnings -gt 0 ]]; then
  echo "⚠️  Found $warnings warnings (non-blocking)"
  exit 0  # Don't block
fi

if [[ $errors -gt 0 ]]; then
  echo "❌ Found $errors errors (blocking)"
  exit 1  # Block
fi
```

### ✅ Document Hook Requirements

In SKILL.md or README.md:

````markdown
## Hook Setup (Optional)

This skill works best with PostToolUse hooks for validation:

1. Add to .claude/settings.json:
   ```json
   {
   	"PostToolUse": {
   		"Edit": "bash .claude/skills/my-skill/hooks/post-edit.sh"
   	}
   }
   ```
````

2. Hook validates changes automatically after edits

````

## Hook Anti-patterns

### ❌ Blocking on Warnings
```bash
# Don't do this - blocks workflow unnecessarily
if [[ $warnings -gt 0 ]]; then
  exit 1  # Too strict
fi
````

### ❌ Silent Failures

```bash
# Don't do this - fails silently
python script.py  # If this fails, no one knows
exit 0
```

### ❌ Slow Operations

```bash
# Don't do this - blocks for 30+ seconds
npm install  # Too slow for a hook
docker build .  # Way too slow
```

### ❌ Requiring User Input

```bash
# Don't do this - hooks should be non-interactive
read -p "Proceed? (y/n) " answer
```

## Hook Management with CLI

Future CLI commands (v0.3.0+):

```bash
# List available hook templates
claude-skills-cli hook list-templates

# Add hook from template
claude-skills-cli hook add --template pre-commit-validation

# Add custom hook
claude-skills-cli hook add --tool Edit --script ./my-hook.sh

# List installed hooks
claude-skills-cli hook list

# Remove hook
claude-skills-cli hook remove --tool Edit

# Test hook
claude-skills-cli hook test pre-commit-validation
```

## Resources

- [Claude Code Settings documentation](https://docs.claude.com/en/docs/claude-code/settings)
- Community hook examples (GitHub search: `.claude/settings.json`)
- claude-skills-cli hook command (v0.3.0+)

````

#### 4. Update SKILL.md: Add Hook Integration Mention

**Insert after "Implementation" section (line 113)**:

```markdown
## Hook Integration (Optional)

Automate skill validation and workflows with settings.json hooks:

**PostToolUse hooks** - Validate after edits:
```json
{
  "PostToolUse": {
    "Edit": "claude-skills-cli validate $CLAUDE_FILE_PATH"
  }
}
````

**PreToolUse hooks** - Safety checks before operations:

```json
{
	"PreToolUse": {
		"Bash": "bash .claude/hooks/safety-check.sh"
	}
}
```

For detailed patterns:
[hook-integration.md](references/hook-integration.md)

````

### Priority 1: Important Additions

#### 5. Create New Reference: `references/quality-metrics.md`

```markdown
# Skill Quality Metrics

## Overview

Measuring skill quality helps identify improvement opportunities and track progress over time.

## Quality Dimensions

### 1. Structure Quality (0-1.0)
**Measures**: Adherence to progressive disclosure and organizational best practices

**Factors**:
- Valid YAML frontmatter (0.2)
- Proper sections (Quick Start, Core Patterns, References) (0.3)
- Appropriate use of code blocks (1-2 optimal) (0.2)
- Clear heading hierarchy (0.2)
- Link integrity (no broken links) (0.1)

**Target**: >0.9

### 2. Clarity Quality (0-1.0)
**Measures**: How clearly the skill communicates instructions

**Factors**:
- Description length (50-200 chars optimal) (0.2)
- Trigger keywords present ("Use when...") (0.2)
- Concrete examples (not abstract) (0.2)
- Imperative voice (not second person) (0.2)
- No vague language ("might", "should", "try") (0.2)

**Target**: >0.8

### 3. Completeness Quality (0-1.0)
**Measures**: Extent of documentation and resources

**Factors**:
- Has Quick Start example (0.2)
- Has 3-5 core patterns (0.3)
- Has references/ directory with content (0.2)
- Scripts are documented (0.2)
- Examples are real, not invented (0.1)

**Target**: >0.7

### 4. Maintainability Quality (0-1.0)
**Measures**: Ease of maintaining and updating skill

**Factors**:
- Last updated within 30 days (0.3)
- No TODO placeholders (0.2)
- Version tracked (CHANGELOG or git) (0.2)
- Scripts have documentation (0.2)
- Follows naming conventions (0.1)

**Target**: >0.7

### 5. Effectiveness Quality (0-1.0)
**Measures**: How well skill achieves its purpose

**Factors**:
- Has test scenarios (0.3)
- Test pass rate (0.3)
- Usage metrics available (0.2)
- User feedback positive (0.2)

**Target**: >0.6

## Overall Quality Score

````

Overall = (Structure × 0.25) + (Clarity × 0.25) + (Completeness ×
0.2) + (Maintainability × 0.15) + (Effectiveness × 0.15)

````

**Ratings**:
- 0.9-1.0: Excellent
- 0.7-0.9: Good
- 0.5-0.7: Fair
- <0.5: Needs improvement

## Measuring Quality

### Using claude-skills-cli

```bash
# Get quality score (v0.2.0+)
claude-skills-cli validate .claude/skills/my-skill --score

# Output:
# Quality Score: 0.82 / 1.00 (Good)
#
# Dimensions:
#   Structure:       0.95  ✅ Excellent
#   Clarity:         0.78  ⚠️  Could improve
#   Completeness:    0.72  ⚠️  Could improve
#   Maintainability: 0.88  ✅ Excellent
#   Effectiveness:   0.65  ⚠️  Could improve
#
# Recommendations:
#   - Add trigger keywords to description ("Use when...")
#   - Create test scenarios for behavioral validation
#   - Add 2-3 more reference documents for completeness
````

### Tracking Over Time

```bash
# Generate quality report for all skills
claude-skills-cli stats .claude/skills --detailed

# Track trends (v0.3.0+)
claude-skills-cli stats .claude/skills --history

# Export for analysis
claude-skills-cli stats .claude/skills --json > stats.json
```

## Quality Improvement Workflow

```
1. Measure baseline
   → claude-skills-cli validate --score

2. Identify lowest dimension
   → Focus on weakest area first

3. Apply improvements
   → Use specific recommendations

4. Re-measure
   → Verify improvements

5. Track over time
   → Ensure sustained quality

6. Repeat
   → Continuous improvement
```

## Benchmarking

### Against Official Skills

Compare your skills against Anthropic's official skills:

```bash
# Compare (v0.2.0+)
claude-skills-cli validate .claude/skills/my-skill --benchmark

# Output:
# Your skill: 0.78
# Benchmark (anthropics/skills avg): 0.87
# Gap: -0.09 (10% below benchmark)
#
# Areas to improve:
#   - Add behavioral tests (benchmark avg: 0.82, yours: 0.60)
#   - Improve description keywords (benchmark avg: 0.91, yours: 0.75)
```

### Against Community

Compare against high-quality community skills:

- obra/superpowers: 0.91 avg
- anthropics/skills: 0.87 avg
- spences10/claude-skills-cli: 0.85 avg

## Quality Anti-patterns

### ❌ Optimizing Wrong Dimension

Focusing on structure (which is already 0.95) instead of effectiveness
(which is 0.50)

### ❌ No Baseline Measurement

Making changes without knowing starting quality or impact

### ❌ Gaming Metrics

Meeting letter of metrics (e.g., 50 lines) but missing spirit (unclear
instructions)

### ❌ One-Time Measurement

Measuring quality once at creation, never tracking degradation

## Resources

- SKILLS-ECOSYSTEM-ANALYSIS.md - Quality benchmarks from analysis
- claude-skills-cli validation output - Automatic scoring
- Community skill quality reports - Public benchmarks

````

#### 6. Update `references/cli-reference.md`: Add Future Commands

**Append to end of file**:

```markdown
---

## Future Commands (Roadmap)

The following commands are planned for future releases:

### `test` Command (v0.2.0)
```bash
claude-skills-cli test .claude/skills/my-skill [--scenarios tests.json]
````

Behavioral validation using subagent testing. Validates that skills
effectively guide Claude's behavior.

### `search` and `install` Commands (v0.2.0)

```bash
claude-skills-cli search testing
claude-skills-cli install test-runner [--global]
```

Discover and install community skills from registry.

### `hook` Command (v0.3.0)

```bash
claude-skills-cli hook add --template pre-commit-validation
claude-skills-cli hook list
```

Manage hooks for automated validation and workflows.

### Enhanced `validate` with Quality Scoring (v0.2.0)

```bash
claude-skills-cli validate .claude/skills/my-skill --score --benchmark
```

Quality metrics and benchmarking against community standards.

See [CLI-IMPROVEMENTS.md](../../../docs/CLI-IMPROVEMENTS.md) for
detailed roadmap.

````

### Priority 2: Content Improvements

#### 7. Update `skill-examples.md`: Add Community Examples

**Add section before "Resources" at end**:

```markdown
---

## Community Skill Patterns

Effective patterns from high-quality community skills:

### Pattern: Subagent Testing (obra/superpowers)

```markdown
---
name: writing-skills
description: Test-Driven Development for process documentation. Use when creating skills that need validation.
---

# Writing Skills

**Writing skills IS Test-Driven Development applied to process documentation.**

1. Write test cases (pressure scenarios)
2. Launch subagent with baseline
3. Observe failure modes
4. Write/refine skill
5. Re-test with subagent
6. Pass = skill effectively guides behavior

See [references/testing-approach.md](references/testing-approach.md)
````

**Why it works**: Validates effectiveness, not just syntax.

### Pattern: Hook-Based Validation (masharratt/claude-flow-novice)

Automatic validation after skill edits:

```json
{
	"PostToolUse": {
		"Edit": "bash .claude/skills/hook-pipeline/post-edit-handler.sh"
	}
}
```

**Why it works**: Catches errors immediately, enforces quality.

### Pattern: Script-Heavy Skills (sorryhyun/DiPeO)

Multiple utility scripts for common operations:

```
doc-lookup/
├── SKILL.md
└── scripts/
    ├── section_search.py
    ├── validate_doc_anchors.py
    └── generate_index.py
```

**Why it works**: Deterministic operations don't need generation,
saves tokens.

### Pattern: Framework Integration (modu-ai/moai-adk)

Deep framework knowledge:

````markdown
---
name: google-adk
description:
  Google ADK Python SDK patterns for agent development. Use when
  working with ADK agents, tools, or prompt engineering.
---

# Google ADK Integration

## Quick Start

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ['GOOGLE_API_KEY'])
```
````

See [references/adk-patterns.md](references/adk-patterns.md) for
complete SDK reference.

```

**Why it works**: Framework-specific, immediately useful, concrete examples.
```

#### 8. Update SKILL.md: Improve "When to Create a Skill" Section

**Replace lines 22-33 with**:

```markdown
## When to Create a Skill

Create a skill when you notice:

- **Repeating context** across conversations (same schema, patterns,
  rules)
- **Domain expertise** needed repeatedly (API integration, framework
  conventions)
- **Project-specific knowledge** that Claude should know automatically
- **Code quality** patterns you enforce manually
- **Testing workflows** that follow specific steps
- **Documentation** generation with consistent format

**Examples**:

- "I keep explaining this database schema" → Create database-schema
  skill
- "I always check these security patterns" → Create security-review
  skill
- "I follow these test steps each time" → Create test-workflow skill
- "I generate docs in this format" → Create doc-generator skill

**Don't create a skill for**:

- One-time tasks
- Knowledge Claude already has (e.g., "JavaScript syntax")
- Tasks that change frequently (use CLAUDE.md instead)
```

## Implementation Priority

### Ship Immediately (No CLI changes required)

1. ✅ Add Behavioral Testing section to SKILL.md
2. ✅ Create testing-methodology.md reference
3. ✅ Create hook-integration.md reference
4. ✅ Add hook integration mention to SKILL.md
5. ✅ Update skill-examples.md with community patterns
6. ✅ Improve "When to Create a Skill" section

**Effort**: 2-3 hours writing **Impact**: High - Fills knowledge gaps
immediately

### Ship with v0.2.0 (Requires CLI features)

7. ⏳ Create quality-metrics.md (after quality scoring implemented)
8. ⏳ Update cli-reference.md with future commands (after design
   finalized)

**Effort**: 1 hour writing (after CLI features done) **Impact**:
Medium - Complements new CLI features

## Content Quality Improvements

### Existing Content to Enhance

#### `writing-guide.md`

**Current**: 620 lines, comprehensive **Improvement**: Already
excellent, no changes needed

#### `anthropic-resources.md`

**Status**: Not reviewed, assumed to be links to official docs
**Recommendation**: Verify links are current, add any new docs

#### `skill-examples.md`

**Current**: Good examples, but all from single codebase
**Improvement**: ✅ Add community examples (see #7 above)

#### `cli-reference.md`

**Current**: Complete for current commands **Improvement**: ✅ Add
roadmap section (see #6 above)

## Validation

After implementing changes, validate with:

```bash
# Validate structure
npx claude-skills-cli validate .claude/skills/skill-creator

# Check metrics
npx claude-skills-cli stats .claude/skills/skill-creator

# Test in real conversation
# Ask Claude Code: "Help me create a new skill for API testing"
# Observe if new content (testing, hooks) is used
```

## Success Criteria

Changes are successful if:

1. ✅ Validation passes
2. ✅ New references are linked from SKILL.md
3. ✅ Word count stays reasonable (<6k words total)
4. ✅ Claude mentions behavioral testing when creating skills
5. ✅ Claude suggests hook integration appropriately
6. ✅ Community patterns appear in skill-examples.md

## Conclusion

The skill-creator skill is already strong. These updates:

- **Fill knowledge gaps**: Testing and hooks weren't covered
- **Incorporate community wisdom**: Best practices from 30+ skills
- **Future-proof**: References new CLI features in development
- **Maintain quality**: Additions follow progressive disclosure

**Recommended action**: Implement Priority 0 items immediately (2-3
hours), defer Priority 1 until v0.2.0 CLI features ship.
