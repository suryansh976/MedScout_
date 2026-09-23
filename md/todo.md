## Copy Fixes Checklist

**Grammar/error fixes**
- [ ] Hero subtitle: "document procedure costs" → "documented procedure costs" (remove duplicate "transparent")
- [ ] Chat response: "this criteria" → "these criteria"
- [ ] Search label: "REQUIRED TREATMENT / TECHNIQUE" → "TREATMENT / TECHNIQUE"

**Hero section**
- [ ] Headline → "Find the Right Hospital, Backed by Real Data"
- [ ] Subtitle → "Compare real treatment costs and outcomes from verified government records — not paid ratings or sponsored listings."

**Search panel**
- [ ] "Natural Language AI Diagnosis Intake" → "Describe your situation in your own words"
- [ ] "GEOGRAPHIC HUB" → "Location"
- [ ] "REGISTRY ACCREDITATION" → "Hospital Certification"
- [ ] "AUDITED DATASETS" → "Verified data available for"

**Stats bar**
- [ ] "142,800+ AUDITED CLINICAL HOSPITAL EPISODES RECORDED" → "142,800+ verified hospital records"
- [ ] Keep "Zero Commercial Sponsorship" as-is

**AI chat panel**
- [ ] "AuraMed Clinical Reasoning Engine (v4.2LLM • SNOMED CT Ontologies)" → "AuraMed Assistant"
- [ ] Greeting text → "Hi — tell me what's going on: your condition or symptoms, where you're located, and your budget, and I'll find matching hospitals."
- [ ] "CLINICAL ENTITIES EXTRACTED" → "Here's what I understood"
- [ ] "Diagnosis Classification" → "Condition"
- [ ] "Procedure Matched" → "Procedure"
- [ ] "Budget Ceiling" → "Budget"
- [ ] "Location Scope" → "Search area"
- [ ] "Refine Comorbidities" → "Add more details"

**Comparison cards**
- [ ] "ANNUAL CABG VOLUME" → "Surgeries performed per year"
- [ ] Keep "30-DAY MORTALITY RATE" — add a tooltip explaining it plainly
- [ ] "DOCUMENTED STANDARD PACKAGE" → "Typical cost"
- [ ] "94% of reported episodes settled within this bandwidth" → "94% of patients paid within this range"

**Ranking section**
- [ ] "How AuraMed Indexes & Ranks" → "How We Rank Hospitals"
- [ ] "Strict Statutory Eligibility... Binary Gate (Pass/Fail)" → "Must be officially registered — no exceptions"
- [ ] "Validated Procedure Volumes" → "Proven Track Record"
- [ ] "Itemized Cost Disclosures" → "Honest Pricing"
- [ ] "Statutory Anti-Advertising Pledge" → "Our Promise: No Paid Rankings"

**Structural follow-up**
- [ ] Decide on tooltip treatment for remaining acronyms (ABDM HFR, NABH, PM-JAY, ICMR) — add `(?)` info icons with one-line explanations on first use per section
- [ ] Share component code if you want these applied directly rather than manually   
# AuraMed Homepage — Full TODO

Based on the screenshot you shared. Organized so you can work through it top to bottom.

---

## ✅ DO — Grammar & factual errors (fix regardless of style)

- [ ] Hero subtitle: "document procedure costs" → "documented procedure costs" (also remove duplicate use of "transparent" later in the same sentence)
- [ ] Chat response: "this criteria" → "these criteria" (criteria is plural)
- [ ] Search field label: "REQUIRED TREATMENT / TECHNIQUE" → "TREATMENT / TECHNIQUE" (unclear what "required" modifies)

---

## ✅ DO — Simplify language, section by section

### Top navigation
- [ ] "Disease Protocols" → "Conditions & Treatments"
- [ ] "Data Provenance" → "Where Our Data Comes From"
- [ ] "Admin Verification" → "Verified Admin Access"
- [ ] "ABDM & MoHFW SYNCED" badge → "Government-Linked Data"
- [ ] "AI Clinical Guide" → "Ask AI"

### Hero section
- [ ] Eyebrow: "REGISTRY-BACKED INSTITUTIONAL SEARCH • ZERO PAID PLACEMENTS" → "Backed by Government Records • No Paid Listings"
- [ ] Headline: "Evidence-Based Hospital Discovery & Disease-Specific Clinical Outcomes" → "Find the Right Hospital, Backed by Real Data"
- [ ] Subtitle → "Compare real treatment costs and outcomes from verified government records — not paid ratings or sponsored listings."

### Search panel
- [ ] "Natural Language AI Diagnosis Intake" → "Describe your situation in your own words"
- [ ] "GEOGRAPHIC HUB" → "Location"
- [ ] "REGISTRY ACCREDITATION" → "Hospital Certification"
- [ ] "AUDITED DATASETS" → "Verified data available for"

### Stats bar
- [ ] "142,800+ AUDITED CLINICAL HOSPITAL EPISODES RECORDED" → "142,800+ verified hospital records"
- [ ] Keep "Zero Commercial Sponsorship" as-is — already clear, already a strong trust signal

### "Intelligent Medical Navigator" section
- [ ] Eyebrow "INTELLIGENT MEDICAL NAVIGATOR" → "Confused by a diagnosis?"
- [ ] Body text → "Paste in a report, biopsy note, or doctor's summary — we'll translate the medical jargon and match it to hospitals that treat it."
- [ ] "SELECT A CLINICAL INQUIRY SCENARIO" → "Try an example:"
- [ ] Leave the 3 example scenarios ("My father has triple vessel disease...") unchanged — already in good plain language, use as the tone model for everything else

### AI chat panel
- [ ] "AuraMed Clinical Reasoning Engine (v4.2LLM • SNOMED CT Ontologies)" → "AuraMed Assistant"
- [ ] Greeting → "Hi — tell me what's going on: your condition or symptoms, where you're located, and your budget, and I'll find matching hospitals."
- [ ] "CLINICAL ENTITIES EXTRACTED" → "Here's what I understood"
- [ ] "Diagnosis Classification" → "Condition"
- [ ] "Procedure Matched" → "Procedure"
- [ ] "Budget Ceiling" → "Budget"
- [ ] "Location Scope" → "Search area"
- [ ] "Refine Comorbidities" → "Add more details"
- [ ] "Comparison Queue • 2 Facilities Queued" → "Comparing 2 hospitals"

### Live comparison section
- [ ] "LIVE REGISTRY PULL — Snapshot as of Q3 Clinical Verification Run" → "Updated quarterly — last check: Q3"
- [ ] "Real data from MoHFW statutory returns & ABDM registered cardiac programs in New Delhi NCR" → "Sourced from official government health records for hospitals in Delhi NCR"
- [ ] "Launch Full 12-Hospital Matrix" → "See All 12 Hospitals"

### Hospital cards
- [ ] "NABH FULL ACCREDITATION" → "Fully Accredited" (keep "NABH" as small print underneath — people do search for the term)
- [ ] "Private Super" / "Public Autonomous" / "Single-Specialty" → "Private" / "Government" / "Specialist Hospital"
- [ ] "Matched Sub-specialty" → "Best for"
- [ ] "ANNUAL CABG VOLUME" → "Surgeries performed per year"
- [ ] "DOCUMENTED STANDARD PACKAGE" → "Typical cost"
- [ ] "94% of reported episodes settled within this bandwidth" → "94% of patients paid within this range"
- [ ] "High Confidence" data tag → "Well-documented data"

### Ranking section
- [ ] "How AuraMed Indexes & Ranks" → "How We Rank Hospitals"
- [ ] "Strict Statutory Eligibility... Binary Gate (Pass/Fail)" → "Must be officially registered — no exceptions"
- [ ] "Validated Procedure Volumes" → "Proven Track Record"
- [ ] "Itemized Cost Disclosures" → "Honest Pricing"
- [ ] "Statutory Anti-Advertising Pledge" → "Our Promise: No Paid Rankings"

### Footer
- [ ] "AuraMed Evidence Platform — CLINICAL GRADE" → "AuraMed" (drop "CLINICAL GRADE" — see Don'ts below)
- [ ] Data-source paragraph → "Our data comes from official government health sources including ABDM, PM-JAY, and NABH. This is not an emergency medical service — in an emergency, call 108."
- [ ] "Governance & Audits" → "How We Verify Data"
- [ ] "Stakeholders" → "About"

### New: acronym tooltips (add `(?)` icon, first use per section)
- [ ] ABDM/ABDM HFR → "Ayushman Bharat Digital Mission — India's national health records system. HFR means the hospital is officially registered in it."
- [ ] NABH → "National quality certification for hospitals — checks safety, staff training, and patient care standards."
- [ ] PM-JAY → "Ayushman Bharat government health insurance scheme — covers many treatments for eligible families."
- [ ] MoHFW → "Ministry of Health & Family Welfare — the central government body that regulates healthcare in India."
- [ ] ICMR → "Indian Council of Medical Research — sets national clinical and research standards."
- [ ] "30-DAY MORTALITY RATE" → keep the term as-is (it's a real, important clinical metric — don't soften it), but add a tooltip: "% of patients who died within 30 days of the surgery."

---

## 🚫 DON'T

- [ ] Don't remove "30-DAY MORTALITY RATE" or rename it to something softer — it's real clinical data people specifically look for; explain it with a tooltip instead of hiding the term
- [ ] Don't drop NABH/ABDM/PM-JAY names entirely — they're real credentials some users search for by name; simplify the *surrounding* copy, not the credential names themselves
- [ ] Don't remove or water down "Zero Commercial Sponsorship" / the anti-advertising pledge — this is your strongest differentiator versus other hospital-rating sites; make it more visible, not less
- [ ] Don't keep "CLINICAL GRADE" as a self-applied label in the footer — with no issuing body behind it, it reads as an invented credential and is a credibility risk, not just a wording issue
- [ ] Don't use "SNOMED CT Ontologies" or similar backend/technical terms anywhere user-facing — keep those in developer docs only
- [ ] Don't simplify the three example scenario prompts — they're already the right tone; use them as the reference, don't touch them
- [ ] Don't add a disclaimer to every single line — one clear "not a diagnosis" / "not an emergency service" framing per relevant section is enough; over-disclaiming buries the one that matters
- [ ] Don't ship any of the copy changes without also adding the emergency disclaimer ("Not an emergency service — call 108") somewhere persistently visible — right now it doesn't exist anywhere on the page

---

## 🔍 Search usability — the bigger problem

You're right that this needs more than copy fixes. As built, the main search bar requires someone to already know: the ICD-10 condition name, the specific treatment/technique, a payer package name, and a registry accreditation filter — that's four pieces of expert-level knowledge before a worried, non-technical user can search at all. Copy tweaks won't fix that; the structure needs to change.

- [ ] **Make the AI chat box the primary entry point, not a secondary panel.** Right now the structured search form is visually dominant and the natural-language chat is below it. For most users, flip this — lead with "just tell us what's going on," and treat the structured filters (ICD-10, package codes) as an "advanced search" toggle for power users (agents, hospital staff, researchers) who want precision.
- [ ] **Cut the structured form down to 2 required fields**, not 6: what's wrong (symptom or condition, free text) and where (location). Everything else — budget, accreditation, technique — should be optional refinements shown *after* the first results, not blockers before any results appear.
- [ ] **Replace "Coronary Artery Bypass (CABG)" style dropdowns with symptom-first search.** Most users don't know the procedure name — they know "chest pain" or "my father's knee hurts." Let the AI/backend map symptom → likely condition → procedure, rather than requiring the user to already know the procedure.
- [ ] **Add a "I don't know what's wrong" path.** A visible button or chat prompt like "Not sure what this is? Describe your symptoms" should be as prominent as the main search — this is probably your single highest-impact addition, since it's exactly the audience most likely to bounce off the current form.
- [ ] **Add voice input to the chat box.** For older or less literate users, especially outside metro areas, typing a detailed symptom description in English is itself a barrier. Even basic voice-to-text support materially lowers the entry barrier.
- [ ] **Reduce jargon in the filter labels themselves** (covered above) — "REGISTRY ACCREDITATION" and "PAYER PACKAGE" as filter labels are themselves part of the difficulty, not just the surrounding copy.
- [ ] **Add a language selector near the search bar**, not just relying on the AI to detect language — a visible Hindi/Punjabi/English toggle signals immediately "this works for me" to non-English-first users, which pure language-detection doesn't communicate up front.
- [ ] **Test with a non-technical user before shipping.** Everything above is a hypothesis — the highest-value next step is literally watching one or two people outside your target tech-savvy demographic try to find a hospital on this page cold, and seeing exactly where they get stuck.

---

## Suggested order of work

1. Emergency disclaimer (missing entirely — highest risk item, do first)
2. Grammar fixes (quick wins)
3. Copy simplification pass (medium effort, no structural risk)
4. Acronym tooltips (medium effort)
5. Search restructuring (highest effort, highest impact on your actual stated problem — the "searching is difficult" issue won't be solved by copy alone)