# Scoring revision: 1 October 2026

## Problem and resulting behavior

The original universal pre-test counted unanswered items and unselected capability signals as zeros. It also divided all capability signals by four even when an item's attainable maximum was three. The original MCQ bank contains only positive three/four-point signals, so its low numerical scores did not represent a conventional percentage correct.

Version `evidence-v3-2026-10-01` separates observed answer quality, question completion and evidence sufficiency. Missing answers and absent option signals are unmeasured. An explicitly scored zero in an essay or option remains zero. No participant is automatically accepted or rejected. No pass mark or statistically validated confidence claim is introduced.

For each observed MCQ capability, quality = points / maximum available for that capability on that item × 100. For an answered essay criterion, quality = rubric score / 4 × 100. Capability quality is the arithmetic mean of its observations. Role quality is the existing weighted mean over observed capabilities; missing capabilities do not become zeros. The dashboard explicitly marks these initial results as diagnostic, unsuitable for a single cohort ranking on their own. Profile, English and preferences do not enter quality scores.

Evidence sufficiency is a separate operational indicator: each capability's contribution is capped at two observations and weighted by the existing role weights. A role receives the initial-evidence label only when every relevant capability has at least one observation, each core capability (role weight >= 3) has at least two observations including an essay observation, and core rubric evidence has no low-confidence/flag marker. These rules are transparent pilot rules, not calibrated psychometric confidence or an eligibility threshold. The weak discrimination of the old MCQs remains disclosed.

## Common replacement baseline

All registered participants can use their existing code to take the same ten new, untimed short-case essays, in the same order. Every capability is directly assessed twice, with explicit criteria and grounded AI quotes. No handbook or role-specific prior knowledge is required. Responses may use bullet points; length, jargon and speed receive no bonus.

A fully answered and fully graded common comparison becomes the primary baseline. It replaces the old diagnostic baseline rather than being averaged with it, so people who rushed to finish or answered fewer old items are compared using the same new evidence tasks. A partial comparison never silently becomes the primary baseline. AI flags and confidence still require human review; the new form and role weights remain pilot and need empirical calibration. The written test cannot establish practical visual/field performance or a pure reading/thinking-speed score.

The old pre-test answers, grades and results remain in each record. The authenticated recalculation endpoint stores prior result/grading/grades once, is idempotent, and archives previous material selections. Notes, profiles, codes and manual post-test access are preserved. Recovery resets of the common comparison require a reason, archive the full prior attempt and are blocked after material release/post-test start.

## Distribution and controls

Materials are held globally in private operational settings. The PDF, handbook, reading acknowledgement and post-test start/quiz routes enforce the hold on the server, including old links. New candidate summaries hide PDF/post-test controls while held. Materials for migrated candidates cannot be published until their common comparison is complete and graded. The admin can open/close the common comparison globally and release the global hold explicitly. Post-test remains a separate per-candidate manual action.

Candidate-specific existing material selections are archived and replaced by unpublished diagnostic suggestions. After the common comparison, suggestions follow the new primary baseline plus candidate preferences; the admin selects and publishes the actual roles. No PDF is automatically distributed.

Role-specific post-test and universal baseline are non-equivalent forms; their raw difference is no longer labeled a learning gain.

## Verification

Regression checks cover clock-skew handling, iPad fullscreen/typing exceptions, ten-second warning confirmation, answer persistence, manual post access, missing-versus-zero scoring, attainable normalization, evidence sufficiency, common-case equality, baseline replacement, idempotent history preservation, material holds, candidate/admin UI and replacement access without an old timed attempt. Live verification uses a synthetic candidate and does not alter participant responses.
