# Skill Examples with claude-skills-cli

Real examples showing effective skill patterns using TypeScript/Node.

## Example 1: API Client Skill

### Use Case

Repeatedly making authenticated API requests with TypeScript types and
error handling.

### Structure

```
api-client/
├── SKILL.md                    # Core request patterns
├── references/
│   ├── endpoints.md            # Complete API endpoint reference
│   ├── authentication.md       # Auth patterns and token management
│   └── error-handling.md       # Error codes and retry strategies
└── scripts/
    ├── validate-token.js       # Check token validity
    └── test-endpoints.js       # Verify endpoint availability
```

### SKILL.md Excerpt

````markdown
---
name: api-client
description:
  REST API client with TypeScript types for user and data endpoints.
  Use when making HTTP requests, handling authentication, managing API
  errors, or working with async operations.
---

# API Client

## Quick Start

```typescript
import { apiClient } from './lib/api';

// GET single resource with type safety
const user = await apiClient.get<User>(`/users/${id}`);
```
````

For complete endpoint docs:
[references/endpoints.md](references/endpoints.md)

```

### Why It Works
- ✅ Description includes operation keywords for matching
- ✅ Quick Start shows most common pattern with types
- ✅ Complete API docs in references (not inline)
- ✅ Scripts validate connectivity and tokens
- ✅ Keyword-rich: "HTTP requests", "authentication", "async operations"

---

## Example 2: React Component Patterns

### Use Case
Creating type-safe React components with hooks and TypeScript interfaces.

### Structure
```

react-patterns/ ├── SKILL.md # Core patterns and conventions ├──
references/ │ ├── component-library.md # Catalog of existing
components │ ├── hooks-patterns.md # Custom hooks and state management
│ └── routing-patterns.md # React Router conventions └── assets/ └──
component-templates/ ├── basic-component.tsx ├── form-component.tsx
└── list-component.tsx

````

### SKILL.md Excerpt
```markdown
---
name: react-patterns
description: Create type-safe React components with hooks, TypeScript interfaces, and functional patterns. Use when building UI components, implementing forms, or managing component state with hooks.
---

# React Patterns

## Component Template

```typescript
interface CardProps {
  title: string;
  items: Array<{ id: string; label: string }>;
}

export function Card({ title, items }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
````

For complete component library:
[references/component-library.md](references/component-library.md)

```

### Why It Works
- ✅ Shows TypeScript-first React patterns
- ✅ Type-safe props interfaces
- ✅ Component catalog in references
- ✅ Templates in assets for copying
- ✅ Keywords: "hooks", "TypeScript interfaces", "component state"

---

## Example 3: GitHub Integration

### Use Case
Implementing GitHub OAuth, fetching profiles, managing connections.

### Structure
```

github-integration/ ├── SKILL.md # Auth patterns, common operations
├── references/ │ ├── api-endpoints.md # GitHub API reference │ └──
oauth-flow.md # Complete OAuth implementation └── scripts/ ├──
test_connection.js # Validate GitHub credentials └──
check_rate_limit.js # Monitor API usage

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

Check rate limits: `node scripts/check_rate_limit.js`

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

daisyui-conventions/ ├── SKILL.md # Core components and patterns ├──
references/ │ ├── component-reference.md # All DaisyUI components │
└── theme-tokens.md # Color system and usage └── assets/ └──
theme-preview.html # Visual reference

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

For all components:
[references/component-reference.md](references/component-reference.md)

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
- **Technology names**: "TypeScript", "REST API", "React", "Node.js"
- **Operations**: "HTTP requests", "OAuth flow", "async/await"
- **Data types**: "users, posts, comments", "API responses"
- **Triggers**: "Use when...", "Use for...", "Use to..."

### Before (Vague)
```yaml
description: Helps with API stuff
````

### After (Specific)

```yaml
description:
  REST API client with TypeScript types for user and data endpoints.
  Use when making HTTP requests, handling authentication, managing API
  errors, or working with async operations.
```

---

## Pattern: Progressive Disclosure

### Level 1: Metadata (Always)

```yaml
name: api-client
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

- references/endpoints.md (complete API docs)
- references/examples.md (20+ examples)
- scripts/validate-token.js (runs without loading)

**Token cost**: Only what's accessed

---

## Pattern: Scripts for Efficiency

### Without Script

```markdown
Claude generates validation code every time: "Check that all
timestamps are valid..." [Claude writes 50 lines of JavaScript]
```

**Cost**: ~500 tokens each time

### With Script

```bash
node scripts/validate_timestamps.js
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
"Create a basic Svelte component..." [Claude writes boilerplate each
time]
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

**Fix**: "React components with hooks, TypeScript, forms"

---

## Skill Composition Example

**User Request**: "Create a user profile card with API data and
styling"

**Skills Activated**:

1. `api-client` - Fetch user data
2. `react-patterns` - Build component
3. `css-conventions` - Apply styling
4. `error-handling` - Handle fetch errors

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
- [ ] Validated with `npx claude-skills-cli validate`
- [ ] Tested in real conversations
- [ ] No TODO placeholders
- [ ] Imperative voice throughout

---

## Resources

- See main
  [SKILLS-ARCHITECTURE.md](../../../docs/SKILLS-ARCHITECTURE.md) for
  system design
- See [SKILL-EXAMPLES.md](../../../docs/SKILL-EXAMPLES.md) for
  Anthropic examples
- See skill-creator SKILL.md for 6-step process
