# Assets Directory

This directory contains files used in output, not loaded into context.

## Purpose

Assets are files that Claude uses directly in final output:
- Templates (HTML, React components, SQL schemas)
- Images (logos, icons, diagrams)
- Fonts (typography files)
- Boilerplate (starter projects)
- Data files (configuration, seeds)

## When to Use Assets

Add assets when:
- You have templates that get copied/modified
- Images or logos are needed in documents
- Boilerplate code is repeatedly used
- Configuration files are standardized

## Token Efficiency

Assets are efficient because:
- Not loaded into context window
- Used directly in output
- No token cost for storage
- Only referenced when needed

## Examples

### Template File
```
assets/templates/component.tsx
assets/templates/sql-query.sql
```

### Image Files
```
assets/images/logo.png
assets/images/diagram.svg
```

### Boilerplate Projects
```
assets/boilerplate/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

## Usage Pattern

Claude can:
- Copy assets: `cp assets/template.html output/`
- Modify assets: Read, edit, save to new location
- Reference assets: Include in generated output
