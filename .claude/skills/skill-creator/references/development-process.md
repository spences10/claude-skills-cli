# Development Process

Step-by-step workflow for creating effective Claude Skills.

## The Seven Steps

### 1. Recognize

Notice when you're repeatedly providing the same context or domain
knowledge:

- Explaining the same database schema multiple times
- Providing API integration details in every conversation
- Sharing framework-specific conventions repeatedly
- Teaching the same domain concepts

**Signal**: "I've explained this 3+ times in different conversations"

### 2. Gather

Collect 3-5 concrete examples of how you've used this knowledge:

- Save conversation snippets showing the repeated context
- Document the specific questions or tasks that triggered the need
- Note the exact information you provided each time
- Identify common patterns across usage

**Output**: A collection of real usage examples

### 3. Plan

Decide information hierarchy:

**SKILL.md (Level 2)** - Core patterns only:

- What the skill does
- When to use it
- Essential structure/commands
- Links to references

**references/ (Level 3)** - Detailed docs:

- Complete API documentation
- Detailed examples and tutorials
- Background and theory
- Edge cases and troubleshooting

**scripts/ (Level 3)** - Deterministic operations:

- Validation logic
- Code generation
- File transformations
- Data processing

**assets/ (Level 3)** - Static resources:

- Templates
- Configuration files
- Images and diagrams

### 4. Structure

Create the directory structure:

```bash
mkdir -p .claude/skills/my-skill/{references,scripts,assets}
touch .claude/skills/my-skill/SKILL.md
```

### 5. Write

#### Write Description First

The description is critical for skill discovery. Format:

```
[Domain/Context] [operations/capabilities]. Use when [trigger scenarios].
```

Examples:

- ✅ "PostgreSQL schema and query patterns. Use when designing
  databases, writing queries, or optimizing performance."
- ✅ "Next.js 14 App Router conventions. Use when building Next.js
  apps, configuring routes, or implementing server components."
- ❌ "A skill for databases" (too vague)
- ❌ "This skill helps you work with PostgreSQL databases" (second
  person)

Target: <200 chars for optimal Level 1 efficiency

#### Write SKILL.md Body

Structure:

1. **Brief intro** (1-2 lines) - What this skill provides
2. **When to use** (3-5 bullets) - Triggering scenarios
3. **Core patterns** (3-5 sections) - Essential knowledge
4. **Links to references** - Point to detailed docs

Guidelines:

- Use imperative voice ("Use X for Y", not "You should use X")
- Provide concrete examples, not abstract concepts
- Keep it scannable with clear headings
- Target ~50 lines, max ~150 lines
- Link liberally to references/

#### Write References

No size limits - be as detailed as needed:

- Use descriptive filenames (api-endpoints.md, not reference.md)
- Structure with clear headings
- Include code examples
- Cover edge cases
- Provide context and rationale

### 6. Enhance

Add progressive enhancements:

**Scripts** - When operations are:

- Deterministic (same input = same output)
- Complex (would require Claude to generate code)
- Reusable (used frequently)

Examples: validators, code generators, formatters

**Assets** - When you need:

- Templates (boilerplate code, config files)
- Static files (images, data files)
- Resources that shouldn't be loaded into context

### 7. Iterate

Test and refine:

**Testing**:

- Start a new conversation
- Trigger the skill naturally (don't force it)
- Observe if Claude loads it appropriately
- Check if the content is helpful and sufficient

**Refining**:

- If skill loads too often → Make description more specific
- If skill never loads → Add trigger keywords to description
- If Claude asks for info that's in references → Add links in SKILL.md
- If SKILL.md feels bloated → Move content to references
- If you're repeating the same complex operation → Create a script

**Iteration Cycle**:

1. Use skill in real conversations
2. Note friction points and gaps
3. Refactor structure and content
4. Test again

## Common Pitfalls

**Starting Too Big**

- ❌ Writing 500 lines before testing
- ✅ Start with 30-line SKILL.md, iterate

**Generic Descriptions**

- ❌ "Helps with coding tasks"
- ✅ "React hooks patterns and performance optimization. Use when
  building React components or debugging re-renders."

**Bloated SKILL.md**

- ❌ Including complete API docs in SKILL.md
- ✅ Core patterns in SKILL.md, full docs in references/

**Missing Triggers**

- ❌ Description with no "Use when..." clause
- ✅ Clear triggering scenarios in description

**Second Person Voice**

- ❌ "You should use this pattern when you need..."
- ✅ "Use this pattern when..."

## Success Criteria

A well-designed skill:

- ✅ Loads automatically when relevant (no manual triggering)
- ✅ Provides exactly the context needed (not too much, not too
  little)
- ✅ Improves with each conversation (you notice missing pieces)
- ✅ Saves you time (no more re-explaining the same concepts)

## Tips

- **Start minimal**: Better to add than to remove
- **Test early**: Don't perfect in isolation
- **Use real examples**: Concrete beats abstract
- **Trust progressive disclosure**: Claude will ask for references
  when needed
- **Iterate based on usage**: Let real conversations drive refinement
