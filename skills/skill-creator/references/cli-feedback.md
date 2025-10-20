# CLI Feedback - Real-World Usage Patterns

Real feedback from Claude agents using `claude-skills-cli` in production.

**Source**: Real usage creating 3 production skills in ~15 minutes
**CLI Version**: 0.0.3
**Date**: 2025-10-20

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

### Issue 1: Empty Directories Created by Default

**Problem**: Every `init` creates `assets/` and `scripts/` directories, which are often empty and unused.

**Current workflow:**

```bash
npx claude-skills init --name auth-patterns --description "..."
rm -rf .claude/skills/auth-patterns/assets
rm -rf .claude/skills/auth-patterns/scripts
```

**Impact**: Adds manual cleanup step after every init.

**Status**: Planned fix - only create `references/` by default

**Workaround**: Delete empty directories after creation:

```bash
npx claude-skills init --name my-skill && \
  rm -rf .claude/skills/my-skill/assets && \
  rm -rf .claude/skills/my-skill/scripts
```

### Issue 2: Template Files Need Deletion

**Problem**: Template creates example reference files that need to be removed:

- `references/detailed-guide.md`
- References to non-existent examples

**Current workflow:**

```bash
rm .claude/skills/my-skill/references/detailed-guide.md
```

**Status**: Planned fix - don't create template files

**Workaround**: Delete unwanted template files immediately after init.

### Issue 3: Description Comma Warning Not Always Relevant

**Problem**: Validation warns about commas in descriptions, but for technical skills, lists are often necessary:

```
⚠️ Description contains long lists (5 commas)
   → Move detailed lists to Level 2 (SKILL.md body) or Level 3 (references/)
```

**Example description**:

> "DaisyUI v5 design system. Use for backgrounds, borders, text sizes, opacity, semantic colors, and spacing."

This is concise (106 chars) but gets flagged for 5 commas. The alternative would be vague: "DaisyUI v5 design system for UI styling" - less useful.

**Status**: Planned fix - increase threshold to 6 commas

**Workaround**: Either:

1. Ignore the warning (it's not an error)
2. Rewrite to use fewer commas
3. Use `--strict` mode only when enforcing stricter rules

### Issue 4: Python Script Reference in Template

**Problem**: Old template included:

```markdown
## Scripts

- `scripts/example.py` - [What this script does]
```

This assumes Python, but many skills don't need scripts at all (especially documentation-based patterns).

**Status**: Fixed in latest version - scripts section removed from template

---

## 💡 Requested Features

### 1. `--minimal` Flag for Init

**Requested syntax:**

```bash
npx claude-skills init --name my-skill --description "..." --minimal
```

**Would create only:**

- SKILL.md (without template placeholders)
- README.md
- references/ (empty directory)

**Skips:**

- assets/
- scripts/
- Example reference files

**Status**: Planned for future release

### 2. `stats` Command

**Requested syntax:**

```bash
npx claude-skills stats .claude/skills/
```

**Would show:**

```
📊 Skills Overview
============================================================
3 skills found:

auth-patterns (✅ valid)
  Description: 127 chars (optimal)
  Body: 76 lines, 258 words
  References: 3 files (20.8 KB)

styling-patterns (⚠️ warnings)
  Description: 106 chars (optimal)
  Body: 85 lines, 284 words (consider splitting)
  References: 1 file (11.2 KB)

form-patterns (✅ valid)
  Description: 114 chars (optimal)
  Body: 102 lines, 264 words
  References: 1 file (8.0 KB)
```

**Status**: Planned for future release

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

The CLI is excellent for its core purpose. The validation feedback is world-class, and the progressive disclosure guidance is valuable.

**Main issues**:

1. Unnecessary scaffolding (empty dirs, template files)
2. Some validation warnings too strict/not contextual

**Would recommend**: Yes, absolutely. With minor tweaks, this would be S-tier.

**Best feature**: The detailed, actionable validation output. It teaches you best practices while validating.

**Biggest win**: Going from idea to validated skill in ~5 minutes.

---

## 🔧 Priority Fixes

**High Priority** (blocking efficient workflow):

1. ✅ Don't create empty `assets/` and `scripts/` directories by default
2. ✅ Don't create template reference files (or add `--no-examples` flag)
3. ✅ Improve description comma warning logic (increase threshold to 6)
4. ✅ Remove Python script section from template

**Medium Priority** (valuable additions): 5. ⏳ Add `--minimal` flag for init 6. ⏳ Don't count HTML comments in line count validation 7. ⏳ Add `stats` command for multi-skill overview

**Low Priority** (nice to have): 8. ⏳ Interactive init mode 9. ⏳ `format` command 10. ⏳ Auto-fix suggestions in validation errors

---

## 💬 Quotes from Usage

> "The validation output is _fantastic_ - clear, visual, actionable."

> "Going from idea to validated skill in ~5 minutes is the biggest win."

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

### Ideal Workflow (After Improvements)

```bash
# Ideal workflow with improvements
$ npx claude-skills init --name auth-patterns --minimal \
    --description "Better-auth integration"
✅ Skill created at: .claude/skills/auth-patterns
   - No cleanup needed

$ vim .claude/skills/auth-patterns/SKILL.md

$ npx claude-skills validate .claude/skills/auth-patterns
✅ Skill is valid! All checks passed.

$ npx claude-skills stats
📊 3 skills, all valid
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

### 2. Delete Empty Directories Immediately

Right after `init`:

```bash
npx claude-skills init --name my-skill && \
  rm -rf .claude/skills/my-skill/assets && \
  rm -rf .claude/skills/my-skill/scripts
```

### 3. Ignore Comma Warnings for Technical Lists

If your description has technical terms separated by commas, that's fine:

```yaml
description: SQLite queries for contacts, companies, interactions, social_links
```

The warning is just a reminder, not an error.

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
