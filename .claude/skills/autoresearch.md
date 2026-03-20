---
name: autoresearch
description: Autonomously optimize Claude Code skills by running them repeatedly, scoring outputs against binary evaluations, mutating the prompt, and retaining improvements.
user_invocable: true
---

# Autoresearch for Skills

## Overview

Autoresearch is a methodology for autonomously optimizing Claude Code skills by running them repeatedly, scoring outputs against binary evaluations, mutating the prompt, and retaining improvements. This approach adapts Andrej Karpathy's autoresearch methodology to skill prompt optimization.

## Core Job

The system takes an existing skill, defines "good output" as binary yes/no checks, then runs an autonomous loop that:

1. Generates outputs using test inputs
2. Scores every output against eval criteria
3. Mutates the skill prompt to fix failures
4. Keeps mutations that improve the score
5. Repeats until score ceiling is hit or user stops it

**Output:** An improved SKILL.md, results.tsv log, changelog.md of mutations, and live HTML dashboard.

## Pre-Startup Context Gathering

Before running experiments, confirm these five fields with the user:

1. **Target skill** — Exact path to SKILL.md
2. **Test inputs** — 3-5 different prompts covering varied use cases
3. **Eval criteria** — 3-6 binary yes/no checks defining good output
4. **Runs per experiment** — Default: 5 (more runs = more reliable scores)
5. **Budget cap** — Optional maximum experiment cycles before stopping

## Step 1: Read the Skill

Before any changes:

1. Read the full SKILL.md file
2. Read any referenced files in `references/`
3. Identify core job, process steps, and output format
4. Note existing quality checks and anti-patterns

## Step 2: Build the Eval Suite

Convert user criteria into structured binary tests. Each eval follows this format:

```
EVAL [number]: [Short name]
Question: [Yes/no question]
Pass condition: [What "yes" looks like]
Fail condition: [What triggers a "no"]
```

**Rules:**
- Binary only—no scales
- Specific enough to be consistent
- Not so narrow that skills game the eval
- 3-6 evals is optimal

Max score = [number of evals] × [runs per experiment]

## Step 3: Generate Live Dashboard

Create `autoresearch-[skill-name]/dashboard.html` before experiments begin:

**Requirements:**
- Auto-refresh every 10 seconds
- Score progression line chart
- Colored bar per experiment (green = keep, red = discard, blue = baseline)
- Experiment table with #, score, pass rate, status, description
- Per-eval breakdown showing pass/fail rates
- Current status indicator
- Clean styling with soft colors

Use Chart.js from CDN. Update `results.json` after each experiment. Open immediately in browser.

**results.json format:**

```json
{
  "skill_name": "[name]",
  "status": "running",
  "current_experiment": 3,
  "baseline_score": 70.0,
  "best_score": 90.0,
  "experiments": [
    {
      "id": 0,
      "score": 14,
      "max_score": 20,
      "pass_rate": 70.0,
      "status": "baseline",
      "description": "original skill — no changes"
    }
  ],
  "eval_breakdown": [
    {"name": "Text legibility", "pass_count": 8, "total": 10}
  ]
}
```

## Step 4: Establish Baseline

Run the skill AS-IS before any changes (experiment #0):

1. Create `autoresearch-[skill-name]/` directory
2. Create `results.tsv` with header row
3. Generate `results.json` and `dashboard.html`, then open dashboard
4. Back up original SKILL.md as `SKILL.md.baseline`
5. Run skill [N] times with test inputs
6. Score every output against every eval
7. Record baseline score in both files

**results.tsv format (tab-separated):**

```
experiment	score	max_score	pass_rate	status	description
0	14	20	70.0%	baseline	original skill — no changes
```

Confirm the baseline score with the user before proceeding. If already 90%+, ask if optimization is desired.

## Step 5: Run the Experiment Loop

Execute this loop autonomously until stopped:

1. **Analyze failures** — Identify which evals fail most; read actual failing outputs; find patterns
2. **Form hypothesis** — Pick ONE thing to change
3. **Make change** — Edit SKILL.md with targeted mutation
4. **Run experiment** — Execute skill [N] times with same test inputs
5. **Score it** — Run all outputs through all evals; calculate total score
6. **Decide: keep or discard**
   - Score improved → KEEP (new baseline)
   - Score unchanged → DISCARD (revert)
   - Score worse → DISCARD (revert)
7. **Log result** in results.tsv
8. **Repeat**

**Good mutations:**
- Add specific instruction addressing most common failure
- Reword ambiguous instruction to be more explicit
- Add anti-pattern for recurring mistake
- Move buried instruction higher in skill
- Add or improve example showing correct behavior
- Remove instruction causing over-optimization

**Bad mutations:**
- Complete skill rewrite
- Adding 10 rules simultaneously
- Making skill longer without specific reason
- Vague instructions like "make it better"

Run autonomously until: user stops it, budget cap reached, or 95%+ pass rate for 3 consecutive experiments. Do not pause to ask permission between experiments.

## Step 6: Write the Changelog

After each experiment, append to `changelog.md`:

```markdown
## Experiment [N] — [keep/discard]

**Score:** [X]/[max] ([percent]%)
**Change:** [One sentence describing change]
**Reasoning:** [Why expected to help]
**Result:** [What actually happened]
**Failing outputs:** [Description of remaining failures]
```

## Step 7: Deliver Results

Present findings:

1. Score summary: Baseline → Final (percent improvement)
2. Total experiments run
3. Keep rate (kept vs discarded mutations)
4. Top 3 changes that helped most
5. Remaining failure patterns
6. Improved SKILL.md (saved in place)
7. Location of results.tsv and changelog.md

## Output Files

```
autoresearch-[skill-name]/
├── dashboard.html       # live browser dashboard
├── results.json         # dashboard data file
├── results.tsv          # score log per experiment
├── changelog.md         # detailed mutation log
└── SKILL.md.baseline    # original skill
```

Plus improved SKILL.md saved to original location.

## Writing Good Evals

Every eval must be a yes/no question. Not a scale. Not a vibe check. Binary.

### Eval Template

```
EVAL [N]: [Short name]
Question: [Yes/no question]
Pass: [What "yes" looks like — one sentence, specific]
Fail: [What triggers "no" — one sentence, specific]
```

### The 3-Question Test

Before finalizing an eval, ask:

1. **Could two different agents score the same output and agree?** If not, too subjective.
2. **Could a skill game this eval without actually improving?** If yes, too narrow.
3. **Does this eval test something the user actually cares about?** If not, drop it.

### Common Mistakes
- Too many evals (>6): skill starts gaming them
- Too narrow/rigid: creates stilted output
- Overlapping evals: double-counting failures
- Unmeasurable by agent: subjective questions get "yes" every time
