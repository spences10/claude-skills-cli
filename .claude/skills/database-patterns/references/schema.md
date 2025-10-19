# Database Schema Reference

Complete schema for devhub-crm SQLite database.

## Core Tables

### contacts
Contact management with user-scoped access.

```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  github_username TEXT,
  avatar_url TEXT,
  is_vip INTEGER DEFAULT 0,
  birthday TEXT,
  notes TEXT,
  last_contacted_at INTEGER,
  in_network_since INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

### interactions
Communication history with contacts.

```sql
CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  type TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
)
```

### follow_ups
Scheduled follow-up tasks.

```sql
CREATE TABLE follow_ups (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  due_date INTEGER NOT NULL,
  note TEXT,
  completed INTEGER DEFAULT 0,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
)
```

### tags
User-defined tags for organization.

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

### contact_tags
Many-to-many relationship between contacts and tags.

```sql
CREATE TABLE contact_tags (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(contact_id, tag_id)
)
```

### social_links
Social media profiles for contacts.

```sql
CREATE TABLE social_links (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
)
```

## Supporting Tables

### interaction_types
Customizable interaction type definitions.

```sql
CREATE TABLE interaction_types (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(user_id, value)
)
```

### github_following_cache
Cached GitHub following data.

```sql
CREATE TABLE github_following_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile_data TEXT NOT NULL,
  cached_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

## Auth Tables (better-auth)

### user
```sql
CREATE TABLE user (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL,
  image TEXT,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL
)
```

### account
```sql
CREATE TABLE account (
  id TEXT NOT NULL PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt DATE,
  refreshTokenExpiresAt DATE,
  scope TEXT,
  password TEXT,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL
)
```

### session
```sql
CREATE TABLE session (
  id TEXT NOT NULL PRIMARY KEY,
  expiresAt DATE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
)
```

## User Profile Tables

### user_profiles
```sql
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  github_username TEXT,
  bio TEXT,
  tagline TEXT,
  location TEXT,
  website TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  custom_slug TEXT UNIQUE,
  qr_code_url TEXT,
  qr_settings TEXT,
  github_synced_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

### user_social_links
```sql
CREATE TABLE user_social_links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

### user_preferences
```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
  time_format TEXT NOT NULL DEFAULT '24h',
  default_contact_sort TEXT NOT NULL DEFAULT 'name',
  default_follow_up_days INTEGER NOT NULL DEFAULT 7,
  default_interaction_type TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
)
```

### profile_views
```sql
CREATE TABLE profile_views (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  viewer_id TEXT,
  qr_scan INTEGER DEFAULT 0,
  referrer TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES user(id) ON DELETE SET NULL
)
```

## Relationships

```
user (1) ----< (*) contacts
user (1) ----< (*) tags
user (1) ----< (*) user_profiles
user (1) ----< (*) account
user (1) ----< (*) session

contacts (1) ----< (*) interactions
contacts (1) ----< (*) follow_ups
contacts (1) ----< (*) social_links
contacts (*) ----< (*) tags (via contact_tags)
```

## Naming Conventions

- **Tables**: snake_case plural (contacts, follow_ups)
- **Columns**: snake_case (user_id, created_at)
- **Primary Keys**: Always "id" (TEXT from nanoid)
- **Foreign Keys**: table_name_id pattern (user_id, contact_id)
- **Timestamps**: INTEGER Unix epoch milliseconds

## Cascade Rules

- DELETE user → CASCADE deletes all user-owned data
- DELETE contact → CASCADE deletes interactions, follow_ups, social_links, contact_tags
- DELETE tag → CASCADE removes contact_tags entries

## Indexes

Recommended indexes for performance:

```sql
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_follow_ups_contact_id ON follow_ups(contact_id);
CREATE INDEX idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag_id ON contact_tags(tag_id);
```
