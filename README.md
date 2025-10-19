# claude-skills-cli

TypeScript CLI toolkit for creating, validating, and packaging Claude skills.

**Status:** 🚧 In Development - See implementation plan below

---

## What This Is

A portable command-line tool for managing Claude Agent Skills, inspired by tools like `create-next-app` and `create-vite`. Install once, use anywhere:

```bash
pnpx claude-skills-cli init --name my-skill --description "..."
pnpx claude-skills-cli validate .claude/skills/my-skill
pnpx claude-skills-cli package .claude/skills/my-skill
```

This replaces the Python scripts that were previously in project `.claude/scripts/` directories.

---

## Repository Structure (Planned)

Following the **mcpick** pattern:

```
claude-skills-cli/
├── package.json                     # CLI package config
├── tsconfig.json                    # TypeScript ES modules config
├── README.md                        # This file
├── .gitignore                       # Ignore node_modules, dist, etc.
├── .prettierrc                      # Code formatting
├── .changeset/                      # Version management
│   ├── README.md
│   └── config.json
├── src/
│   ├── index.ts                     # CLI entry (#!/usr/bin/env node)
│   ├── types.ts                     # TypeScript type definitions
│   ├── commands/
│   │   ├── init.ts                  # Create new skill structure
│   │   ├── validate.ts              # Validate skill format
│   │   └── package.ts               # Package skill to zip
│   ├── core/
│   │   ├── templates.ts             # SKILL.md templates as strings
│   │   └── validator.ts             # Validation logic (class-based)
│   └── utils/
│       ├── fs.ts                    # File system helpers
│       └── output.ts                # Emoji/formatting (chalk)
├── templates/                       # Copied from devhub-crm
│   ├── SKILL-TEMPLATE.md
│   └── skill-structure/
│       ├── README.md
│       ├── references/
│       ├── scripts/
│       └── assets/
├── docs/                            # Copied from devhub-crm
│   ├── SKILLS-ARCHITECTURE.md
│   ├── SKILL-DEVELOPMENT.md
│   └── SKILL-EXAMPLES.md
└── skills/                          # Portable example skills
    └── skill-creator/               # Meta-skill from devhub-crm
        ├── SKILL.md
        └── references/
```

---

## Files to Move from devhub-crm

The `.claude/` directory was copied wholesale, but needs reorganization:

### ✅ Keep and Move to Root:

```
devhub-crm/.claude/docs/             → claude-skills-cli/docs/
devhub-crm/.claude/templates/        → claude-skills-cli/templates/
devhub-crm/.claude/skills/skill-creator/  → claude-skills-cli/skills/skill-creator/
```

### ✅ Convert to TypeScript:

```
devhub-crm/.claude/scripts/init_skill.py      → src/commands/init.ts
devhub-crm/.claude/scripts/validate_skill.py  → src/commands/validate.ts
devhub-crm/.claude/scripts/package_skill.py   → src/commands/package.ts
```

### ❌ Delete (Not Needed):

```
devhub-crm/.claude/settings.local.json        # Project-specific
devhub-crm/.claude/skills/database-patterns/  # Project-specific
devhub-crm/.claude/TYPESCRIPT-CONVERSION-PROMPT.md  # Completed
```

---

## package.json Configuration

```json
{
  "name": "claude-skills-cli",
  "version": "0.0.1",
  "description": "CLI toolkit for creating and managing Claude Agent Skills",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "claude-skills-cli": "./dist/index.js"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node ./dist/index.js",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm run build && changeset publish"
  },
  "keywords": ["claude", "skills", "cli", "agent", "anthropic", "claude-code"],
  "author": "Scott Spence",
  "license": "MIT",
  "dependencies": {
    "@clack/prompts": "^0.11.0",
    "chalk": "^5.3.0",
    "archiver": "^7.0.0"
  },
  "devDependencies": {
    "@changesets/cli": "^2.29.7",
    "@types/node": "^24.7.0",
    "@types/archiver": "^6.0.0",
    "prettier": "^3.6.2",
    "typescript": "^5.9.3"
  }
}
```

---

## tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "outDir": "./dist",
    "sourceMap": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Dependencies Explained

### Runtime Dependencies:

- **@clack/prompts** - Interactive CLI prompts (like mcpick uses)
- **chalk** - Terminal string styling and colors
- **archiver** - Create zip files (replaces Python's zipfile)

### Dev Dependencies:

- **@changesets/cli** - Version management and changelog
- **@types/node** - TypeScript types for Node.js
- **@types/archiver** - TypeScript types for archiver
- **prettier** - Code formatting
- **typescript** - TypeScript compiler

---

## CLI Interface (Must Match Python Version)

### Command: init

```bash
claude-skills init --name my-skill --description "What it does and when to use it"
claude-skills init --path /custom/path/my-skill
```

**Creates:**

- SKILL.md with YAML frontmatter
- README.md
- references/detailed-guide.md
- scripts/example.py (executable)
- assets/ directory

**Output:**

```
✅ Skill created at: .claude/skills/my-skill

Next steps:
1. Edit .claude/skills/my-skill/SKILL.md with your skill instructions
2. Add detailed documentation to references/
3. Add executable scripts to scripts/
4. Remove example files you don't need

Validate with: claude-skills validate .claude/skills/my-skill
```

### Command: validate

```bash
claude-skills validate .claude/skills/my-skill
claude-skills validate .claude/skills/my-skill --strict
```

**Checks:**

- SKILL.md exists
- YAML frontmatter format
- Required fields (name, description)
- Name format (kebab-case, max 64 chars)
- Description length (max 1024 chars)
- References mentioned in SKILL.md
- Scripts are executable
- No TODO placeholders

**Output:**

```
📋 Validating skill: my-skill
============================================================

⚠️  Warnings:
  ⚠️  Reference file 'schema.md' not mentioned in SKILL.md

✅ Skill is valid (with warnings)
```

**Exit codes:**

- 0 = success
- 1 = validation failed
- 1 with --strict = warnings treated as errors

### Command: package

```bash
claude-skills package .claude/skills/my-skill
claude-skills package .claude/skills/my-skill --output dist/
claude-skills package .claude/skills/my-skill --skip-validation
```

**Creates:**

- Zip file with skill contents
- Excludes hidden files, .pyc, **pycache**, etc.
- Runs validation first (unless --skip-validation)

**Output:**

```
🔍 Validating skill...
✅ Skill is valid!

📦 Packaging skill: my-skill
  + my-skill/SKILL.md
  + my-skill/README.md
  + my-skill/references/detailed-guide.md

✅ Skill packaged successfully!
   File: dist/my-skill.zip
   Size: 12.3 KB

📤 Upload to Claude.ai: Settings > Features > Skills > Upload
```

---

## Implementation Roadmap

### Phase 1: Setup (You're here!)

- [x] Create claude-skills-cli repo
- [x] Copy .claude/ from devhub-crm
- [ ] Create package.json
- [ ] Create tsconfig.json
- [ ] Setup .gitignore, .prettierrc
- [ ] Install dependencies: `pnpm install`

### Phase 2: Reorganize Files

- [ ] Move `docs/` to root
- [ ] Move `templates/` to root
- [ ] Move `skills/skill-creator/` to root
- [ ] Delete `.claude/settings.local.json`
- [ ] Delete `.claude/skills/database-patterns/`

### Phase 3: Convert Python → TypeScript

#### init.ts (from init_skill.py)

- [ ] Import types, fs, path, chalk
- [ ] Create template strings (SKILL.md, README.md, etc.)
- [ ] Implement createSkill() function
  - Use fs.mkdirSync(path, { recursive: true })
  - Use fs.writeFileSync()
  - Use fs.chmodSync(scriptPath, 0o755) for executable
- [ ] Use @clack/prompts for interactive mode (optional)
- [ ] Match Python output format exactly (emoji, messages)

#### validate.ts (from validate_skill.py)

- [ ] Create SkillValidator class
  - errors: string[]
  - warnings: string[]
- [ ] Implement validation methods:
  - validateDirectory()
  - validateSkillMd() - parse YAML frontmatter
  - validateReferences()
  - validateScripts() - check executable with fs.statSync()
  - validateAssets()
- [ ] Use chalk for colored output
- [ ] Match Python emoji output exactly
- [ ] Support --strict flag

#### package.ts (from package_skill.py)

- [ ] Import archiver for zip creation
- [ ] Call validate.ts first (child_process.spawnSync)
- [ ] Create zip with exclusions:
  - Hidden files (starts with .)
  - .pyc, .pyo, .swp, ~
  - **pycache**, .DS_Store
- [ ] Report file size in KB
- [ ] Match Python output format

### Phase 4: CLI Entry Point

#### index.ts

- [ ] Add shebang: `#!/usr/bin/env node`
- [ ] Import @clack/prompts
- [ ] Import commands (init, validate, package)
- [ ] Create interactive menu (like mcpick)
  - "Create new skill"
  - "Validate skill"
  - "Package skill"
  - "Exit"
- [ ] Handle command-line arguments (for non-interactive)
- [ ] Error handling with try/catch

### Phase 5: Testing

- [ ] Build: `pnpm build`
- [ ] Test init: `node dist/index.js init --name test-skill`
- [ ] Test validate: `node dist/index.js validate skills/skill-creator`
- [ ] Test package: `node dist/index.js package skills/skill-creator`
- [ ] Verify output matches Python version

### Phase 6: Publishing

- [ ] Setup .changeset config
- [ ] Add initial changeset
- [ ] Test with `pnpx` locally
- [ ] Publish to npm: `pnpm release`
- [ ] Update devhub-crm to use `pnpx claude-skills-cli`

---

## Design Decisions

### Why @clack/prompts instead of commander?

- mcpick uses @clack/prompts for beautiful interactive menus
- Provides better UX than raw commander arguments
- Still support non-interactive mode with args

### Why archiver instead of node:zlib?

- archiver is battle-tested for creating zips
- Handles file permissions, directory structure
- Direct replacement for Python's zipfile

### Why chalk for colors?

- Match Python's emoji output (✅ ❌ ⚠️)
- Better terminal color support
- Widely used, stable

### Why ES modules (type: "module")?

- Modern Node.js best practice
- Matches mcpick setup
- Better tree-shaking, cleaner imports

---

## Testing Checklist

Before publishing v1.0.0:

- [ ] All three commands work (init, validate, package)
- [ ] Output matches Python version exactly
- [ ] Exit codes match (0 = success, 1 = error)
- [ ] Emoji indicators work (✅ ❌ ⚠️)
- [ ] --strict mode works on validate
- [ ] --skip-validation works on package
- [ ] Created skills validate successfully
- [ ] Packaged zips can be uploaded to Claude.ai
- [ ] Works via `pnpx claude-skills-cli`
- [ ] Works when installed globally

---

## Resources

### Official Anthropic Documentation:

- [Agent Skills Overview](https://www.anthropic.com/news/skills)
- [Engineering Blog: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Docs: Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Anthropic Skills Repo](https://github.com/anthropics/skills)

### Included Documentation:

- [docs/SKILLS-ARCHITECTURE.md](docs/SKILLS-ARCHITECTURE.md) - Progressive disclosure system
- [docs/SKILL-DEVELOPMENT.md](docs/SKILL-DEVELOPMENT.md) - 6-step creation workflow
- [docs/SKILL-EXAMPLES.md](docs/SKILL-EXAMPLES.md) - Real-world examples

### Reference Implementation:

- [mcpick](https://github.com/spences10/mcpick) - Similar CLI structure to follow

---

## Notes for Next Chat Session

1. **Start with setup:** Create package.json and tsconfig.json first
2. **Install deps:** `pnpm install` to get @clack/prompts, chalk, archiver
3. **Reorganize files:** Move docs/, templates/, skills/ from .claude/ to root
4. **Convert Python scripts one by one:** Start with init.ts (simplest), then validate.ts, then package.ts
5. **Create index.ts:** Wire up commands with @clack/prompts menu
6. **Test everything:** Build and run against skill-creator to verify

**Key principle:** Match Python output and behavior EXACTLY. Users should not notice any difference except it's faster and more portable.

---

**Ready to build!** 🚀
