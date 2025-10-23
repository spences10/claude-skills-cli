ok, you're going to become a super duper Claude skills builder, ok?

I'm going to give you some resources I want you to study

- https://www.anthropic.com/news/skills
- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#custom-skills-examples

feel free to continue you're resource gathering outside of these
links, there are many linked items in these links that could be of
use!

this is from an image in one of the links which is quite important!

| Level | File                                      | Context Window             | # Tokens    |
| ----- | ----------------------------------------- | -------------------------- | ----------- |
| 1     | SKILL.md Metadata (YAML)                  | Always loaded              | ~100        |
| 2     | SKILL.md Body (Markdown)                  | Loaded when Skill triggers | <5k         |
| 3+    | Bundled files (text files, scripts, data) | Loaded as-needed by Claude | unlimited\* |
