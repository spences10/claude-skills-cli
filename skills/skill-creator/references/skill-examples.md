# Skill Examples for devhub-crm

Real examples showing effective skill patterns for this project.

## Example 1: Database Patterns Skill

### Use Case

Repeatedly providing database schema, query patterns, and transaction handling.

### Structure

```
database-patterns/
├── SKILL.md                    # Core query patterns
├── references/
│   ├── schema.md               # Complete database schema
│   ├── relationships.md        # Table relationships diagram
│   └── query-examples.md       # 20+ common queries
└── scripts/
    ├── validate_timestamps.py  # Check data consistency
    └── analyze_schema.py       # Generate relationship graph
```

### SKILL.md Excerpt

````markdown
---
name: database-patterns
description: SQLite database operations using better-sqlite3 for contacts, companies, interactions, and social_links tables. Use when writing SELECT, INSERT, UPDATE, DELETE operations with prepared statements, handling timestamps, or managing relationships.
---

# Database Patterns

## Quick Start

```typescript
import { db } from '$lib/server/db';

// SELECT single row
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?');
const contact = stmt.get(id, user_id) as Contact | undefined;
```
````

For complete schema: [references/schema.md](references/schema.md)

```

### Why It Works
- ✅ Description includes table names for keyword matching
- ✅ Quick Start shows most common pattern
- ✅ Complete schema in references (not inline)
- ✅ Scripts validate data consistency
- ✅ Keyword-rich: "SELECT, INSERT, UPDATE, DELETE"

---

## Example 2: SvelteKit Component Patterns

### Use Case
Creating type-safe Svelte 5 components with proper runes and snippets.

### Structure
```

sveltekit-patterns/
├── SKILL.md # Core patterns and conventions
├── references/
│ ├── component-library.md # Catalog of existing components
│ ├── reactive-stores.md # SvelteKit load/invalidate patterns
│ └── routing-conventions.md # File-based routing guide
└── assets/
└── component-templates/
├── basic-component.svelte
├── form-component.svelte
└── list-component.svelte

````

### SKILL.md Excerpt
```markdown
---
name: sveltekit-patterns
description: Create type-safe Svelte 5 components with $props(), $derived, and snippets following devhub-crm conventions. Use when building components, implementing forms, or working with reactive stores and SvelteKit routing.
---

# SvelteKit Patterns

## Component Template

```svelte
<script lang="ts">
	interface Props {
		title: string;
		items: Array<{id: string; label: string}>;
	}

	let { title, items }: Props = $props();
</script>
````

For complete component library: [references/component-library.md](references/component-library.md)

```

### Why It Works
- ✅ Shows current Svelte 5 syntax ($props, $derived)
- ✅ Type-safe patterns emphasized
- ✅ Component catalog in references
- ✅ Templates in assets for copying
- ✅ Keywords: "components, forms, reactive stores"

---

## Example 3: GitHub Integration

### Use Case
Implementing GitHub OAuth, fetching profiles, managing connections.

### Structure
```

github-integration/
├── SKILL.md # Auth patterns, common operations
├── references/
│ ├── api-endpoints.md # GitHub API reference
│ └── oauth-flow.md # Complete OAuth implementation
└── scripts/
├── test_connection.py # Validate GitHub credentials
└── check_rate_limit.py # Monitor API usage

````

### SKILL.md Excerpt
```markdown
---
name: github-integration
description: GitHub API integration with better-auth OAuth for fetching user profiles, repositories, and connections. Use when implementing GitHub features, OAuth flows, or working with GitHub data in contacts.
---

# GitHub Integration

## Authentication

```typescript
import { GITHUB_TOKEN } from '$env/static/private';

const response = await fetch('https://api.github.com/user', {
  headers: {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  },
});
````

Check rate limits: `python scripts/check_rate_limit.py`

```

### Why It Works
- ✅ Auth pattern shown immediately
- ✅ Operational scripts (rate limit check)
- ✅ Complete OAuth flow in references
- ✅ Practical utilities included
- ✅ Keywords: "OAuth, GitHub data, contacts"

---

## Example 4: DaisyUI Conventions

### Use Case
Consistent component styling, theme usage, form patterns.

### Structure
```

daisyui-conventions/
├── SKILL.md # Core components and patterns
├── references/
│ ├── component-reference.md # All DaisyUI components
│ └── theme-tokens.md # Color system and usage
└── assets/
└── theme-preview.html # Visual reference

````

### SKILL.md Excerpt
```markdown
---
name: daisyui-conventions
description: DaisyUI v5 component styling for cards, forms, buttons, and layouts with theme color tokens. Use when styling components, implementing forms, or applying consistent visual design.
---

# DaisyUI Conventions

## Card Pattern

```svelte
<div class="card bg-base-100 shadow-md">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
  </div>
</div>
````

For all components: [references/component-reference.md](references/component-reference.md)

````

### Why It Works
- ✅ Shows actual DaisyUI classes used in project
- ✅ Theme tokens documented
- ✅ Visual reference for colors (assets/)
- ✅ Form patterns included
- ✅ Keywords: "cards, forms, buttons, layouts"

---

## Pattern: Description Keywords

Good descriptions include:
- **Technology names**: "SQLite", "GitHub API", "DaisyUI v5"
- **Operations**: "SELECT, INSERT, UPDATE", "OAuth flow"
- **Data types**: "contacts, companies, interactions"
- **Triggers**: "Use when...", "implementing", "working with"

### Before (Vague)
```yaml
description: Helps with database stuff
````

### After (Specific)

```yaml
description: SQLite database operations using better-sqlite3 for contacts, companies, interactions, and social_links tables. Use when writing SELECT, INSERT, UPDATE, DELETE operations with prepared statements.
```

---

## Pattern: Progressive Disclosure

### Level 1: Metadata (Always)

```yaml
name: database-patterns
description: [50-100 words with keywords]
```

**Token cost**: ~100 tokens

### Level 2: SKILL.md Body (When Triggered)

- Quick Start example
- 3-5 core patterns
- Links to references
- Script descriptions

**Token cost**: ~3-5k tokens

### Level 3: Resources (As Needed)

- references/schema.md (complete schema)
- references/query-examples.md (20+ queries)
- scripts/validate.py (runs without loading)

**Token cost**: Only what's accessed

---

## Pattern: Scripts for Efficiency

### Without Script

```markdown
Claude generates validation code every time:
"Check that all timestamps are valid..."
[Claude writes 50 lines of Python]
```

**Cost**: ~500 tokens each time

### With Script

```bash
python scripts/validate_timestamps.py
```

**Cost**: ~50 tokens (just output)

### Script Types

- **Validation**: Check data consistency
- **Generation**: Create boilerplate
- **Analysis**: Parse and report
- **Testing**: Verify configuration

---

## Pattern: Assets for Templates

### Without Assets

```markdown
"Create a basic Svelte component..."
[Claude writes boilerplate each time]
```

### With Assets

```bash
cp assets/component-templates/basic-component.svelte \
   src/lib/components/new-component.svelte
# Modify as needed
```

### Asset Types

- Component templates (.svelte)
- SQL schemas (.sql)
- Configuration files (.json)
- Images and logos (.png, .svg)

---

## Anti-Patterns to Avoid

### ❌ Generic Description

```yaml
description: Database helper tool
```

**Fix**: Include table names, operations, when to use

### ❌ Everything Inline

```markdown
# Database Skill

## Complete Schema (1000 lines)

## All Queries (500 lines)
```

**Fix**: Move to references/schema.md

### ❌ Second Person

```markdown
You should use prepared statements...
```

**Fix**: "Use prepared statements for all queries"

### ❌ Missing Keywords

```yaml
description: Helps with frontend stuff
```

**Fix**: "Svelte 5 components with $props(), forms, routing"

---

## Skill Composition Example

**User Request**: "Create a GitHub contact card with database-backed favorites"

**Skills Activated**:

1. `github-integration` - Fetch profile
2. `database-patterns` - Query favorites
3. `sveltekit-patterns` - Build component
4. `daisyui-conventions` - Style card

**Result**: Skills work together naturally, each handling its domain.

---

## Quick Checklist

Before considering a skill "done":

- [ ] Description includes keywords and "when to use"
- [ ] Quick Start shows most common pattern
- [ ] Core patterns (3-5) in SKILL.md
- [ ] Detailed docs in references/
- [ ] Scripts for repeated code
- [ ] Assets for templates
- [ ] Validated with validate_skill.py
- [ ] Tested in real conversations
- [ ] No TODO placeholders
- [ ] Imperative voice throughout

---

## Resources

- See main [SKILLS-ARCHITECTURE.md](../../../docs/SKILLS-ARCHITECTURE.md) for system design
- See [SKILL-EXAMPLES.md](../../../docs/SKILL-EXAMPLES.md) for Anthropic examples
- See skill-creator SKILL.md for 6-step process
