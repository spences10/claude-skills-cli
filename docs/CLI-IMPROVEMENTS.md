# claude-skills-cli: Enhancement Recommendations

Actionable improvements based on ecosystem analysis, prioritized by
impact and feasibility.

## Overview

Current CLI commands:

- `init` - Create skill scaffolding
- `validate` - Check progressive disclosure compliance
- `stats` - Overview of all skills
- `package` - Create uploadable zip

**Gaps identified**:

1. No behavioral testing capability
2. No skill discovery/installation
3. No hook management
4. Limited quality metrics
5. No community integration

## Priority 0: Critical Enhancements

### 1. Add `test` Command - Behavioral Validation

**Problem**: Validation only checks structure, not effectiveness.

**Solution**: Subagent-based behavioral testing.

#### Implementation

```typescript
// src/commands/test.ts
export async function testSkill(skillPath: string, options: TestOptions): Promise<TestResult> {
  // 1. Load test scenarios
  const scenarios = loadTestScenarios(skillPath);

  // 2. For each scenario:
  //    - Launch subagent with skill
  //    - Provide scenario input
  //    - Observe behavior
  //    - Compare to expected

  // 3. Generate report
  return {
    passed: 5,
    failed: 2,
    scenarios: [...],
    coverage: 0.71
  };
}
```

#### CLI Usage

```bash
# Test with default scenarios
pnpx claude-skills-cli test .claude/skills/my-skill

# Test with custom scenarios
pnpx claude-skills-cli test .claude/skills/my-skill --scenarios tests.json

# Test all skills
pnpx claude-skills-cli test .claude/skills --all

# Generate test scenarios from skill description
pnpx claude-skills-cli test .claude/skills/my-skill --generate-scenarios
```

#### Test Scenario Format

```json
{
	"name": "my-skill-tests",
	"version": "1.0.0",
	"scenarios": [
		{
			"id": "happy-path-1",
			"name": "Creates new feature with tests",
			"skill": "feature-implementer",
			"input": "Add a user profile component",
			"context": {
				"files": ["src/App.tsx", "src/types.ts"],
				"framework": "React"
			},
			"expected": {
				"files_created": [
					"src/components/UserProfile.tsx",
					"src/components/UserProfile.test.tsx"
				],
				"behavior_keywords": [
					"creates component",
					"adds tests",
					"updates imports"
				],
				"not_behavior_keywords": [
					"deletes files",
					"modifies unrelated"
				]
			},
			"pressure": ["time constraint", "unclear requirements"],
			"timeout_seconds": 120
		}
	]
}
```

#### Value Proposition

- **Validates effectiveness**, not just structure
- **Catches regressions** when updating skills
- **Documents expected behavior** via tests
- **Builds confidence** in skill quality

#### Effort Estimate

- Implementation: 2-3 days
- Testing: 1 day
- Documentation: 0.5 days
- **Total: ~4 days**

### 2. Add `search` and `install` Commands - Discovery

**Problem**: No way to discover or install community skills.

**Solution**: Skills registry with search/install commands.

#### Registry Format

```json
{
	"name": "claude-skills-registry",
	"version": "1.0.0",
	"skills": [
		{
			"name": "test-runner",
			"description": "Smart test execution based on changes...",
			"author": "community",
			"version": "1.2.0",
			"source": "https://github.com/user/repo/tree/main/.claude/skills/test-runner",
			"tags": ["testing", "automation", "qa"],
			"languages": ["javascript", "python", "rust"],
			"quality_score": 0.92,
			"downloads": 1523,
			"updated": "2025-10-15"
		}
	]
}
```

#### CLI Usage

```bash
# Search for skills
pnpx claude-skills-cli search testing
pnpx claude-skills-cli search --tag security
pnpx claude-skills-cli search --language python

# Show skill details
pnpx claude-skills-cli info test-runner

# Install skill
pnpx claude-skills-cli install test-runner
pnpx claude-skills-cli install test-runner --global  # ~/.claude/skills
pnpx claude-skills-cli install https://github.com/user/repo/tree/main/.claude/skills/custom-skill

# List installed skills
pnpx claude-skills-cli list
pnpx claude-skills-cli list --global

# Update skills
pnpx claude-skills-cli update test-runner
pnpx claude-skills-cli update --all
```

#### Implementation

```typescript
// src/commands/search.ts
export async function searchSkills(
	query: string,
	options: SearchOptions,
): Promise<Skill[]> {
	// 1. Fetch registry from GitHub/CDN
	const registry = await fetchRegistry();

	// 2. Filter by query, tags, language
	const results = registry.skills.filter(
		(skill) =>
			skill.name.includes(query) ||
			skill.description.includes(query) ||
			skill.tags.some((tag) => tag.includes(query)),
	);

	// 3. Sort by relevance and quality score
	return results.sort((a, b) => b.quality_score - a.quality_score);
}

// src/commands/install.ts
export async function installSkill(
	skillName: string,
	options: InstallOptions,
): Promise<void> {
	// 1. Find skill in registry
	const skill = await findSkill(skillName);

	// 2. Download skill files
	const files = await downloadSkill(skill.source);

	// 3. Validate before installing
	const validation = await validateSkill(files);
	if (!validation.valid) {
		throw new Error(`Skill validation failed: ${validation.errors}`);
	}

	// 4. Install to ~/.claude/skills or .claude/skills
	const targetPath = options.global
		? '~/.claude/skills'
		: '.claude/skills';
	await copyFiles(files, `${targetPath}/${skill.name}`);

	// 5. Report success
	console.log(
		`✅ Installed ${skill.name} to ${targetPath}/${skill.name}`,
	);
}
```

#### Registry Hosting

**Phase 1**: Static JSON on GitHub

- `https://raw.githubusercontent.com/spences10/claude-skills-registry/main/registry.json`
- Updated via PRs to registry repo
- Free, simple, version controlled

**Phase 2**: Dynamic API

- Search with full-text indexing
- Analytics (downloads, ratings)
- Automated quality scoring
- Community curation

#### Value Proposition

- **Solves discovery problem** - Users can find relevant skills
- **One-click installation** - Lower barrier to adoption
- **Quality signals** - Scores help users choose
- **Community growth** - Makes skill sharing easy

#### Effort Estimate

- Implementation: 3-4 days
- Registry setup: 1 day
- Testing: 1 day
- Documentation: 0.5 days
- **Total: ~6 days**

### 3. Enhanced `validate` Command - Quality Scoring

**Problem**: Validation is pass/fail, no quality guidance.

**Solution**: Add quality scoring with actionable feedback.

#### Quality Dimensions

```typescript
interface QualityScore {
	overall: number; // 0-1
	dimensions: {
		structure: number; // Frontmatter, sections, organization
		clarity: number; // Description, examples, documentation
		completeness: number; // References, scripts, tests
		maintainability: number; // Freshness, versioning, changelog
		effectiveness: number; // Test results, usage metrics
	};
	feedback: Feedback[];
}

interface Feedback {
	type: 'error' | 'warning' | 'suggestion';
	dimension: string;
	message: string;
	action?: string; // What to do to fix it
}
```

#### Implementation

```typescript
// src/validation/quality-scorer.ts
export function scoreQuality(skill: Skill): QualityScore {
	const scores = {
		structure: scoreStructure(skill),
		clarity: scoreClarity(skill),
		completeness: scoreCompleteness(skill),
		maintainability: scoreMaintainability(skill),
		effectiveness: scoreEffectiveness(skill),
	};

	const overall = Object.values(scores).reduce((a, b) => a + b) / 5;

	return {
		overall,
		dimensions: scores,
		feedback: generateFeedback(skill, scores),
	};
}

function scoreClarity(skill: Skill): number {
	let score = 1.0;

	// Description quality
	if (skill.description.length < 50) score -= 0.2;
	if (!hasTriggerWords(skill.description)) score -= 0.2;
	if (hasGenericPhrases(skill.description)) score -= 0.1;

	// Example quality
	if (skill.examples.length === 0) score -= 0.2;
	if (hasConcreteExamples(skill.examples)) score += 0.1;

	// Documentation quality
	if (skill.body.includes('TODO')) score -= 0.2;
	if (hasVagueInstructions(skill.body)) score -= 0.1;

	return Math.max(0, score);
}
```

#### CLI Usage

```bash
# Validate with quality score
pnpx claude-skills-cli validate .claude/skills/my-skill --score

# Output:
# ✅ Valid skill structure
#
# Quality Score: 0.78 / 1.00 (Good)
#
# Dimensions:
#   Structure:       0.95  ✅ Excellent
#   Clarity:         0.72  ⚠️  Could improve
#   Completeness:    0.65  ⚠️  Could improve
#   Maintainability: 0.90  ✅ Excellent
#   Effectiveness:   0.68  ⚠️  Could improve
#
# Feedback:
#   ⚠️  Clarity: Description lacks trigger keywords
#       Action: Add keywords like "testing", "coverage", "qa"
#
#   ⚠️  Completeness: No reference documentation
#       Action: Move detailed examples to references/ directory
#
#   💡 Suggestion: Add test scenarios to validate effectiveness
#       Action: Run `claude-skills-cli test --generate-scenarios`
```

#### Value Proposition

- **Actionable feedback** - Not just "bad", but "how to improve"
- **Continuous improvement** - Track score over time
- **Competitive benchmark** - Compare to high-quality skills
- **Learning tool** - Teaches skill development best practices

#### Effort Estimate

- Implementation: 2 days
- Scoring algorithms: 1 day
- Testing: 1 day
- Documentation: 0.5 days
- **Total: ~4.5 days**

## Priority 1: Important Enhancements

### 4. Add `hook` Command - Hook Management

**Problem**: Hook integration is underutilized, lacks templates.

**Solution**: Hook management with common templates.

#### CLI Usage

```bash
# List available hook templates
pnpx claude-skills-cli hook list-templates

# Add hook from template
pnpx claude-skills-cli hook add --template pre-commit-validation
pnpx claude-skills-cli hook add --template post-edit-skill-validation
pnpx claude-skills-cli hook add --template resource-tracking

# Add custom hook
pnpx claude-skills-cli hook add --tool Edit --script ./my-hook.sh

# List installed hooks
pnpx claude-skills-cli hook list

# Remove hook
pnpx claude-skills-cli hook remove --tool Edit --script ./my-hook.sh

# Test hook
pnpx claude-skills-cli hook test pre-commit-validation --tool Bash --args "git commit -m 'test'"
```

#### Hook Templates

```typescript
// src/hooks/templates.ts
export const HOOK_TEMPLATES = {
	'pre-commit-validation': {
		name: 'Pre-commit Validation',
		description: 'Validates code before commits',
		tool: 'Bash',
		pattern: 'git commit*',
		script: `#!/bin/bash
set -euo pipefail

# Run linter
npm run lint || exit 1

# Run tests
npm test || exit 1

echo "✅ Pre-commit checks passed"
exit 0
`,
	},

	'post-edit-skill-validation': {
		name: 'Post-Edit Skill Validation',
		description: 'Validates skills after editing SKILL.md files',
		tool: 'Edit',
		pattern: '*/SKILL.md',
		script: `#!/bin/bash
set -euo pipefail

SKILL_DIR=$(dirname "$CLAUDE_FILE_PATH")

# Validate skill structure
pnpx claude-skills-cli validate "$SKILL_DIR" --quiet || {
  echo "❌ Skill validation failed. Please fix errors before proceeding."
  exit 1
}

exit 0
`,
	},

	'resource-tracking': {
		name: 'Resource Usage Tracking',
		description: 'Tracks token usage and performance',
		tool: '*',
		script: `#!/usr/bin/env python3
import json
import time
from pathlib import Path

log_file = Path.home() / '.claude' / 'usage.jsonl'

entry = {
    'timestamp': time.time(),
    'tool': os.environ.get('CLAUDE_TOOL'),
    'file_paths': os.environ.get('CLAUDE_FILE_PATHS', '').split(',')
}

with open(log_file, 'a') as f:
    f.write(json.dumps(entry) + '\\n')

exit 0
`,
	},
};
```

#### Implementation

```typescript
// src/commands/hook.ts
export async function addHook(
	options: AddHookOptions,
): Promise<void> {
	// 1. Load or create .claude/settings.json
	const settings = await loadSettings();

	// 2. Get hook script (from template or custom)
	const hookScript = options.template
		? HOOK_TEMPLATES[options.template].script
		: fs.readFileSync(options.script, 'utf-8');

	// 3. Write hook script to .claude/hooks/
	const hookPath = `.claude/hooks/${options.name}.sh`;
	await fs.writeFile(hookPath, hookScript, { mode: 0o755 });

	// 4. Update settings.json
	if (!settings.PreToolUse) settings.PreToolUse = {};
	settings.PreToolUse[options.tool] = `bash ${hookPath}`;

	await saveSettings(settings);

	console.log(`✅ Added hook: ${options.name}`);
}
```

#### Value Proposition

- **Lowers barrier** - Templates make hooks accessible
- **Best practices** - Templates encode proven patterns
- **Automation** - Enables powerful workflows
- **Learning tool** - Shows what's possible with hooks

#### Effort Estimate

- Implementation: 2 days
- Templates: 1 day
- Testing: 0.5 days
- Documentation: 0.5 days
- **Total: ~4 days**

### 5. Enhanced `stats` Command - Rich Analytics

**Problem**: Current stats are basic, no insights.

**Solution**: Add quality metrics, trends, comparisons.

#### CLI Usage

```bash
# Basic stats (current behavior)
pnpx claude-skills-cli stats .claude/skills

# Enhanced stats with quality scores
pnpx claude-skills-cli stats .claude/skills --detailed

# Compare against benchmarks
pnpx claude-skills-cli stats .claude/skills --benchmark

# Show trends over time
pnpx claude-skills-cli stats .claude/skills --history

# Export to JSON for analysis
pnpx claude-skills-cli stats .claude/skills --json > stats.json
```

#### Enhanced Output

```
📊 Skills Statistics

Overview:
  Total skills: 12
  Average quality: 0.78 (Good)
  Total size: 156 KB
  Last updated: 2 days ago

Quality Distribution:
  Excellent (0.9+):  3 skills  ▓▓▓░░░░░░░
  Good (0.7-0.9):    6 skills  ▓▓▓▓▓▓░░░░
  Fair (0.5-0.7):    2 skills  ▓▓░░░░░░░░
  Poor (<0.5):       1 skill   ▓░░░░░░░░░

Top Skills by Quality:
  1. test-runner        0.94  ✅
  2. git-workflow       0.91  ✅
  3. doc-generator      0.88  ✅

Skills Needing Attention:
  1. old-skill          0.42  ❌ No tests, outdated
  2. experimental       0.58  ⚠️  Missing references

Recommendations:
  💡 Add test scenarios to 8 skills without tests
  💡 Update 3 skills not modified in 30+ days
  💡 Consider archiving 'old-skill' (low quality, unused)
```

#### Implementation

```typescript
// src/commands/stats.ts
export async function generateStats(
	skillsPath: string,
	options: StatsOptions,
): Promise<Stats> {
	const skills = await loadAllSkills(skillsPath);

	// Calculate quality scores for all skills
	const scores = await Promise.all(
		skills.map((skill) => scoreQuality(skill)),
	);

	// Analyze trends if history available
	const trends = options.history
		? await analyzeTrends(skillsPath)
		: null;

	// Compare against benchmarks
	const comparison = options.benchmark
		? compareAgainstBenchmarks(scores)
		: null;

	return {
		overview: generateOverview(skills, scores),
		distribution: generateDistribution(scores),
		topSkills: getTopSkills(skills, scores),
		needsAttention: getNeedsAttention(skills, scores),
		recommendations: generateRecommendations(skills, scores),
		trends,
		comparison,
	};
}
```

#### Value Proposition

- **Portfolio view** - Understand skill quality at a glance
- **Actionable insights** - Know what to improve
- **Trend tracking** - See quality evolution over time
- **Benchmark comparison** - Know how you compare to community

#### Effort Estimate

- Implementation: 1.5 days
- Visualization: 0.5 days
- Testing: 0.5 days
- Documentation: 0.5 days
- **Total: ~3 days**

### 6. Add `init` Templates - Framework-Specific Scaffolding

**Problem**: Generic init template, no framework-specific patterns.

**Solution**: Add templates for common skill types.

#### CLI Usage

```bash
# List available templates
pnpx claude-skills-cli init --list-templates

# Use template
pnpx claude-skills-cli init --name my-skill --template testing
pnpx claude-skills-cli init --name api-docs --template documentation
pnpx claude-skills-cli init --name react-patterns --template framework

# Interactive mode
pnpx claude-skills-cli init --interactive
```

#### Templates

```typescript
export const INIT_TEMPLATES = {
	basic: {
		name: 'Basic Skill',
		description: 'Minimal skill structure',
		includes: ['SKILL.md', 'README.md'],
	},

	testing: {
		name: 'Testing Skill',
		description: 'Skill for test-related workflows',
		includes: [
			'SKILL.md',
			'README.md',
			'references/',
			'scripts/',
			'tests/',
		],
		skillMdTemplate: `---
name: {{name}}
description: Smart test execution and analysis. Use when running tests, analyzing failures, or improving test coverage.
---

# {{name}}

Intelligent test runner that adapts to your testing framework.

## Quick Start

Run tests for changed files:
\`\`\`bash
python .claude/skills/{{name}}/scripts/run_tests.py --changed
\`\`\`

## Supported Frameworks

- Jest / Vitest (JavaScript/TypeScript)
- pytest (Python)
- cargo test (Rust)
- go test (Go)

## Core Patterns

1. **Smart test selection**: Runs only tests affected by changes
2. **Failure analysis**: Parses errors and suggests fixes
3. **Coverage tracking**: Identifies untested code paths

See [references/framework-detection.md](references/framework-detection.md) for details.
`,
	},

	documentation: {
		name: 'Documentation Skill',
		description: 'Skill for documentation workflows',
		includes: ['SKILL.md', 'README.md', 'references/', 'templates/'],
		skillMdTemplate: `---
name: {{name}}
description: Generate and maintain documentation. Use when creating docs, updating API references, or improving documentation quality.
---
...
`,
	},

	framework: {
		name: 'Framework Expertise Skill',
		description: 'Skill for framework-specific patterns',
		includes: ['SKILL.md', 'README.md', 'references/', 'examples/'],
		skillMdTemplate: `---
name: {{name}}
description: Expert knowledge of {{framework}} patterns, best practices, and conventions. Use when working with {{framework}} code.
---
...
`,
	},
};
```

#### Value Proposition

- **Faster starts** - Don't start from scratch
- **Best practices** - Templates encode proven patterns
- **Consistency** - Similar skills have similar structure
- **Learning** - Shows what good looks like

#### Effort Estimate

- Implementation: 1.5 days
- Template creation: 1 day
- Testing: 0.5 days
- Documentation: 0.5 days
- **Total: ~3.5 days**

## Priority 2: Nice-to-Have Enhancements

### 7. Add `publish` Command - Community Sharing

**Problem**: No easy way to share skills with community.

**Solution**: Publish skills to registry with one command.

#### CLI Usage

```bash
# Publish skill to registry
pnpx claude-skills-cli publish .claude/skills/my-skill

# Update published skill
pnpx claude-skills-cli publish .claude/skills/my-skill --update

# Unpublish skill
pnpx claude-skills-cli unpublish my-skill
```

**Effort**: 2-3 days

### 8. Add `doctor` Command - Health Check

**Problem**: Hard to diagnose skill issues.

**Solution**: Comprehensive health check command.

#### CLI Usage

```bash
# Check skill health
pnpx claude-skills-cli doctor .claude/skills/my-skill

# Check all skills
pnpx claude-skills-cli doctor .claude/skills --all

# Fix common issues
pnpx claude-skills-cli doctor .claude/skills/my-skill --fix
```

**Effort**: 2 days

### 9. Add `benchmark` Command - Performance Testing

**Problem**: No way to measure skill performance impact.

**Solution**: Benchmark token usage and execution time.

#### CLI Usage

```bash
# Benchmark skill
pnpx claude-skills-cli benchmark .claude/skills/my-skill

# Compare before/after changes
pnpx claude-skills-cli benchmark .claude/skills/my-skill --compare
```

**Effort**: 2-3 days

## Implementation Roadmap

### Version 0.1.0 (Current)

- ✅ init
- ✅ validate
- ✅ stats
- ✅ package

### Version 0.2.0 (Next Release - ~2-3 weeks)

**Priority 0 features**:

- `test` command with subagent harness
- `search` and `install` commands
- Enhanced `validate` with quality scoring

**Effort**: ~14 days **Impact**: Massive - enables behavioral
validation and discovery

### Version 0.3.0 (Future - ~1-2 months)

**Priority 1 features**:

- `hook` command with templates
- Enhanced `stats` with analytics
- `init` templates for common patterns

**Effort**: ~10 days **Impact**: High - improves usability and
automation

### Version 0.4.0 (Future - ~2-3 months)

**Priority 2 features**:

- `publish` command
- `doctor` command
- `benchmark` command

**Effort**: ~7 days **Impact**: Medium - enables community growth

## Technical Considerations

### Testing Strategy

```
tests/
├── unit/
│   ├── validation.test.ts
│   ├── quality-scorer.test.ts
│   └── ...
├── integration/
│   ├── test-command.test.ts
│   ├── install-command.test.ts
│   └── ...
└── fixtures/
    ├── valid-skill/
    ├── invalid-skill/
    └── test-scenarios/
```

### Dependencies to Add

```json
{
	"dependencies": {
		"node-fetch": "^3.3.2", // For registry fetching
		"js-yaml": "^4.1.0", // YAML parsing
		"chalk": "^5.6.2" // Already have
	},
	"devDependencies": {
		"vitest": "^1.0.0", // Testing
		"@types/js-yaml": "^4.0.9"
	}
}
```

### Configuration File

```typescript
// .claude/skills-cli.json
{
  "registry": "https://raw.githubusercontent.com/spences10/claude-skills-registry/main/registry.json",
  "quality_thresholds": {
    "minimum": 0.5,
    "good": 0.7,
    "excellent": 0.9
  },
  "test": {
    "timeout": 120,
    "parallel": false
  },
  "analytics": {
    "enabled": false,  // Opt-in
    "anonymous": true
  }
}
```

## Success Metrics

### User Adoption

- Downloads per week
- Active users (via opt-in analytics)
- GitHub stars and forks

### Quality Improvement

- Average skill quality score over time
- % of skills with tests
- % of skills passing behavioral validation

### Community Growth

- Skills in registry
- Skill installs per week
- Community contributions (PRs, issues)

### User Satisfaction

- Issue resolution time
- Positive feedback ratio
- Feature request themes

## Conclusion

Prioritized implementation plan:

**Ship first** (v0.2.0):

1. `test` command - Solves validation gap
2. `search`/`install` - Solves discovery gap
3. Quality scoring - Raises quality bar

**Ship second** (v0.3.0): 4. `hook` command - Enables automation 5.
Enhanced `stats` - Provides insights 6. Init templates - Lowers
creation barrier

**Ship third** (v0.4.0): 7. `publish` command - Grows community 8.
`doctor` command - Improves debugging 9. `benchmark` command -
Optimizes performance

This roadmap positions `claude-skills-cli` as the definitive tool for
Claude Skills development, with unique capabilities (behavioral
testing) that no other tool provides.

Next steps:

1. Review and prioritize based on your goals
2. Set up testing infrastructure
3. Implement v0.2.0 features
4. Create skills registry repository
5. Document new features
