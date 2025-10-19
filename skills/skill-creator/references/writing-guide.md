# Skill Writing Guide

Detailed guidelines for writing effective Claude skills.

## Voice and Tone

### Use Imperative Voice

Claude responds best to direct instructions.

#### ✅ Good Examples

```markdown
Use prepared statements for all database queries.
Generate IDs with nanoid() before inserting records.
Store timestamps as Unix epoch milliseconds.
Validate input before saving to database.
```

#### ❌ Bad Examples

```markdown
You should use prepared statements for database queries.
You'll want to generate IDs with nanoid().
It's best if you store timestamps as Unix epoch.
Try to validate input before saving.
```

### Be Specific, Not Vague

Provide concrete instructions, not general advice.

#### ✅ Good Examples

```typescript
// Use nanoid() for ID generation
import { nanoid } from 'nanoid';
const id = nanoid();

// Store timestamps with Date.now()
const created_at = Date.now();
```

#### ❌ Bad Examples

```typescript
// Use an appropriate ID generator
const id = generateId();

// Store timestamps in a suitable format
const created_at = getCurrentTime();
```

### Avoid Conceptual Explanations

Focus on procedural steps, not theory.

#### ✅ Good (Procedural)

```markdown
To query contacts:

1. Prepare the statement
2. Bind user_id for security
3. Execute with .get() or .all()
```

#### ❌ Bad (Conceptual)

```markdown
When thinking about database queries, consider the relational
model and how data integrity affects your design choices...
```

---

## Description Writing

The description determines when Claude triggers your skill. Make it count.

### Description Formula

```
[Technology] + [Operations] + [Data Types] + [Trigger Phrase]
```

### Examples

#### Database Skill

```yaml
description: SQLite database operations using better-sqlite3 for contacts, companies, interactions, and social_links tables. Use when writing SELECT, INSERT, UPDATE, DELETE operations with prepared statements.
```

**Breakdown**:

- Technology: "SQLite", "better-sqlite3"
- Operations: "SELECT, INSERT, UPDATE, DELETE"
- Data types: "contacts, companies, interactions, social_links"
- Trigger: "Use when writing...operations"

#### Component Skill

```yaml
description: Create type-safe Svelte 5 components with $props(), $derived, and snippets following devhub-crm conventions. Use when building components, implementing forms, or working with reactive stores and SvelteKit routing.
```

**Breakdown**:

- Technology: "Svelte 5", "$props(), $derived"
- Operations: "building components", "implementing forms"
- Data types: "reactive stores", "SvelteKit routing"
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
import { db } from '$lib/server/db';

const stmt = db.prepare('SELECT * FROM contacts WHERE user_id = ?');
const contacts = stmt.all(user_id) as Contact[];
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

### SELECT Operations

```typescript
// Single row
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
const contact = stmt.get(id) as Contact | undefined;

// Multiple rows
const stmt = db.prepare('SELECT * FROM contacts WHERE user_id = ?');
const contacts = stmt.all(user_id) as Contact[];
````

### INSERT Operations

```typescript
const stmt = db.prepare(`
  INSERT INTO contacts (id, user_id, name, created_at)
  VALUES (?, ?, ?, ?)
`);
stmt.run(nanoid(), user_id, name, Date.now());
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
- [references/schema.md](references/schema.md) - Complete database schema
- [references/relationships.md](references/relationships.md) - Table relationships
- [references/query-examples.md](references/query-examples.md) - 20+ query patterns
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
// From src/lib/server/contacts.ts
const stmt = db.prepare(`
  SELECT c.*, COUNT(i.id) as interaction_count
  FROM contacts c
  LEFT JOIN interactions i ON c.id = i.contact_id
  WHERE c.user_id = ?
  GROUP BY c.id
`);
```

#### ❌ Bad (Generic)

```typescript
// Generic example
const result = database.query('SELECT * FROM table');
```

### Include Context

Show imports, types, and surrounding context.

```typescript
// ✅ Complete context
import { db } from '$lib/server/db';
import { nanoid } from 'nanoid';
import type { Contact } from '$lib/types';

const create_contact = (user_id: string, name: string): Contact => {
  const stmt = db.prepare(`
    INSERT INTO contacts (id, user_id, name, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const id = nanoid();
  stmt.run(id, user_id, name, Date.now());
  return { id, user_id, name, created_at: Date.now() };
};
```

### Comment Strategically

Explain WHY, not WHAT.

```typescript
// ✅ Good comments (explain why)
// Use prepared statements to prevent SQL injection
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');

// Always include user_id for row-level security
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?');

// ❌ Bad comments (state the obvious)
// This prepares a statement
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');

// This runs the query
const result = stmt.get(id);
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
See [schema.md](references/schema.md) and [examples](references/query-examples.md).
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

```python
#!/usr/bin/env python3
"""
Clear description of what this script does.

This script [main purpose] by [method]. Use it to [when to use].

Usage:
    python script_name.py [arguments]

Example:
    python validate_schema.py --check-all
    python validate_schema.py --table contacts

Options:
    --check-all    Check all tables
    --table NAME   Check specific table
    --verbose      Show detailed output
"""

import argparse
import sys


def main():
    parser = argparse.ArgumentParser(description="Script description")
    parser.add_argument("--verbose", action="store_true")

    args = parser.parse_args()

    try:
        result = perform_operation(args)
        print(f"✅ Success: {result}")
        return 0
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


def perform_operation(args):
    """Main logic here."""
    pass


if __name__ == "__main__":
    sys.exit(main())
```

### Script Best Practices

- Include shebang (`#!/usr/bin/env python3`)
- Detailed docstring with usage examples
- Argument parsing with help text
- Error handling with meaningful messages
- Exit codes (0 = success, 1 = error)
- Clear output formatting (✅ ❌ ⚠️)

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
description: Helper for database stuff

# ✅ Good
description: SQLite query patterns for contacts table using better-sqlite3. Use when writing SELECT, INSERT, UPDATE operations.
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

Understanding the importance of prepared statements in the context
of SQL injection vulnerabilities is crucial for security...

# ✅ Good

Use prepared statements for all SQL queries:

```typescript
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
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

- [SKILLS-ARCHITECTURE.md](../../../docs/SKILLS-ARCHITECTURE.md) - System overview
- [SKILL-DEVELOPMENT.md](../../../docs/SKILL-DEVELOPMENT.md) - Development workflow
- [SKILL-EXAMPLES.md](../../../docs/SKILL-EXAMPLES.md) - Real examples
