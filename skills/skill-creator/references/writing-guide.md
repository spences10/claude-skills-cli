# Skill Writing Guide

Detailed guidelines for writing effective Claude skills.

## Voice and Tone

### Use Imperative Voice

Claude responds best to direct instructions.

#### ✅ Good Examples

```markdown
Use prepared statements for all database queries. Generate IDs with
nanoid() before inserting records. Store timestamps as Unix epoch
milliseconds. Validate input before saving to database.
```

#### ❌ Bad Examples

```markdown
You should use prepared statements for database queries. You'll want
to generate IDs with nanoid(). It's best if you store timestamps as
Unix epoch. Try to validate input before saving.
```

### Be Specific, Not Vague

Provide concrete instructions, not general advice.

#### ✅ Good Examples

```typescript
// Use nanoid() for ID generation
import { nanoid } from 'nanoid';
const id = nanoid();

// Store timestamps as ISO strings
const timestamp = new Date().toISOString();

// Use type-safe interfaces
interface User {
	id: string;
	name: string;
	email: string;
}
```

#### ❌ Bad Examples

```typescript
// Use an appropriate ID generator
const id = generateId();

// Store timestamps in a suitable format
const created_at = getCurrentTime();

// Use appropriate types
const user: any;
```

### Avoid Conceptual Explanations

Focus on procedural steps, not theory.

#### ✅ Good (Procedural)

```markdown
To fetch user data:

1. Import the API client
2. Call the endpoint with typed parameters
3. Handle the response with type checking
4. Return the typed result
```

#### ❌ Bad (Conceptual)

```markdown
When thinking about API design, consider REST principles and how
architectural patterns affect your implementation...
```

---

## Description Writing

The description determines when Claude triggers your skill. Make it
count.

### Description Formula

```
[Technology] + [Operations] + [Data Types] + [Trigger Phrase]
```

### Examples

#### API Client Skill

```yaml
description:
  REST API client for user data endpoints with TypeScript types. Use
  when making HTTP requests, handling authentication, or working with
  API responses and error handling.
```

**Breakdown**:

- Technology: "REST API", "TypeScript"
- Operations: "HTTP requests", "authentication", "error handling"
- Data types: "user data endpoints", "API responses"
- Trigger: "Use when making...or working with"

#### Component Skill

```yaml
description:
  Create type-safe React components with hooks and TypeScript
  interfaces. Use when building UI components, implementing forms, or
  managing component state and props.
```

**Breakdown**:

- Technology: "React", "hooks", "TypeScript"
- Operations: "building components", "implementing forms"
- Data types: "component state", "props"
- Trigger: "Use when building...or working with"

### Description Checklist

- [ ] Includes technology names
- [ ] Lists specific operations
- [ ] Mentions data types or domains
- [ ] Has "Use when..." trigger phrase
- [ ] Contains searchable keywords
- [ ] Under 1024 characters
- [ ] Over 50 characters (not too short)

---

## Structure Patterns

### Quick Start Section

Show the most common operation immediately.

````markdown
## Quick Start

```typescript
import { apiClient } from './lib/api';

const response = await apiClient.get<User[]>('/users');
const users = response.data;
```
````

````

**Guidelines**:
- Minimal working example
- Most common use case
- Copy-paste ready
- Includes imports
- Shows types

### Core Patterns Section

Provide 3-5 essential patterns.

```markdown
## Core Patterns

### GET Requests

```typescript
// Single resource
const user = await apiClient.get<User>(`/users/${id}`);

// Collection
const users = await apiClient.get<User[]>('/users');
````

### POST Requests

```typescript
const newUser = await apiClient.post<User>('/users', {
	id: nanoid(),
	name: 'John Doe',
	email: 'john@example.com',
	createdAt: new Date().toISOString(),
});
```

````

**Guidelines**:
- One pattern per subsection
- Include code examples
- Show variations
- Real project code
- Not invented examples

### Advanced Usage Section

Link to detailed references.

```markdown
## Advanced Usage

For detailed information:
- [references/api-docs.md](references/api-docs.md) - Complete API reference
- [references/authentication.md](references/authentication.md) - Auth patterns
- [references/examples.md](references/examples.md) - 20+ usage examples
````

**Guidelines**:

- Brief descriptions of each reference
- Descriptive link text
- Organized by topic
- Not "click here"

---

## Code Examples

### Use Real Code

Pull examples from actual codebase, not invented scenarios.

#### ✅ Good (Real)

```typescript
// From src/lib/api/users.ts
const response = await fetch(`${API_BASE}/users/${userId}/stats`, {
	headers: {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	},
});
const stats = (await response.json()) as UserStats;
```

#### ❌ Bad (Generic)

```typescript
// Generic example
const result = await api.getData();
```

### Include Context

Show imports, types, and surrounding context.

```typescript
// ✅ Complete context
import { nanoid } from 'nanoid';
import type { User, CreateUserRequest } from './types';
import { apiClient } from './client';

const createUser = async (
	request: CreateUserRequest,
): Promise<User> => {
	const user: User = {
		id: nanoid(),
		...request,
		createdAt: new Date().toISOString(),
	};

	const response = await apiClient.post<User>('/users', user);
	return response.data;
};
```

### Comment Strategically

Explain WHY, not WHAT.

```typescript
// ✅ Good comments (explain why)
// Use Authorization header to verify JWT token
const headers = { Authorization: `Bearer ${token}` };

// Always validate input to prevent injection attacks
const sanitized = validator.escape(userInput);

// ❌ Bad comments (state the obvious)
// This creates headers
const headers = { Authorization: `Bearer ${token}` };

// This makes a request
const response = await fetch(url);
```

---

## Reference Files

### When to Create References

Create reference files when:

- SKILL.md exceeds ~5k words
- Content is only needed in specific scenarios
- You have exhaustive documentation
- Topic deserves deep treatment

### Reference File Structure

````markdown
# Topic Name

## Overview

Brief introduction to the topic.

## Section 1: Subtopic

Detailed content with examples...

```typescript
// Code examples
```
````

## Section 2: Another Subtopic

More detailed content...

## Examples

Real-world usage examples.

## Notes

Important considerations.

````

### Reference File Naming

Use descriptive, searchable names:

#### ✅ Good Names
- `authentication-flow.md`
- `api-endpoints-reference.md`
- `component-library-catalog.md`
- `query-patterns-complex.md`

#### ❌ Bad Names
- `auth.md`
- `api.md`
- `components.md`
- `queries.md`

### Linking to References

Always provide context for links:

```markdown
For complete database schema with all table definitions and relationships:
[references/schema.md](references/schema.md)

For 20+ common query patterns including joins and aggregations:
[references/query-examples.md](references/query-examples.md)
````

Not just:

```markdown
See [schema.md](references/schema.md) and
[examples](references/query-examples.md).
```

---

## Scripts

### When to Create Scripts

Create scripts for:

- **Validation**: Check data consistency, format correctness
- **Generation**: Create boilerplate, scaffolding
- **Analysis**: Parse files, generate reports
- **Testing**: Verify configuration, connectivity

### Script Structure

```javascript
#!/usr/bin/env node
/**
 * Clear description of what this script does.
 *
 * This script [main purpose] by [method]. Use it to [when to use].
 *
 * Usage:
 *   node script-name.js [arguments]
 *
 * Example:
 *   node validate-config.js --check-all
 *   node validate-config.js --file config.json
 *
 * Options:
 *   --check-all    Check all config files
 *   --file NAME    Check specific file
 *   --verbose      Show detailed output
 */

import { parseArgs } from 'node:util';

async function main() {
	const { values } = parseArgs({
		options: {
			verbose: { type: 'boolean', default: false },
			file: { type: 'string' },
			'check-all': { type: 'boolean', default: false },
		},
	});

	try {
		const result = await performOperation(values);
		console.log(`✅ Success: ${result}`);
		process.exit(0);
	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
		process.exit(1);
	}
}

async function performOperation(options) {
	// Main logic here
	return 'Operation completed';
}

main();
```

### Script Best Practices

- Include shebang (`#!/usr/bin/env node`)
- Detailed JSDoc comment with usage examples
- Argument parsing with node:util or commander
- Error handling with meaningful messages
- Exit codes (0 = success, 1 = error)
- Clear output formatting (✅ ❌ ⚠️)
- Use ES modules (import/export) or CommonJS (require)

---

## Assets

### When to Create Assets

Add assets when you have:

- **Templates**: Boilerplate that gets copied/modified
- **Images**: Logos, icons, diagrams
- **Config**: Standard configuration files
- **Data**: Seed data, examples

### Asset Organization

```
assets/
├── templates/
│   ├── component.svelte
│   ├── api-route.ts
│   └── sql-migration.sql
├── images/
│   ├── logo.png
│   └── diagram.svg
├── config/
│   └── tsconfig.json
└── data/
    └── example-data.json
```

### Using Assets

````markdown
## Quick Start

Copy the component template:

```bash
cp assets/templates/component.svelte src/lib/components/new-component.svelte
```
````

Modify the template for your needs.

````

---

## Word Count Guidelines

### SKILL.md Body
- **Target**: 2k-5k words
- **Maximum**: 5k words
- **If exceeding**: Move content to references/

### Reference Files
- **Target**: 1k-10k words per file
- **Maximum**: 15k words per file
- **If exceeding**: Split into multiple focused files

### Description
- **Minimum**: 50 characters
- **Target**: 100-300 characters
- **Maximum**: 1024 characters

---

## Common Mistakes

### Mistake 1: Vague Descriptions
```yaml
# ❌ Bad
description: Helper for API stuff

# ✅ Good
description: REST API client with TypeScript types for user endpoints. Use when making HTTP requests, handling auth, or managing API errors.
````

### Mistake 2: Second Person

```markdown
# ❌ Bad

You should always validate input before saving.

# ✅ Good

Validate input before saving to database.
```

### Mistake 3: Conceptual Over Procedural

````markdown
# ❌ Bad

Understanding the importance of authentication tokens in the context
of secure API communication is crucial for security...

# ✅ Good

Include authentication tokens in all API requests:

```typescript
const response = await fetch(url, {
	headers: { Authorization: `Bearer ${token}` },
});
```
````

````

### Mistake 4: Duplicate Content
```markdown
# ❌ Bad (repeated in multiple places)
SKILL.md has complete schema
references/schema.md has complete schema

# ✅ Good (single source of truth)
SKILL.md has quick reference
references/schema.md has complete schema
````

---

## Checklist

Before finalizing a skill:

### Content

- [ ] Description includes keywords and triggers
- [ ] Imperative voice throughout
- [ ] Specific, not vague
- [ ] Real examples from codebase
- [ ] No TODO placeholders

### Structure

- [ ] Quick Start section present
- [ ] 3-5 Core Patterns documented
- [ ] Links to references working
- [ ] Scripts described
- [ ] Under 5k words (SKILL.md body)

### Technical

- [ ] YAML frontmatter valid
- [ ] Name matches directory
- [ ] Scripts are executable
- [ ] References mentioned in SKILL.md
- [ ] Validation passes

### Testing

- [ ] Tested in real conversations
- [ ] Claude triggers skill correctly
- [ ] Instructions are clear
- [ ] Examples work as shown

---

## Resources

- [SKILLS-ARCHITECTURE.md](../../../docs/SKILLS-ARCHITECTURE.md) -
  System overview
- [SKILL-DEVELOPMENT.md](../../../docs/SKILL-DEVELOPMENT.md) -
  Development workflow
- [SKILL-EXAMPLES.md](../../../docs/SKILL-EXAMPLES.md) - Real examples
