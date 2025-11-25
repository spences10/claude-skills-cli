# claude-skills-cli

CLI for creating Claude Agent Skills with progressive disclosure
validation. Built for Claude Code to use when humans ask it to create
skills.

## For Humans Using Claude Code

Tell Claude Code to create skills with specific package manager
commands.

Using npm:

```
"Use npx -y claude-skills-cli to create a skill for my API client code"
```

Using pnpm:

```
"Use pnpx claude-skills-cli to create a skill for my API client code"
```

This CLI enforces progressive disclosure so Claude doesn't write
500-line documentation files.

## Progressive Disclosure

Skills load in 3 levels to optimize token usage:

| Level | Content                        | When Loaded         | Size Limit |
| ----- | ------------------------------ | ------------------- | ---------- |
| **1** | SKILL.md metadata (YAML)       | Always in context   | <200 chars |
| **2** | SKILL.md body (Markdown)       | When skill triggers | ~50 lines  |
| **3** | references/, scripts/, assets/ | As needed by Claude | Unlimited  |

This CLI enforces these constraints through validation, keeping skills
lean and scannable.

## Commands

### init

```bash
pnpx claude-skills-cli init --name my-skill --description "Brief description with trigger keywords"
pnpx claude-skills-cli init --name my-skill --description "..." --with-examples
```

Creates minimal skill scaffolding by default (SKILL.md, references/).
Use `--with-examples` for example files.

### validate

```bash
pnpx claude-skills-cli validate .claude/skills/my-skill
pnpx claude-skills-cli validate .claude/skills/my-skill --lenient
pnpx claude-skills-cli validate .claude/skills/my-skill --loose
pnpx claude-skills-cli validate .claude/skills/my-skill --strict
pnpx claude-skills-cli validate .claude/skills/my-skill --format json
```

**Validation Modes:**

| Mode        | Max Lines | Use Case                  |
| ----------- | --------- | ------------------------- |
| (default)   | 50        | Strict best practices     |
| `--lenient` | 150       | More flexibility          |
| `--loose`   | 500       | Anthropic official limits |

Comprehensive validation including:

**Structure & Format:**

- Name format (kebab-case) and directory matching
- YAML frontmatter validity
- Required fields presence

**Level 1 (Metadata):**

- Description length (<200 chars optimal, ~30 tokens)
- Trigger phrase presence and specificity
- User phrasing (third-person, action-oriented, gerunds)
- Keyword richness and alignment with content

**Level 2 (SKILL.md Body):**

- Line count (50 max default, use `--lenient` for 150, `--loose`
  for 500)
- Word count (<1000 max default)
- Token estimates (<6500 budget)
- Code blocks (1-2 optimal)
- Sections (3-5 recommended)

**Level 3 (References):**

- Referenced files exist (no broken links)
- Orphaned files detection
- Nesting depth analysis
- Progressive disclosure structure

Use `--strict` to fail on warnings, `--lenient`/`--loose` for relaxed
limits, `--format json` for programmatic use.

### doctor

```bash
pnpx claude-skills-cli doctor .claude/skills/my-skill
```

Automatically fixes common skill issues:

- **Multi-line descriptions**: Adds `# prettier-ignore` and reflows
  description to single line
- Ensures Claude Code can recognize the skill

Run after formatting or if validation warns about multi-line
descriptions.

### stats

```bash
pnpx claude-skills-cli stats .claude/skills
```

Shows overview of all skills with validation status, sizes, and
quality ratings.

### package

```bash
pnpx claude-skills-cli package .claude/skills/my-skill
```

Creates uploadable zip for Claude.ai. Validates first unless
`--skip-validation` specified.

### add-hook

```bash
# Default: forced-eval hook (84% success), global scope
pnpx claude-skills-cli add-hook

# Specify hook type and scope
pnpx claude-skills-cli add-hook --type llm-eval          # LLM eval, global
pnpx claude-skills-cli add-hook --type forced-eval --project   # Forced eval, project
pnpx claude-skills-cli add-hook --type simple-script --local   # Simple script, local
```

Adds skill activation hook to improve reliability. Generates hook
scripts in `.claude/hooks/` and updates settings.json.

**Hook Types (--type):**

| Type            | Success Rate | Description                 | Notes                        |
| --------------- | ------------ | --------------------------- | ---------------------------- |
| `forced-eval`   | **84%**      | Mandatory 3-step evaluation | Default, most consistent     |
| `llm-eval`      | **80%**      | Claude API pre-evaluation   | Requires `ANTHROPIC_API_KEY` |
| `simple-script` | 20%          | Basic script file           | For reference/debugging      |
| `simple-inline` | 20%          | Echo in settings.json       | Legacy, backwards compatible |

**Scopes:**

- **Global** (default): `~/.claude/settings.json` - All projects
- **Project** (`--project`): `./.claude/settings.json` - Committed,
  team-shared
- **Local** (`--local`): `./.claude/settings.local.json` - Gitignored,
  personal

## Skill Activation in Claude Code

Skills are designed to auto-activate in Claude Code, but in practice,
**[activation is unreliable without explicit hooks](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)**.
Despite documentation claiming skills are "model-invoked," Claude
often bypasses skills unless directly instructed.

### The Solution: Activation Hooks

Use the `add-hook` command to add skill activation instructions:

```bash
# Recommended: forced-eval hook (84% success)
pnpx claude-skills-cli add-hook
```

After extensive testing (200+ prompts), two approaches emerged as
significantly better than basic instructions:

**Forced Eval Hook (84% success)** - Creates a mandatory 3-step
process:

1. Explicitly evaluate each skill (YES/NO with reasoning)
2. Activate matching skills using `Skill()` tool
3. Only then proceed with implementation

**LLM Eval Hook (80% success)** - Pre-evaluates skills via Claude API:

- Costs ~$0.0004 per prompt (0.04 cents)
- 10% cheaper and 17% faster than forced eval
- Can miss certain prompt types but "smarter" when it works
- Requires `ANTHROPIC_API_KEY` environment variable

Both approaches are **massively better** than simple instructions (20%
success rate).

**Why explicit commitment matters:**

Simple hooks like "If the prompt matches any skill keywords, use
Skill(skill-name)" are passive suggestions that Claude often ignores.
The forced-eval hook creates a commitment mechanism - Claude must
write out its evaluation before proceeding, making it harder to skip
activation.

**Read more:**

- [How to Make Claude Code Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably) -
  Full testing methodology and results
- [Why Claude Code Skills Don't Auto-Activate](https://scottspence.com/posts/claude-code-skills-dont-auto-activate) -
  Original problem analysis

## Resources

**Included docs:**

- [docs/SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) -
  Progressive disclosure system
- [docs/SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - Skill
  creation workflow
- [docs/SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real-world
  examples
- [.claude/skills/skill-creator/](.claude/skills/skill-creator/) -
  Skill for creating skills (validated example)

**Official Anthropic docs:**

- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Repository](https://github.com/anthropics/skills)
