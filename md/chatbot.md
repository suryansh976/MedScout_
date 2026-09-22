AI Chatbot Product & Technical Specification
Conversational hospital discovery, comparison and miscellaneous search
1. Purpose
The chatbot is a conversational interface over the verified hospital dataset. It helps users describe what they need, extracts structured search constraints, asks only necessary clarifying questions, retrieves hospital records, compares them and explains the evidence.
2. Supported Intents
Intent	Example	System action
Hospital search	Find hospitals for kidney treatment in Chandigarh under ₹2L	Extract filters → search
Comparison	Compare A, B and C for this disease	Retrieve records → comparison
Cost question	How much does this treatment cost?	Return sourced cost ranges and caveats
Evidence question	Where did this success rate come from?	Open source/provenance
Speciality discovery	I don't know which speciality I need	Ask for diagnosis/report/context; suggest relevant service categories without diagnosing
Miscellaneous search	I need a hospital for a neurological problem near me	Extract broad speciality → search relevant hospitals
Methodology	How are hospitals ranked?	Explain ranking framework
Data gap	Why doesn't Hospital A show a success rate?	Explain unavailable data
3. Conversation State
{
  disease,
  treatment,
  speciality,
  location,
  maxDistance,
  budget,
  facilities,
  userPriorities,
  selectedHospitals,
  missingCriticalFields,
  safetyFlags
}
4. Intent Extraction
•	Extract explicit values only.
•	Map synonyms to controlled disease/treatment/speciality IDs.
•	Keep uncertain terms as candidates instead of facts.
•	Ask one or two high-value clarifying questions when necessary.
•	Do not infer a diagnosis from symptoms.
5. Retrieval Architecture
User message → intent parser → structured query object → database/search retrieval → ranking/comparison tool → source records → LLM explanation. The LLM receives retrieved facts and source metadata; it is not the primary hospital database.
6. Ranking Explanation
The chatbot should explain placement using disease-specific evidence first, then patient constraints. Example: “Hospital A has documented disease-specific outcome data and a reported treatment volume of X; its documented cost range overlaps your budget. Hospital B is cheaper but has less disease-specific outcome information.”
7. Safety
•	Never diagnose.
•	Never invent success rates, prices, doctors, hospital facilities or outcomes.
•	Never imply a treatment will succeed for a particular patient.
•	Show that cost is an estimate/package/tariff where applicable.
•	Surface source and reporting period for high-impact claims.
•	Emergency/red-flag messages should route to urgent professional/emergency care rather than normal optimization.
8. Source-Grounded Response Pattern
Answer
→ Relevant hospital data
→ Source/date
→ What the number means
→ Important limitation
→ Next action (compare, filter, consult hospital)
9. Prompt Architecture
SYSTEM ROLE:
You are a healthcare information and hospital-discovery assistant. Use only retrieved platform records for hospital facts. Do not diagnose. Do not fabricate missing values.

TOOLS:
searchHospitals(filters)
getHospital(id)
getDiseaseTreatment(hospitalId, diseaseId, treatmentId)
compareHospitals(ids, diseaseId, treatmentId)
getSources(entityId)

RULE:
Every clinical outcome/cost claim must be traceable to a retrieved source. If unavailable, say unavailable.
10. Evaluation Metrics
•	Intent extraction accuracy
•	Filter extraction accuracy
•	Hospital retrieval precision/recall on benchmark queries
•	Source attribution rate
•	Unsupported-claim rate (target zero for factual hospital metrics)
•	Clarifying-question usefulness
•	Comparison consistency
•	Latency
•	Safety-policy pass rate
11. Example
User: “I need treatment for Disease X near Chandigarh, budget ₹3 lakh. Compare hospitals based on their Disease X treatment performance.”
Assistant flow: identify Disease X → retrieve Disease X treatment records → require comparable outcome definitions → filter cost/location → compare patients treated, outcomes, cost and evidence quality → explain trade-offs → link each metric to its source.
Research Sources & Verification References
ABDM Health Facility Registry (HFR) — Government of India / ABDM
National repository of health facilities; includes public and private hospitals, clinics, diagnostic laboratories, imaging centres and pharmacies.
URL: https://ahpr.abdm.gov.in/about
Clinical Establishments Division — Downloads — Ministry of Health & Family Welfare
Provides templates for information/statistics collection, display of rates, costing of procedures and lists of medical procedures.
URL: https://www.clinicalestablishments.mohfw.gov.in/en/download
Clinical Establishments — Monthly Information & Statistics — Ministry of Health & Family Welfare
Shows structured fields for registration, facility type, OPD/IPD volumes, deaths and other establishment statistics.
URL: https://clinicalestablishments.mohfw.gov.in/sites/default/files/2022-06/4001_0.pdf
Standardized Health Care Services Costing Template — Ministry of Health & Family Welfare
Provides a costing framework covering pharmacy, consumables/implants, staff, OT, investigations, radiology, blood bank, rooms/beds, ICU/CCU and overheads.
URL: https://clinicalestablishments.mohfw.gov.in/sites/default/files/2022-06/289_0.pdf
PM-JAY Package Rate / RFE documentation — National Health Authority
Describes hospitalization package rates and included components such as bed, nursing, professional fees, anaesthesia, medicines, implants and specified diagnostics.
URL: https://nha.gov.in/img/pmjay-files/RFE_Volume_II.pdf
NABH Hospital Standards — National Accreditation Board for Hospitals & Healthcare Providers
Quality and patient-safety framework covering patient care, infection control, continuous quality improvement, facilities, human resources and information management.
URL: https://portal.nabh.co/standard.aspx
ICMR Portals / Clinical Trials Registry India — Indian Council of Medical Research
Provides access to ICMR health-research resources and the Clinical Trials Registry India.
URL: https://www.icmr.gov.in/icmr-portals?q=clinical+trial
Three.js — Three.js
Current web 3D rendering library; current site shows r186 and supports WebGL/WebGPU-related rendering capabilities.
URL: https://threejs.org/
Three.js WebGLRenderer — Three.js
WebGL 2 renderer documentation.
URL: https://threejs.org/docs/pages/WebGLRenderer.html
GSAP — GSAP
High-performance browser animation library with timelines, ScrollTrigger and React support.
URL: https://gsap.com/docs/v3/
Drei — React Three Fiber ecosystem
Reusable helpers for React Three Fiber / Three.js scenes.
URL: https://drei.docs.pmnd.rs/
