# TypeScript Conversion Prompt

Use this prompt in a new chat to convert the Python scripts to TypeScript.

---

## Prompt

I have a Claude Skills infrastructure with Python scripts that I want to convert to TypeScript/Node.js. The goal is to make it integrate naturally with Node.js/TypeScript projects while maintaining the exact same functionality and CLI interfaces.

### What exists now (Python):

1. **init_skill.py** - Creates new skill directory structure with templates
2. **validate_skill.py** - Validates SKILL.md format, YAML frontmatter, and structure
3. **package_skill.py** - Creates distributable zip files with validation

### Requirements for TypeScript version:

**Must preserve:**
- ✅ Same CLI argument interfaces (--name, --description, --path, --output, etc.)
- ✅ Same output format (emoji status indicators: ✅ ❌ ⚠️)
- ✅ Same validation rules (YAML parsing, name format, description length)
- ✅ Same directory structure creation
- ✅ Same exit codes (0 = success, 1 = error)

**Must use:**
- TypeScript with proper types
- Node.js fs/path modules for file operations
- Commander.js or similar for CLI parsing
- js-yaml for YAML parsing
- archiver for zip creation
- Executable with shebang: `#!/usr/bin/env node`

**File locations:**
```
.claude/
├── scripts/
│   ├── init-skill.ts      (or .js if compiled)
│   ├── validate-skill.ts
│   └── package-skill.ts
└── package.json           (if needed for dependencies)
```

**Key behaviors to preserve:**

1. **init_skill.py**:
   - Creates skill directory at specified path
   - Generates SKILL.md with YAML frontmatter template
   - Creates example files in references/, scripts/, assets/
   - Makes script files executable
   - Outputs helpful next steps

2. **validate_skill.py**:
   - Checks SKILL.md exists
   - Validates YAML frontmatter (name, description required)
   - Checks name format (lowercase, kebab-case, max 64 chars)
   - Checks description length (max 1024 chars)
   - Warns about unused directories
   - Warns about unmentioned references
   - Checks scripts are executable
   - Color-coded output with emoji
   - --strict flag treats warnings as errors

3. **package_skill.py**:
   - Runs validation first (unless --skip-validation)
   - Creates zip with skill directory structure
   - Excludes hidden files and temp files
   - Reports file size in KB
   - Outputs success message with upload instructions

### Current Python code available at:
- `.claude/scripts/init_skill.py`
- `.claude/scripts/validate_skill.py`
- `.claude/scripts/package_skill.py`

### Templates to include:
- `.claude/templates/SKILL-TEMPLATE.md`
- `.claude/templates/skill-structure/` (example structure)

Please convert these three Python scripts to TypeScript/Node.js while maintaining all functionality and improving type safety. Make them executable and provide a package.json if dependencies are needed.

---

## Additional Context

The skills system uses:
- YAML frontmatter in SKILL.md (name, description, optional license/metadata)
- Progressive disclosure (metadata → instructions → resources)
- Three-level loading (SKILL.md → references/ → scripts/)
- Standard directory structure (references/, scripts/, assets/)

See `.claude/docs/SKILLS-ARCHITECTURE.md` for complete system overview.

---

## Expected Deliverables

1. `init-skill.ts` (or compiled .js) - Skill initialization
2. `validate-skill.ts` - Skill validation
3. `package-skill.ts` - Skill packaging
4. `package.json` - Dependencies and scripts
5. `tsconfig.json` - TypeScript configuration (if using .ts files)
6. Updated `.claude/README.md` - Reflecting TypeScript usage

All scripts should:
- Be executable (`chmod +x`)
- Have proper shebang
- Support --help
- Match current output format
- Preserve all validation rules
