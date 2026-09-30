# Ansena CC–PW Assessment · v2 pilot

Corporate Communications: Strategist, Creative, Publicist, Executor.
People & Workplace: Curator, Developer, Workplace, Executor.

## Locked system, draft content

System follows the locked baseline. The question bank, rubrics, capability weights and numerical thresholds are **pilot drafts**, not calibrated hiring cut-offs.

- One universal pre-assessment per candidate: 24 SJT + 4 short essays + 2 cross-role SJT + 2 cross-role essays = 32 total.
- Role selections are preferences. All eight roles are mapped using hidden multi-capability option signals and rubric evidence.
- Routing selects at most two roles; a third close role is flagged for validation, never automatically added.
- Optional Personal Profile follows pre-submit immediately; every profile field, including English, is non-scoring and omitted from AI input.
- Common principles and role handbook → role-specific post-test (4 new SJT + 2 essays) → one text practical.
- Admin separates Assessment and Personal Profile; displays capability maps, coverage, applied vs unselected potential, evidence, security events, pre/post gain and practical results.
- AI uses explicit 0–4 rubric anchors, exact-answer evidence quotes, structured output validation and confidence flags. Manual review is an audited exception.
- Single-attempt stages, server deadlines, fullscreen/tab/focus termination and browser copy/paste restrictions.

## Deployment

Existing project: `cc-pw`, production `https://cc-pw.vercel.app`.

Required environment variables:
- `ADMIN_PASSWORD`
- `ADMIN_SECRET` (long, random, stable; also encrypts the optional admin-configured AI key)
- `BLOB_READ_WRITE_TOKEN` for the existing **Private** Vercel Blob store

AI: set `OPENAI_API_KEY` in Vercel, or save a key through the signed-in admin Penilaian AI page. The admin key is AES-256-GCM encrypted in private Blob. Environment key takes priority. Optional `ASSESSMENT_AI_MODEL`; default `gpt-4o-mini`. Calls use Responses structured outputs with `store:false`. Do not paste keys in chat or commit them.

If AI is absent, unavailable, refuses, or fails evidence validation, submitted answers remain saved; grading is pending/failed and can be retried. No final routing is issued while essays are ungraded. Terminated pre-tests never open the next stage.

## Pilot scoring

Capabilities: strategy, communication, creative, operations, people, learning, workplace, risk, documentation, ownership. Every SJT option carries multiple signals (0–4); question capability denominator is the union of its option dimensions, and an unselected dimension contributes zero evidence. This reflects **evidence in the chosen response**, not a validated psychological ability measure. Essays contribute rubric evidence to their listed dimensions. Role-fit is a weighted average of observed capability scores; coverage reports the proportion of role weights represented.

Third-role flag: gap to second role ≤3 points. Role-fit and routing do not use preferences or Personal Profile. Pre/post gain is a descriptive point difference, not an equated or validated learning metric. Final pilot combination is pre 50%, post 30%, practical 20%. No automatic pass/fail decision is made from these draft numbers.

Practical is text-based; actual visual work and field execution require separate work-sample validation where relevant. Browser controls are deterrence/detection, not absolute proctoring, and cannot prevent hardware screenshots or a second device. Use Chrome/Edge desktop for fullscreen.

## Data and reliability

v2 candidate records are stored under `assessments/v2/`, preserving legacy `submissions/` history. Old invitations need replacing with universal-assessment invitations. ETag conditional writes protect stage state from concurrent start/submit/autosave conflicts. Profile changes cannot change scored answers. Submission success is shown only after storage acknowledges it. Scoring runs separately after submission and is recoverable.

Only five client assets are copied to the `public` output. Server banks, rubric maps, keys and tests must never be served as static assets. `/lib/assessment.js` must return 404 in production.

## Validation

`npm test` uses an in-memory Blob adapter and mocked AI to test logic, race handling, schema/evidence validation, non-scoring profiles, routing, stage order and termination. These tests do not establish live OpenAI account/key validity.

`npm run build` produces the static public assets; Vercel deploys `api/index.js` with traced server modules. Candidate `/`, admin `/admin.html` (also clean URL `/admin`).
