---
"claude-skills-cli": patch
---

Align validation with official Claude Code documentation

- Add missing frontmatter fields to SkillMetadata (disable-model-invocation, user-invocable, argument-hint, model, context, agent, hooks, compatibility)
- Tighten name validation: reject leading/trailing hyphens, consecutive hyphens, reserved prefixes (claude/anthropic), XML angle brackets
- Add XML angle bracket check for descriptions (security)
- Expand file reference validation to include root-level .md files
- Add restart warning after hook installation
- Add disableAllHooks detection when adding hooks
- Add deprecation notice to package command (ZIP not official distribution)
- Point install command to official /plugin install mechanism
