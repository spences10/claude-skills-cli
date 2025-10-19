---
name: database-patterns
description: SQLite database operations using better-sqlite3 for contacts, companies, interactions, tags, follow_ups, and social_links tables. Use when writing SELECT, INSERT, UPDATE, DELETE operations with prepared statements, handling timestamps, or managing user-scoped queries with row-level security.
---

# Database Patterns

## Core Principles

- Use prepared statements for all queries
- Generate IDs with nanoid()
- Store timestamps as Unix epoch (Date.now())
- Always include user_id for row-level security
- Use transactions for multi-table operations

## Quick Start

```typescript
import { db } from '$lib/server/db';
import { nanoid } from 'nanoid';

// SELECT single row
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?');
const contact = stmt.get(id, user_id) as Contact | undefined;

// SELECT multiple rows
const stmt = db.prepare('SELECT * FROM contacts WHERE user_id = ?');
const contacts = stmt.all(user_id) as Contact[];

// INSERT
const stmt = db.prepare(`
  INSERT INTO contacts (id, user_id, name, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);
const id = nanoid();
const now = Date.now();
stmt.run(id, user_id, name, now, now);

// UPDATE
const stmt = db.prepare(`
  UPDATE contacts SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?
`);
stmt.run(name, Date.now(), id, user_id);

// DELETE
const stmt = db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?');
stmt.run(id, user_id);
```

## Core Tables

### contacts
Primary contact management table with user-scoped access.

### interactions
Communication history linked to contacts.

### follow_ups
Scheduled follow-up tasks with completion tracking.

### tags
User-defined tags for organizing contacts.

### contact_tags
Join table for many-to-many contact/tag relationships.

### social_links
Social media profiles for contacts.

For complete schema with all columns and relationships, see [references/schema.md](references/schema.md).

## Common Patterns

### User-Scoped Queries (Row-Level Security)

Always include user_id in WHERE clause:

```typescript
// ✅ Correct - includes user_id
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?');
const contact = stmt.get(id, user_id);

// ❌ Wrong - missing user_id (security issue)
const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
const contact = stmt.get(id);
```

### Joins with Related Data

```typescript
// Get contact with interaction count
const stmt = db.prepare(`
  SELECT c.*, COUNT(i.id) as interaction_count
  FROM contacts c
  LEFT JOIN interactions i ON c.id = i.contact_id
  WHERE c.user_id = ?
  GROUP BY c.id
`);
const contacts = stmt.all(user_id);
```

### Transactions for Multi-Table Operations

```typescript
const insert_contact_with_tags = db.transaction((contact_data, tag_ids) => {
  // Insert contact
  const contact_stmt = db.prepare(`
    INSERT INTO contacts (id, user_id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const contact_id = nanoid();
  const now = Date.now();
  contact_stmt.run(contact_id, user_id, contact_data.name, now, now);

  // Insert tags
  const tag_stmt = db.prepare(`
    INSERT INTO contact_tags (id, contact_id, tag_id, created_at)
    VALUES (?, ?, ?, ?)
  `);
  for (const tag_id of tag_ids) {
    tag_stmt.run(nanoid(), contact_id, tag_id, now);
  }

  return contact_id;
});

// Execute transaction
const contact_id = insert_contact_with_tags({ name: 'John' }, ['tag1', 'tag2']);
```

### Reactive Updates with SvelteKit

Trigger revalidation after mutations:

```typescript
import { invalidate } from '$app/navigation';

// After INSERT/UPDATE/DELETE
stmt.run(/* ... */);
invalidate('app:contacts'); // Triggers reload of contacts data
```

## Timestamp Handling

All timestamps use Unix epoch milliseconds:

```typescript
const now = Date.now(); // e.g., 1697654400000
const created_at = now;
const updated_at = now;

// Display: format with date-fns
import { format } from 'date-fns';
format(created_at, 'MMM dd, yyyy'); // "Oct 19, 2024"
```

## ID Generation

Use nanoid for all primary keys:

```typescript
import { nanoid } from 'nanoid';

const id = nanoid(); // e.g., "V1StGXR8_Z5jdHi6B-myT"
```

## Advanced Patterns

For detailed information:
- [references/schema.md](references/schema.md) - Complete schema with all columns and types
- [references/relationships.md](references/relationships.md) - Table relationships and foreign keys
- [references/query-examples.md](references/query-examples.md) - 20+ complex query patterns

## Scripts

- `scripts/validate_timestamps.py` - Check timestamp consistency across tables
- `scripts/analyze_schema.py` - Generate relationship diagram from live database

## Notes

- better-sqlite3 is synchronous - no async/await needed
- Prepared statements are reusable - create once, run many times
- Transactions are all-or-nothing - failure rolls back all changes
- Always bind parameters (never string concatenation for SQL injection prevention)
- CASCADE deletes configured via foreign keys - deleting user deletes all their data
