---
name: sapcex-simplify
description: Use this skill whenever the user asks for /sapcex-simplify, SpaceX-style simplification, plan review, PR review, architecture simplification, scope reduction, implementation critique, or ways to make software work faster, smaller, clearer, or less overbuilt. This skill adapts SpaceX's iterative engineering method to software: challenge requirements, delete unnecessary parts, simplify the remaining design, accelerate feedback loops, and automate only after the workflow is understood. It is especially useful for reviewing plans, specs, GitHub PRs, feature designs, refactors, and agent task plans.
---

# Sapcex Simplify

Apply a software equivalent of SpaceX's rapid iterative engineering method to plans, PRs, specs, code changes, and architecture proposals.

The goal is not to make things small for aesthetic reasons. The goal is to increase the ratio of user value to complexity, reduce cycle time, expose bad assumptions earlier, and preserve adaptability.

## Operating Principle

Every simplification must include either:

- A better alternative that preserves or improves the intended outcome, or
- A clear rationale for why the removed requirement, code, process, abstraction, or dependency is not worth carrying.

Do not delete for the sake of deletion. If removal would create meaningful risk, name the risk and propose a smaller experiment, guardrail, or follow-up instead.

## Software Bill of Design

Before judging the implementation, reconstruct the Bill of Design. A Bill of Design focuses on why the system exists instead of merely what parts it contains.

Capture the smallest useful version of:

- User need: the concrete user or operator problem being solved.
- Design criteria: correctness, latency, reliability, privacy, cost, maintainability, compliance, reversibility, or other forces that actually matter here.
- Constraints: hard requirements, external interfaces, migration boundaries, data contracts, deadlines, and compatibility needs.
- Learning goal: what this change should teach the team if it is uncertain.
- Non-goals: what should not be solved in this iteration.

If the Bill of Design is missing or vague, start the review by making it explicit. If the stated design does not match the code or plan, call that out before suggesting edits.

## Five-Step Review Loop

Use these steps in order. Later steps are less valuable if earlier steps were skipped.

### 1. Make the requirements less dumb

Treat requirements as hypotheses to test, not sacred objects.

Ask:

- What user outcome does this requirement protect?
- Is this requirement inherited from habit, a previous architecture, or a tool's defaults?
- Can the same outcome be achieved with a narrower contract?
- Is this a hard requirement, a preference, or an untested assumption?
- What decision would become easier if this requirement were relaxed?

Good output examples:

- "Instead of requiring full multi-tenant customization now, ship a single tenant-safe extension point because the current user need is workflow labeling, not arbitrary behavior injection."
- "Keep the audit trail requirement, but narrow it to state-changing actions because read tracking is not part of the current compliance need."

### 2. Delete the part or process step

Look for removable surfaces: features, flags, tables, endpoints, states, queues, background jobs, abstractions, configuration, dependencies, metrics, docs, and manual process.

Delete candidates are strongest when they:

- Do not map to a Bill of Design criterion.
- Exist only to support hypothetical future scale.
- Duplicate another mechanism.
- Add state without a clear owner.
- Expand the testing matrix more than they expand user value.
- Require user decisions before the user has enough information.

For every deletion suggestion, provide:

- What to remove.
- Why it is safe or better to remove now.
- What replaces it, if anything.
- What evidence would justify adding it back later.

Use the "10% add-back" spirit carefully: if nothing ever needs to be restored, the reviewer may not be deleting aggressively enough; if many deletions need immediate restoration, the reviewer may be deleting without understanding the design criteria.

### 3. Simplify and optimize

After requirements are clarified and unnecessary parts are removed, simplify the remaining design.

Prefer:

- Explicit data models over clever implicit state.
- One clear path through a workflow before generalizing to many paths.
- Boring platform primitives over bespoke infrastructure.
- Narrow interfaces over broad service objects.
- Local invariants over distributed coordination.
- Focused tests around transitions, contracts, and failure modes.

Do not optimize complexity that should have been deleted. Do not introduce abstractions merely to make the design look tidy. An abstraction is justified when it removes real duplication, protects a real boundary, or makes a future change cheaper without hiding current behavior.

### 4. Accelerate cycle time

Find the slowest feedback loop and shrink it.

In software, cycle time includes:

- Time from idea to smallest runnable version.
- Time to run relevant tests.
- Time to reproduce a bug.
- Time to deploy or roll back.
- Time to observe whether the change worked.
- Time for the user to approve, steer, or reject an agent action.

Prefer small vertical slices, tight tests, local simulation, feature flags only when they reduce risk, preview environments, better logs, and reversible migrations. If a process is slow, break it into smaller observable loops before adding more process around it.

### 5. Automate last

Automate only after the requirement is sane, unnecessary work has been removed, the remaining workflow is simple, and the feedback loop is fast enough to trust.

Good automation candidates are:

- Repetitive and well-understood.
- Observable when they fail.
- Safe to retry or roll back.
- Valuable enough to justify maintenance.

Bad automation candidates are:

- Unclear product decisions.
- Brittle manual processes that should first be redesigned.
- Rare tasks with high exception rates.
- Workflows where user approval or steering is the core value.

## Review Output

When reviewing a plan, PR, or design, use this structure unless the user asks for a different format:

```markdown
**Bill of Design**
[Brief reconstruction of the user need, design criteria, constraints, learning goal, and non-goals.]

**Highest-Leverage Simplifications**
1. [Actionable simplification]
   - Replace/remove: [specific part, requirement, process, or code surface]
   - Better alternative: [what to do instead, or "no replacement"]
   - Why superior: [cost, risk, speed, correctness, UX, maintainability, or learning advantage]
   - Add-back trigger: [evidence that would justify restoring complexity]

**Cycle Time**
[The slowest feedback loop and how to shorten it.]

**Automation Readiness**
[What should or should not be automated yet.]

**Keep**
[Important complexity that should remain because it directly serves the Bill of Design.]
```

For code reviews, lead with concrete findings and file/line references when available. For plans, lead with the few simplifications most likely to change the outcome.

## Severity and Tone

Be direct but not theatrical. The useful stance is "make the design earn its complexity."

Severity guide:

- Critical: The plan or PR solves the wrong requirement, adds irreversible complexity, or makes core feedback impossible.
- High: A simpler design achieves the same Bill of Design with materially less risk, state, coupling, or time.
- Medium: A component is plausible but premature; defer it behind an add-back trigger.
- Low: Naming, organization, docs, or test changes that improve clarity without changing the design.

Always separate:

- Complexity that is necessary because the problem is real.
- Complexity that is accidental because the requirement, process, or implementation is overbuilt.

## Useful Prompts

Examples of user requests that should trigger this skill:

- "/sapcex-simplify this PR."
- "Review this plan and make it smaller."
- "What can we delete from this architecture?"
- "Challenge the requirements in this spec."
- "Make this implementation more iterative."
- "Is this automation premature?"

When the user invokes `/sapcex-simplify`, treat that as a request to apply this skill even if the surrounding task is brief.
