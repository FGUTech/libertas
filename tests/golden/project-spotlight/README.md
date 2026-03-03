# Project Spotlight Golden Tests

Golden test fixtures for the `agents/social/project-spotlight.md` agent prompt.

## Structure

Each test case is a pair of files:

| File | Description |
|------|-------------|
| `input-NNN.json` | A ProjectIdea object (matches `schemas/project-idea.schema.json`) |
| `expected-NNN.json` | Expected output: format metadata + tweet text + character counts |

## Test Cases

| # | Scenario | Tweet Count | Key Test |
|---|----------|-------------|----------|
| 001 | Offline document vault for lawyers | 2 | Problem + "what if" solution framing |
| 002 | Censorship-resistant mobile DNS | 1 | Single-tweet "real gap" format |
| 003 | ZK whistleblower platform (no GitHub issue) | 2 | Fallback to `libertas.fgu.tech/ideas/` URL |
| 004 | Satellite Bitcoin transaction relay | 2 | Technical audience, "interesting gap" opener |

## Running

```bash
npm run test:agents -- --agent=project-spotlight
```

## Evaluation Criteria

Golden tests for this agent are **semantic**, not exact-match. When evaluating agent output against expected:

1. **Format compliance**: Output follows the specified markdown structure
2. **Tweet count**: Matches expected (1 or 2)
3. **Character limits**: Each tweet <= 280 characters (text excluding URL line)
4. **Register**: Uses conversational tone, not institutional or editorial
5. **Problem-first framing**: Leads with the gap/problem, not the solution
6. **No internal metrics**: Scores never appear in post text
7. **Link present**: GitHub issue URL or Libertas fallback included
8. **Anti-patterns absent**: No emojis, hashtags, engagement bait, crypto-bro language
9. **Concrete specificity**: Names affected groups, countries, tools — not abstract categories
