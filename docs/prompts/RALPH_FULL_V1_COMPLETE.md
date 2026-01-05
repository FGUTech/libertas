# Ralph Prompt: Full v1 Complete (Phases 0-3)

## Usage

```bash
/ralph-loop "<paste prompt below>" --max-iterations 100 --completion-promise "V1_COMPLETE"
```

---

## Prompt

```
Implement Full v1 Complete (Phases 0-3) of the FGU Signal Engine.

Read CLAUDE.md first — it references all other context files you need (SPEC.md, AGENTS.md, ROADMAP.md, PRD.md).

Each iteration:
1. Check git status and ROADMAP.md to find the next incomplete deliverable
2. Implement it, write tests, ensure they pass
3. Commit with a descriptive message
4. Mark the item complete in ROADMAP.md

If blocked on something, document it in docs/BLOCKERS.md and move to the next item.

When all Phase 0-3 deliverables in ROADMAP.md are checked off and tests pass:
<promise>V1_COMPLETE</promise>
```

---

## Operator Notes

**Prerequisites:** n8n, Postgres, LLM API key, GitHub token

**Intervene if:** Same error 5+ times, no commits for 10+ iterations, or 3+ blockers

**Expected:** ~75-100 iterations
