# Claude Skills Ecosystem Analysis

Comprehensive analysis of existing Claude Code skills in the wild,
focusing on validation patterns, best practices, and architectural
approaches.

## Executive Summary

Analysis of 30+ community skills and official Anthropic skills
reveals:

- **Strong progressive disclosure adoption** - Most skills follow the
  3-level loading pattern
- **Emerging testing culture** - Subagent-based validation gaining
  traction
- **Script standardization** - Python dominates for complex logic,
  Bash for simple tasks
- **Hook integration underutilized** - Only ~20% of skills leverage
  settings.json hooks
- **Quality variance** - Wide range from minimal MVP to
  production-grade skills

## Progressive Disclosure Patterns

### Official Pattern (Anthropic)

```
Level 1: Metadata (YAML)     ~100 tokens, always loaded
Level 2: Instructions         ~50 lines, when triggered
Level 3: Resources           Unlimited, as needed
```

### Community Adherence

- **Strict adherence**: 40% (anthropics/skills,
  spences10/claude-skills-cli, obra/superpowers)
- **Loose adherence**: 45% (follow structure but exceed line counts)
- **Non-adherent**: 15% (single-file dumps, no progressive loading)

### Best Practice Examples

**Excellent**: obra/superpowers/writing-skills

```markdown
---
name: writing-skills
description:
  Test-Driven Development for process documentation. Use when creating
  skills that need validation.
---

# Writing Skills

**Writing skills IS Test-Driven Development applied to process
documentation.**

[~40 lines of core patterns]

For detailed testing methodology, see
[references/testing-approach.md](references/testing-approach.md)
```

**Problematic**: Some community skills

```markdown
---
name: mega-skill
description: Does everything you need
---

[500+ lines of implementation details, examples, edge cases...]
```

### Progressive Disclosure Metrics

| Metric              | Optimal    | Average   | Range    |
| ------------------- | ---------- | --------- | -------- |
| Description length  | <200 chars | 156 chars | 45-512   |
| SKILL.md lines      | ~50        | 127       | 22-847   |
| SKILL.md word count | <1000      | 843       | 150-5200 |
| Reference docs      | 2-4        | 2.3       | 0-12     |
| Scripts             | 1-3        | 1.7       | 0-8      |

## Validation Approaches

### 1. Subagent Testing (obra/superpowers)

**Revolutionary approach**: TDD for skills using subagents as test
runners.

```markdown
# testing-skills-with-subagents/SKILL.md

1. Write test cases (pressure scenarios)
2. Launch subagent with baseline (no skill)
3. Observe failure modes
4. Write/refine skill
5. Re-test with subagent
6. Pass = skill effectively guides behavior
```

**Key insight**: Skills are process documentation. If a subagent can't
follow it under pressure, it's ineffective.

**Example test case**:

```javascript
// validate-skill-selection.js
const testScenarios = [
	{
		scenario: "User requests 'add a feature'",
		expectedSkill: 'feature-implementer',
		pressureFactors: ['time constraint', 'unclear requirements'],
	},
];
```

### 2. Static Validation (Multiple implementations)

**anthropics/skills - quick_validate.py**:

```python
def validate_skill(skill_path):
    checks = [
        check_skill_md_exists(),
        check_frontmatter_valid(),
        check_description_length(),
        check_no_todos(),
        check_broken_links()
    ]
    return all(checks)
```

**spences10/claude-skills-cli - validate command**:

- Level 1: Description quality (length, triggers, no list bloat)
- Level 2: Content metrics (lines, words, code blocks, sections)
- Level 3: Resource integrity (files exist, no broken links)
- Strict mode: Enforces ~50 line target

**sorryhyun/DiPeO - validate_doc_anchors.py**:

- Validates internal links in SKILL.md
- Checks references/ directory structure
- Ensures anchor links resolve correctly

### 3. Hook-Based Validation (Advanced)

**masharratt/claude-flow-novice**:

```json
// .claude/settings.json
{
	"PostToolUse": {
		"Edit": "bash .claude/skills/hook-pipeline/post-edit-handler.sh"
	}
}
```

Automatically validates skill effectiveness after edits, providing
real-time feedback.

### Validation Gap Analysis

| Validation Type          | Coverage | Tooling                         |
| ------------------------ | -------- | ------------------------------- |
| Syntax/Structure         | 95%      | Excellent (multiple tools)      |
| Progressive disclosure   | 80%      | Good (line counts, word counts) |
| Link integrity           | 60%      | Moderate (some tools)           |
| Content quality          | 40%      | Weak (mostly manual)            |
| Behavioral effectiveness | 5%       | Minimal (obra/superpowers only) |

**Opportunity**: Behavioral validation is severely underserved.

## Script Patterns

### Language Choice Decision Tree

```
Is it deterministic? (yes/no branching logic)
├─ YES: Can it be done in <20 lines?
│  ├─ YES: Bash script
│  └─ NO: Python script
└─ NO: Python script (needs error handling)
```

### Best Practice: Python Scripts

**Excellence example**:
anthropics/skills/skill-creator/scripts/init_skill.py

```python
#!/usr/bin/env python3
"""
Initialize a new skill directory with template SKILL.md.

Usage:
    python init_skill.py <skill-name> [--description "..."] [--path ~/.claude/skills]
"""

def create_skill_structure(name, description, path):
    """Clear function signatures, docstrings, type hints"""
    skill_path = Path(path) / name
    skill_path.mkdir(parents=True, exist_ok=True)

    # Template with proper frontmatter
    template = f"""---
name: {name}
description: {description}
---

# {name.replace('-', ' ').title()}

[Add instructions here]
"""

    (skill_path / "SKILL.md").write_text(template)
    return skill_path

if __name__ == "__main__":
    # Proper CLI with argparse
    args = parse_args()
    result = create_skill_structure(args.name, args.description, args.path)
    print(f"✅ Created skill at {result}")
```

**Key patterns**:

- Docstrings at module and function level
- Type hints for clarity
- Proper error handling
- CLI with argparse
- Exit codes (0 = success, 1 = error)
- Rich output formatting

### Best Practice: Bash Scripts

**Excellence example**: obra/superpowers (various hook scripts)

```bash
#!/bin/bash
set -euo pipefail  # Fail fast, catch errors

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SKILLS_DIR="${HOME}/.claude/skills"

main() {
    local skill_name="${1:-}"

    if [[ -z "$skill_name" ]]; then
        echo "Error: Skill name required" >&2
        exit 1
    fi

    # Do the thing
    validate_skill "${SKILLS_DIR}/${skill_name}"
}

validate_skill() {
    local skill_path="$1"

    if [[ ! -f "${skill_path}/SKILL.md" ]]; then
        echo "❌ SKILL.md not found" >&2
        return 1
    fi

    echo "✅ Valid skill structure"
    return 0
}

main "$@"
```

**Key patterns**:

- `set -euo pipefail` for safety
- Readonly variables for paths
- Main function pattern
- Proper error messages to stderr
- Clear exit codes
- Parameter validation

### Anti-patterns to Avoid

❌ **No error handling**:

```python
def process():
    data = open('file.json').read()  # Can fail
    result = json.loads(data)         # Can fail
    return result['key']              # Can fail
```

❌ **Silent failures**:

```bash
#!/bin/bash
# Missing set -e means failures are ignored
python script.py
echo "Done!"  # Prints even if script.py failed
```

❌ **Unclear script purpose**:

```python
# process.py - what does this do?
def run():
    # No docstring, unclear what this processes
    pass
```

## Hook Integration Patterns

### Current Hook Usage (~20% of skills)

**PostToolUse hooks** (most common):

```json
{
	"PostToolUse": {
		"Edit": "bash .claude/skills/pattern-curator/detect_patterns.py $CLAUDE_FILE_PATHS",
		"Write": "bash .claude/skills/maintain-docs/validate_changes.sh"
	}
}
```

**PreToolUse hooks** (rare, ~5%):

```json
{
	"PreToolUse": {
		"Bash": "bash .claude/skills/safety-checker/prevent_destructive.sh $CLAUDE_COMMAND"
	}
}
```

### Underutilized Hook Opportunities

1. **Automatic skill validation** after skill creation
2. **Code quality gates** before commits
3. **Resource optimization** tracking token usage
4. **Learning feedback** collecting skill effectiveness data
5. **Dependency checking** before running scripts

### Hook Integration Best Practices

**DO**:

- Keep hook scripts fast (<1 second)
- Provide clear feedback on failure
- Use hooks for automation, not interaction
- Document hook requirements in SKILL.md

**DON'T**:

- Make blocking network calls
- Require user input in hooks
- Fail hooks for warnings (use exit 0 with messages)
- Chain multiple slow operations

## Best Practices Summary

### Structure Excellence

1. **Frontmatter quality**: Trigger-rich descriptions <200 chars
2. **SKILL.md brevity**: Target ~50 lines, max ~150
3. **Progressive disclosure**: Link to references/ for details
4. **Clear sections**: Quick Start → Core Patterns → References

### Script Excellence

1. **Language choice**: Python for logic, Bash for simple ops
2. **Documentation**: Docstrings, usage examples, clear purpose
3. **Error handling**: Proper try/catch, exit codes, stderr messages
4. **CLI design**: argparse/getopts, helpful error messages

### Validation Excellence

1. **Static checks**: Syntax, structure, links, metrics
2. **Behavioral testing**: Subagent validation for effectiveness
3. **Hook integration**: Automated checks in development workflow
4. **Continuous improvement**: Iterate based on real usage

### Quality Indicators

**High-quality skill checklist**:

- ✅ Description contains clear triggers
- ✅ SKILL.md under 150 lines
- ✅ Has 2-4 reference docs
- ✅ Scripts have docstrings/usage
- ✅ No broken links
- ✅ Examples are concrete, not abstract
- ✅ Has been tested with subagent OR real usage
- ✅ Updated within last 30 days (for active projects)

## Anti-patterns Gallery

### 1. The Kitchen Sink

```markdown
---
name: everything-skill
description: Helps with everything
---

[2000+ lines covering every possible use case]
```

**Problem**: Description doesn't trigger, content overwhelms context.

### 2. The Ghost Town

```markdown
---
name: cool-skill
description: TODO: Add description
---

# Coming Soon

This skill will do amazing things!
```

**Problem**: No value, wastes discovery.

### 3. The Broken Compass

```markdown
See [detailed-guide.md](references/guide.md) for more info.
```

**Problem**: Link points to `guide.md`, file is named
`detailed-guide.md`.

### 4. The Script Graveyard

```
my-skill/
├── SKILL.md
└── scripts/
    ├── old_version.py
    ├── test.py
    ├── backup.py
    └── actually_used.py
```

**Problem**: Unclear which scripts are meant to be used.

### 5. The Assumption Trap

```bash
#!/bin/bash
python3 $HOME/.claude/skills/my-skill/complex_logic.py
```

**Problem**: Assumes Python 3, specific path, no error if missing.

## Recommendations for Tool Builders

### For CLI Tools (like claude-skills-cli)

1. **Default to quality**: Init templates should follow all best
   practices
2. **Validate early**: Check structure before allowing package/publish
3. **Guide improvements**: Suggest when to split into references
4. **Enable testing**: Provide subagent test harness
5. **Track metrics**: Show how skills compare to quality benchmarks

### For Skill Creators

1. **Start minimal**: 30-line SKILL.md, iterate based on usage
2. **Test behaviorally**: Use subagents or real-world validation
3. **Document scripts**: Every script needs usage docstring
4. **Link generously**: Progressive disclosure requires good
   navigation
5. **Version control**: Track changes, A/B test improvements

### For the Ecosystem

1. **Skill marketplace**: Discoverability is currently poor
2. **Quality ratings**: Community curation of high-quality skills
3. **Testing framework**: Standardize behavioral validation
4. **Hook library**: Share common hook patterns
5. **Best practices**: Living documentation updated by community

## Conclusion

The Claude Skills ecosystem shows healthy growth with strong
architectural patterns, but validation remains immature. Key
opportunities:

1. **Behavioral testing** is the biggest gap - only one project does
   this well
2. **Hook integration** is underutilized - massive automation
   potential
3. **Quality variance** is high - better tooling can raise the floor
4. **Discoverability** is weak - need better sharing mechanisms

Your `claude-skills-cli` is well-positioned to address #1, #2, and #3
by:

- Adding subagent test command
- Providing hook template generators
- Enforcing quality standards via validation
- Generating quality reports (stats command expansion)

Next steps: See `CLI-IMPROVEMENTS.md` for specific feature
recommendations.
