Technical Requirements Document (TRD)
Architecture, stack, security, search, AI and deployment
1. Architecture
Recommended architecture: React SPA → REST API → authentication/authorization → search/filter service → ranking engine → MongoDB → source/evidence storage. AI chatbot calls an LLM through a retrieval-and-tool layer so the model does not directly invent hospital facts.
2. Stack
Component	Technology	Why prioritized
Frontend	React + Vite + Tailwind CSS	Component model, responsive UI, fast iteration
3D	Three.js + React Three Fiber + Drei	Web 3D with React integration; use selectively
Animation	GSAP	Robust timeline/scroll/interaction animation; React support
Backend	Node.js + Express	Matches MERN skillset and simple REST architecture
Database	MongoDB + Mongoose	Flexible records and nested evidence/provenance
Validation	Zod/Joi	Runtime validation at API boundaries
Search MVP	MongoDB indexes/text search	Avoid premature infrastructure
Search scale	OpenSearch/Elasticsearch later	Fuzzy, faceted and relevance-heavy search at scale
AI	LLM API + retrieval/tool calls	Intent extraction, comparison explanations, conversational search
Storage	S3-compatible object storage	Source PDFs and evidence documents
Maps	Map provider API	Geocoding and distance; cache results
Deployment	Docker + managed cloud	Reproducible deployment
Observability	Structured logs + metrics	Trace ranking/data failures
3. 3D Technology Decision
Three.js is currently at r186 on its official site and supports modern rendering capabilities; WebGLRenderer uses WebGL 2. citeturn2search8turn2search9 React Three Fiber/Drei can be used where React-native 3D composition is valuable. GSAP provides timelines, ScrollTrigger and React support. citeturn2search0turn2search1
•	Use 3D only in landing/hero, onboarding, empty states and selected visualization moments.
•	Do not put heavy 3D behind every comparison table.
•	Provide reduced-motion mode and disable non-essential 3D on low-power/mobile devices.
•	Use lazy loading for 3D assets.
4. API Surface
Method	Endpoint	Purpose
GET	/api/hospitals	List/filter hospitals
GET	/api/hospitals/:id	Hospital profile
GET	/api/hospitals/:id/diseases	Disease/treatment records
GET	/api/diseases/:id/hospitals	Disease-specific hospital search
POST	/api/search	Structured + natural language search
POST	/api/compare	Compare selected hospitals
POST	/api/chat	Chatbot turn
POST	/api/admin/evidence	Create evidence record
PATCH	/api/admin/evidence/:id	Verify/update evidence
GET	/api/admin/audit	Audit trail
5. Ranking Engine
Do not use an unexplained weighted score. Use a staged ranking pipeline: hard constraints → evidence availability → disease-specific performance metrics where comparable → patient fit → tie-breakers. If a composite score is used later, expose the formula and weights.
6. Security & Privacy
•	HTTPS everywhere
•	JWT/session with rotation
•	RBAC: patient, hospital-admin, verifier, platform-admin
•	No storage of unnecessary patient-identifying medical information in MVP
•	PII minimization
•	Prompt injection defenses for retrieved documents
•	Audit trail for evidence changes
•	Secret management via environment/secret vault
•	Rate limiting and abuse protection
7. AI Guardrails
•	LLM cannot create unsupported hospital statistics.
•	Hospital/cost/outcome claims must be grounded in retrieved records.
•	Chatbot must distinguish information from medical diagnosis.
•	Emergency or red-flag symptom queries require safety-oriented response.
•	All tool-returned facts should carry source IDs internally so the UI can expose provenance.
8. Deployment Phases
1.	Local development
2.	Staging with seeded dataset
3.	Pilot with verified hospital records
4.	Monitoring and data-refresh jobs
5.	Production with controlled source ingestion
6.	Hospital portal/API integrations
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
