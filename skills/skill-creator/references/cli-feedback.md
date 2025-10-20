# CLI Feedback - Real-World Usage Patterns

Real feedback from Claude agents using `claude-skills-cli` in
production.

**Source**: Real usage creating 3 production skills in ~15 minutes
**CLI Version**: 0.0.3+ **Date**: 2025-10-20 **Last Updated**:
2025-10-20

---

## ✅ UPDATE: High & Medium Priority Items IMPLEMENTED

All high-priority friction points and medium-priority features have
been implemented:

- ✅ Minimal scaffolding by default (no empty dirs/files to clean up)
- ✅ `--with-examples` flag for opt-in example files
- ✅ Improved comma warning logic (allows concise technical lists)
- ✅ HTML comments excluded from line count
- ✅ New `stats` command for multi-skill overview

**Result**: The CLI now achieves **S-tier** status for Claude's
workflow! 🎯

---

## ✅ What Works Great

### 1. Clear, Simple Commands

The API is intuitive and exactly what you need:

```bash
npx claude-skills init --name skill-name --description "Description"
npx claude-skills validate .claude/skills/skill-name
npx claude-skills package .claude/skills/skill-name
```

No unnecessary complexity.

### 2. Excellent Validation Feedback ⭐

The validation output is **fantastic**:

```
📊 Progressive Disclosure Stats:
  Level 1 (Metadata - Always Loaded):
    Description: 127 chars, ~18 tokens ✅ Optimal

  Level 2 (SKILL.md Body - Loaded when triggered):
    Lines: 76 (target: ~50, max: ~150) ✅ Good
    Words: 258 (recommended: <1000, max: <5000) ✅ Excellent
```

**Why this is great:**

- Clear visual feedback with emojis
- Specific recommendations ("~50 lines", "<1000 words")
- Shows actual vs. target values
- Actionable suggestions

### 3. Progressive Disclosure Guidance

The template includes helpful comments explaining the 3-level system:

- Level 1: Metadata (always loaded)
- Level 2: SKILL.md body (loaded when triggered)
- Level 3: references/ (loaded as needed)

This educational aspect is brilliant for first-time users.

### 4. Next Steps Messaging

After `init`, the CLI tells you exactly what to do next:

```
Next steps:
1. Edit .claude/skills/auth-patterns/SKILL.md with your skill instructions
2. Add detailed documentation to references/
3. Add executable scripts to scripts/
4. Remove example files you don't need

Validate with: claude-skills validate .claude/skills/auth-patterns
```

---

## 🐛 Known Issues & Workarounds

### ✅ Issue 1: Empty Directories Created by Default (FIXED)

**Problem**: Every `init` creates `assets/` and `scripts/`
directories, which are often empty and unused.

**Status**: ✅ **FIXED** - Now only creates `references/` by default

**New behavior:**

- Default: Creates only `SKILL.md`, `README.md`, and `references/`
- With `--with-examples`: Creates full scaffolding including
  `assets/`, `scripts/`, and example files

```bash
# Minimal (default)
npx claude-skills init --name my-skill --description "..."

# With examples
npx claude-skills init --name my-skill --description "..." --with-examples
```

### ✅ Issue 2: Template Files Need Deletion (FIXED)

**Problem**: Template creates example reference files that need to be
removed:

- `references/detailed-guide.md`
- References to non-existent examples

**Status**: ✅ **FIXED** - Example files only created with
`--with-examples` flag

**New behavior:**

- Default: No example files created
- With `--with-examples`: Creates `detailed-guide.md` and `example.js`

### ✅ Issue 3: Description Comma Warning Not Always Relevant (FIXED)

**Problem**: Validation warns about commas in descriptions, but for
technical skills, lists are often necessary:

```
⚠️ Description contains long lists (5 commas)
   → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)
```

**Example description**:

> "DaisyUI v5 design system. Use for backgrounds, borders, text sizes,
> opacity, semantic colors, and spacing."

This is concise (106 chars) but gets flagged for 5 commas. The
alternative would be vague: "DaisyUI v5 design system for UI
styling" - less useful.

**Status**: ✅ **FIXED** - Now only warns if BOTH conditions met: >150
chars AND ≥5 commas

**New behavior:**

- Concise technical lists (like the example above) no longer trigger
  warnings
- Only warns when description is both long AND list-heavy

### Issue 4: Python Script Reference in Template

**Problem**: Old template included:

```markdown
## Scripts

- `scripts/example.js` - [What this script does]
```

This assumes JavaScript/Node.js, but many skills don't need scripts at
all (especially documentation-based patterns).

**Status**: Fixed in latest version - scripts section removed from
template

---

## 💡 Requested Features

### ✅ 1. Minimal Scaffolding (IMPLEMENTED)

**Requested syntax:**

```bash
npx claude-skills init --name my-skill --description "..." --minimal
```

**Status**: ✅ **IMPLEMENTED** - Minimal is now the default behavior

**Implementation:**

- Default creates only: `SKILL.md`, `README.md`, `references/`
- Use `--with-examples` for full scaffolding with example files
- No cleanup needed for typical workflows

### ✅ 2. `stats` Command (IMPLEMENTED)

**Requested syntax:**

```bash
npx claude-skills stats .claude/skills/
```

**Status**: ✅ **IMPLEMENTED**

**Example output:**

```
📊 Skills Overview
============================================================
3 skills found:

auth-patterns (✅ valid)
  Description: 127 chars (optimal)
  Body: 76 lines, 258 words (excellent)
  References: 3 files (20.8 KB)

styling-patterns (⚠️  warnings)
  Description: 106 chars (optimal)
  Body: 85 lines, 284 words (good)
  References: 1 file (11.2 KB)
  2 warnings

form-patterns (✅ valid)
  Description: 114 chars (optimal)
  Body: 102 lines, 264 words (good)
  References: 1 file (8.0 KB)

Summary:
  Valid: 3
  With warnings: 1
```

### 3. Validation Auto-fix Suggestions

**Requested**: When validation fails, suggest specific fixes:

```
❌ Errors:
  ❌ Referenced file not found: references/common-mistakes.md
     → Linked from: [references/common-mistakes.md]

💡 Quick fix:
  touch .claude/skills/styling-patterns/references/common-mistakes.md

Or remove the broken link:
  Remove line 84 in SKILL.md
```

**Status**: Under consideration

---

## 📈 Real Usage Results

Created 3 production-ready skills:

1. **auth-patterns** (76 lines, 258 words) ✅
   - Better-auth integration patterns
   - 3 reference files

2. **styling-patterns** (85 lines, 284 words) ✅
   - DaisyUI v5 design system
   - 1 reference file (comprehensive guide)

3. **form-patterns** (102 lines, 264 words) ✅
   - DaisyUI v5 form patterns
   - 1 reference file

**Total time**: ~15 minutes (including docs research and writing)

**Friction points**:

- Deleting empty `assets/` and `scripts/` dirs: 6 times
- Removing template reference files: 3 times
- Adjusting descriptions to avoid comma warnings: 2 times

---

## 🌟 Overall Assessment

**Grade: A-**

The CLI is excellent for its core purpose. The validation feedback is
world-class, and the progressive disclosure guidance is valuable.

**Main issues**:

1. Unnecessary scaffolding (empty dirs, template files)
2. Some validation warnings too strict/not contextual

**Would recommend**: Yes, absolutely. With minor tweaks, this would be
S-tier.

**Best feature**: The detailed, actionable validation output. It
teaches you best practices while validating.

**Biggest win**: Going from idea to validated skill in ~5 minutes.

---

## 🔧 Priority Fixes

**High Priority** (blocking efficient workflow):

1. ✅ **DONE** - Don't create empty `assets/` and `scripts/`
   directories by default
2. ✅ **DONE** - Don't create template reference files (use
   `--with-examples` flag for opt-in)
3. ✅ **DONE** - Improve description comma warning logic (now
   requires >150 chars AND ≥5 commas)
4. ✅ **DONE** - Remove script section from minimal template

**Medium Priority** (valuable additions):

5. ✅ **DONE** - Minimal scaffolding by default (was `--minimal` flag,
   now default behavior)
6. ✅ **DONE** - Don't count HTML comments in line count validation
7. ✅ **DONE** - Add `stats` command for multi-skill overview

**Low Priority** (nice to have):

8. ⏳ Interactive init mode
9. ⏳ `format` command
10. ⏳ Auto-fix suggestions in validation errors

---

## 💬 Quotes from Usage

> "The validation output is _fantastic_ - clear, visual, actionable."

> "Going from idea to validated skill in ~5 minutes is the biggest
> win."

> "The CLI teaches you best practices while you use it."

> "Would be perfect with just the cleanup friction points fixed."

---

## Example Usage Session

### Current Workflow

```bash
# 1. Init new skill
$ npx claude-skills init --name auth-patterns \
    --description "Better-auth integration"
✅ Skill created at: .claude/skills/auth-patterns

# 2. Manual cleanup (pain point)
$ rm -rf .claude/skills/auth-patterns/assets
$ rm -rf .claude/skills/auth-patterns/scripts

# 3. Edit SKILL.md and add reference docs
$ vim .claude/skills/auth-patterns/SKILL.md
$ cp docs/auth-usage.md .claude/skills/auth-patterns/references/

# 4. Validate
$ npx claude-skills validate .claude/skills/auth-patterns
✅ Skill is valid (with warnings)

# 5. Package
$ npx claude-skills package .claude/skills/auth-patterns
✅ Package created: dist/auth-patterns.zip
```

### ✅ Ideal Workflow (NOW IMPLEMENTED)

```bash
# New workflow - no cleanup needed!
$ npx claude-skills init --name auth-patterns \
    --description "Better-auth integration"
✅ Skill created at: .claude/skills/auth-patterns

$ vim .claude/skills/auth-patterns/SKILL.md

$ npx claude-skills validate .claude/skills/auth-patterns
✅ Skill is valid! All checks passed.

$ npx claude-skills stats .claude/skills
📊 3 skills found
Summary:
  Valid: 3
```

---

## Tips for Claude Agents

Based on real usage:

### 1. Always Validate Early and Often

Don't wait until the end. Validate as you write:

```bash
# After writing description
npx claude-skills validate .claude/skills/my-skill

# After adding content
npx claude-skills validate .claude/skills/my-skill

# Before packaging
npx claude-skills validate .claude/skills/my-skill
```

### 2. Use `--with-examples` When Learning

If you want to see example files:

```bash
npx claude-skills init --name my-skill \
  --description "..." \
  --with-examples
```

This creates example references and scripts to learn from.

### 3. Technical Lists in Descriptions Are Fine

Concise technical lists won't trigger warnings:

```yaml
# ✅ This is fine (106 chars, 5 commas)
description: DaisyUI v5 design system. Use for backgrounds, borders, text, colors, spacing.

# ⚠️  This would warn (>150 chars + ≥5 commas)
description: A very long description that goes on and on with lots of details about backgrounds, borders, text styling, semantic colors, spacing utilities, and more features...
```

### 4. Aim for "Excellent" Ratings

Target the validation "Excellent" thresholds:

- Description: <200 chars
- Lines: ~50
- Words: <1000
- Code blocks: 1-2

### 5. Use References Liberally

When in doubt, move content to `references/`:

- Complete schemas
- Multiple examples
- API documentation
- Detailed workflows

---

## Resources

- Main CLI: [README.md](../../../README.md)
- Complete reference: [cli-reference.md](cli-reference.md)
- Anthropic guidance: [anthropic-resources.md](anthropic-resources.md)
