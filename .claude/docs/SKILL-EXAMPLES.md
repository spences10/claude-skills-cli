# Skill Examples

Real-world examples from Anthropic's Skills repository and Claude Cookbooks, with analysis of what makes them effective.

---

## Example 1: Brand Guidelines Skill

### Structure
```
applying-brand-guidelines/
├── SKILL.md
└── scripts/
    ├── apply_brand.py
    └── validate_brand.py
```

### SKILL.md Frontmatter
```yaml
---
name: applying-brand-guidelines
description: This skill applies consistent corporate branding and styling to all generated documents including colors, fonts, layouts, and messaging
---
```

### What Makes It Good

**✅ Clear Scope**: Focuses on one thing - brand consistency across documents

**✅ Actionable Content**: Specific hex codes, font sizes, spacing rules
```markdown
### Color Palette
- **Primary Blue**: #0066CC (RGB: 0, 102, 204)
- **Navy**: #003366 (RGB: 0, 51, 102)
```

**✅ Executable Scripts**: Validation doesn't need manual checking
```python
# scripts/validate_brand.py
# Checks documents for brand compliance automatically
```

**✅ "When to Use" in Description**: "applies consistent corporate branding...to all generated documents"

### Key Takeaway
Brand guidelines are perfect for skills because they're:
- Repeatedly needed across documents
- Specific and rule-based
- Easy to validate programmatically

---

## Example 2: PDF Processing Skill

### Structure
```
pdf/
├── SKILL.md
├── references/
│   ├── forms.md
│   └── reference.md
└── scripts/
    └── extract_fields.py
```

### SKILL.md Excerpt
```markdown
---
name: pdf
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick Start

Use pdfplumber to extract text from PDFs:

```python
import pdfplumber
with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For advanced form filling, see [forms.md](forms.md).
```

### What Makes It Good

**✅ Progressive Disclosure**: Core pattern in SKILL.md, details in forms.md

**✅ Keyword-Rich Description**: "PDFs, forms, document extraction" helps Claude recognize when to use it

**✅ Script for Efficiency**: Form field extraction is deterministic, runs without loading into context

**✅ Separation of Concerns**:
- SKILL.md: Common operations
- forms.md: Specialized form-filling
- reference.md: Complete API docs

### Key Takeaway
Large domains benefit from splitting:
- Quick reference in SKILL.md
- Specialized topics in references/
- Deterministic operations in scripts/

---

## Example 3: Financial Analyzer Skill

### Structure (from Claude Cookbooks)
```
financial-analyzer/
├── SKILL.md
├── references/
│   ├── formulas.md
│   └── ratios-reference.md
└── scripts/
    ├── calculate_ratios.py
    └── generate_dashboard.py
```

### SKILL.md Pattern
```markdown
---
name: financial-analyzer
description: Calculate financial ratios, analyze statements, and generate performance reports. Use when working with financial data, income statements, balance sheets, or cash flow analysis.
---

# Financial Analyzer

## Core Ratios

### Liquidity Ratios

**Current Ratio**:
```python
current_ratio = current_assets / current_liabilities
```

**Quick Ratio**:
```python
quick_ratio = (current_assets - inventory) / current_liabilities
```

For complete ratio formulas, see [references/formulas.md](references/formulas.md).
```

### What Makes It Good

**✅ Domain-Specific**: Tailored to financial analysis

**✅ Executable Calculations**: Scripts provide exact formulas
```python
# scripts/calculate_ratios.py
# Runs calculations without Claude generating code each time
```

**✅ References for Detail**: Full formula explanations in references/

**✅ Real Use Case**: Based on actual business needs

### Key Takeaway
Domain expertise skills should:
- Provide quick formulas in SKILL.md
- Include detailed theory in references/
- Offer scripts for exact calculations
- Use industry-standard terminology

---

## Example 4: Database Schema Skill

### Structure (hypothetical, based on patterns)
```
database-schema/
├── SKILL.md
└── references/
    ├── schema.md
    ├── relationships.md
    └── indexes.md
```

### SKILL.md Pattern
```markdown
---
name: database-schema
description: Complete database schema with table structures, relationships, and indexes for the project. Use when writing SQL queries, understanding data models, or working with database operations.
---

# Database Schema

## Quick Reference

**Core Tables**:
- `users`: User accounts and authentication
- `contacts`: Contact management
- `companies`: Company records
- `interactions`: Communication history

## Common Patterns

### User-scoped Queries
```sql
-- Always include user_id for row-level security
SELECT * FROM contacts WHERE user_id = ? AND id = ?
```

For complete schema with all columns and relationships:
- [references/schema.md](references/schema.md)
- [references/relationships.md](references/relationships.md)
```

### What Makes It Good

**✅ Quick Reference**: Common patterns immediately available

**✅ Detailed Schema**: Complete table definitions in references

**✅ Security Patterns**: Highlights important conventions (user_id checks)

**✅ Navigable**: Links to specific reference files

### Key Takeaway
Reference-heavy skills should:
- Provide navigation in SKILL.md
- Include most common patterns inline
- Move exhaustive details to references/
- Group related content logically

---

## Example 5: React Component Library Skill

### Structure (from Anthropic examples)
```
component-library/
├── SKILL.md
├── references/
│   ├── button-variants.md
│   ├── form-patterns.md
│   └── layout-components.md
└── assets/
    └── component-templates/
        ├── button.tsx
        └── form.tsx
```

### SKILL.md Pattern
```markdown
---
name: component-library
description: Reusable React component patterns with TypeScript, proper props interfaces, and accessibility features. Use when creating new components, refactoring UI, or implementing consistent design patterns.
---

# Component Library

## Basic Component Template

```tsx
interface Props {
  title: string;
  onClick?: () => void;
}

export const Component = ({ title, onClick }: Props) => {
  return <button onClick={onClick}>{title}</button>;
};
```

## Component Catalog

For complete component examples:
- [references/button-variants.md](references/button-variants.md)
- [references/form-patterns.md](references/form-patterns.md)
```

### What Makes It Good

**✅ Template Pattern**: Basic template in SKILL.md

**✅ Assets for Boilerplate**: Complete components in assets/

**✅ Categorized References**: Organized by component type

**✅ Type Safety**: Shows proper TypeScript patterns

### Key Takeaway
Component library skills should:
- Provide basic template in SKILL.md
- Organize components by category in references/
- Include full examples in assets/
- Show type definitions and best practices

---

## Example 6: API Integration Skill

### Structure
```
github-api/
├── SKILL.md
├── references/
│   ├── endpoints.md
│   ├── authentication.md
│   └── rate-limits.md
└── scripts/
    ├── test_connection.py
    └── check_rate_limit.py
```

### SKILL.md Pattern
```markdown
---
name: github-api
description: GitHub API integration patterns including authentication, rate limiting, and common endpoints. Use when fetching GitHub data, implementing OAuth, or working with GitHub profiles and repositories.
---

# GitHub API Integration

## Authentication

```typescript
const response = await fetch('https://api.github.com/user', {
  headers: {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  },
});
```

## Rate Limiting

Check rate limits before making requests:
```bash
python scripts/check_rate_limit.py
```

For complete API reference, see [references/endpoints.md](references/endpoints.md).
```

### What Makes It Good

**✅ Practical Examples**: Real auth code, not theory

**✅ Operational Scripts**: Rate limit checking is utility

**✅ Reference for Exhaustive**: Full endpoint docs in references/

**✅ Common Pitfalls**: Highlights rate limiting upfront

### Key Takeaway
API integration skills should:
- Show authentication patterns immediately
- Include operational utilities (rate checks, health checks)
- Document endpoints in references/
- Highlight common pitfalls (rate limits, errors)

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Generic Descriptions
```yaml
---
name: database-helper
description: Helps with database operations
---
```

**Problem**: Too vague, Claude won't know when to use it

**Fix**: Be specific
```yaml
---
description: SQLite query patterns using better-sqlite3 for contacts, companies, and interactions tables. Use when writing SELECT, INSERT, UPDATE, or DELETE operations with prepared statements.
---
```

### ❌ Anti-Pattern 2: Everything in SKILL.md
```markdown
# Database Skill

## Complete Schema (500 lines)
## All Query Examples (1000 lines)
## Migration History (300 lines)
```

**Problem**: Bloated, uses excessive tokens

**Fix**: Progressive disclosure
```markdown
# Database Skill

## Quick Reference
[10 common patterns]

For complete schema: [references/schema.md](references/schema.md)
For all examples: [references/queries.md](references/queries.md)
```

### ❌ Anti-Pattern 3: Using Second Person
```markdown
You should use prepared statements when querying...
```

**Problem**: Wrong voice for AI instructions

**Fix**: Imperative
```markdown
Use prepared statements for all queries:
```

### ❌ Anti-Pattern 4: Missing "When to Use"
```yaml
---
name: forms
description: Handle form submissions
---
```

**Problem**: Claude won't know when this applies

**Fix**: Include triggers
```yaml
---
description: Handle form submissions with validation, error handling, and reactive updates. Use when implementing forms, processing user input, or validating data before database operations.
---
```

---

## Skill Composition Examples

### Example: Multi-Skill Workflow

**User Request**: "Create a GitHub contact dashboard with database stats"

**Skills Activated**:
1. `database-patterns` - Query contacts table
2. `github-integration` - Fetch GitHub profiles
3. `sveltekit-patterns` - Build component structure
4. `daisyui-conventions` - Apply styling

**Why This Works**: Each skill handles its domain, Claude composes them naturally.

---

## Key Lessons

### From Anthropic Skills

1. **Metadata drives discovery** - Spend time on descriptions
2. **Progressive disclosure saves tokens** - Don't front-load everything
3. **Scripts for determinism** - Code that doesn't change shouldn't be generated
4. **References for depth** - Keep SKILL.md navigable
5. **Real examples** - Pull from actual codebases

### From Community Skills

1. **Domain expertise shines** - General skills are less useful
2. **Composition is powerful** - Skills work together automatically
3. **Validation matters** - Scripts catch errors early
4. **Iteration is key** - Skills improve with real usage
5. **Specificity wins** - Vague descriptions don't trigger

---

## Next Steps

- Apply these patterns to devhub-crm skills
- Study Anthropic's skills repo for more examples
- Test skills with real conversations
- Iterate based on actual usage
- Share successful patterns with team
