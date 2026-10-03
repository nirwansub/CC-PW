# Evidence grading repair — 3 October 2026

The previous quote splitter treated a period followed by whitespace as a sentence
boundary. A numbered answer could therefore expose `1.` as a selectable quote.
Exact-substring validation did not establish meaningful or relevant support.
The model received the full answer; the bug does not establish the direction of
any individual score error.

## Changes

- Preserve verbatim paragraphs/list items, including wrapped numbering. Reject
  marker-only or non-verbatim evidence. Support several quotes per criterion.
- Require fulfilled elements, missing elements/contradictions and a short score
  rationale. Reject structurally inconsistent explanations. Rubric anchors,
  question bank, weights and configured model are unchanged.
- Admin-only structural inventory covers every stored graded assessment stage,
  including hidden participants. A separate semantic AI audit checks relevance
  and score justification, without changing scores or claiming human validation.
- Regrading requires an audit finding. It creates a proposal, with criterion-level
  old/new comparisons and full reasons. Explicit application archives the old
  grades, grading metadata, aggregate result and review status. Fingerprints
  prevent stale proposals from applying; repeated application is idempotent.
- Old scores survive network/model failures. Existing review/security flags,
  answers, identity, access codes, materials and access permissions are preserved.
  No AI-authorship detector is added. No participant layout or general admin UX
  changes are included.

## Admin workflow

In **Jawaban & rubrik / review**, expand **Audit bukti & riwayat perbaikan nilai**.
Audit relevance, generate a proposal for flagged stages, inspect its old/new
scores and quotations, then apply with a reason. Old results remain visible there.

Authenticated maintenance API:

- `GET admin-evidence-audit`: structural inventory for all assessments. Optional
  `token` limits the inventory to a single record.
- `POST admin-evidence-audit {token, stage}`: semantic audit, cached for unchanged
  input. Review answers and rubrics only; no identity/profile sent to the model.
- `POST admin-evidence-regrade {token, stage}`: stage a proposal for an audit finding.
- `POST admin-evidence-apply {token, stage, proposalId, reason}`: apply a reviewed
  proposal and preserve the old score. Pre, comparison and leadership only.

Cohort procedure: run structural inventory across all stored graded stages; review
relevance across old grades; include an independently reviewed sample of apparently
normal results (spread across stages, score bands and answer styles). Review
flagged proposals against the rubric before applying. Archive audit counts and
score deltas privately, never in this public repository. Do not equate semantic
AI review with human calibration or a cheating finding.

## Validation and deployment boundary

Synthetic regression coverage includes numbered/wrapped answers, multiple exact
quotes, invalid evidence, inconsistent score explanations, semantic audit output,
authentication, provider failure, stale proposals, idempotent application,
old-score preservation, security/access invariants and admin escaping/history.
Historical workflow fixtures pin their date before the existing cutoff; dedicated
cutoff tests still exercise the production deadline. Real participant audit and
regrading require authorized admin data access; no automatic build-time migration
or batch score change is introduced by this patch.
