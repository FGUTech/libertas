## Prompt Engineering Guidelines

### General Principles

1. **Explicit over implicit**: State all requirements directly
2. **Examples over descriptions**: Show don't tell
3. **Constraints first**: Lead with hard rules
4. **Structured output**: Always specify JSON schema
5. **Grounding**: Reference source material explicitly

### Prompt Template Structure

```markdown
# Role
[Who the agent is and their purpose]

# Context
[Relevant background information]

# Task
[Specific task to perform]

# Input
[What the agent receives]

# Output Requirements
[Exact format and constraints]

# Hard Rules
[Non-negotiable constraints]

# Examples
[Input/output pairs demonstrating expected behavior]
```

### Anti-Patterns to Avoid

- **Vague instructions**: "Write a good summary" → "Write a 2-sentence summary covering who, what, and why"
- **Missing constraints**: Always specify max lengths, required fields, valid values
- **Assumed knowledge**: State the scoring rubric, don't assume the model knows
- **No examples**: Always include at least one input/output example
- **Asking for opinions**: "What do you think?" → "Based on the evidence, assess..."

---

## LLM Provider Configuration

### Recommended Settings

```yaml
llm:
  provider: "anthropic"  # or "openai"
  model: "claude-3-5-sonnet-20241022"  # or newer
  settings:
    temperature: 0.3     # Low for consistency
    max_tokens: 4096     # Adjust per agent
    top_p: 0.9
  structured_output:
    enabled: true
    strict: true         # Enforce schema
```

### Fallback Strategy

```yaml
fallback:
  on_rate_limit: "exponential_backoff"
  on_error: "retry_with_simpler_prompt"
  max_retries: 3
  fallback_model: "claude-3-haiku-20240307"  # Faster, cheaper fallback
```

---

## Testing Agents

### Golden Test Structure

```
/tests/golden/
  /classifier/
    input-001.json      # Test input
    expected-001.json   # Expected output
    input-002.json
    expected-002.json
  /summarizer/
    ...
```

### Running Tests

```bash
# Validate all agents against golden tests
npm run test:agents

# Test specific agent
npm run test:agents -- --agent=classifier

# Generate new golden test from current output
npm run test:agents -- --agent=classifier --update-golden
```
