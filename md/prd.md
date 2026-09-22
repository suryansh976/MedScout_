Product Requirements Document (PRD)
Hospital Discovery, Comparison & Disease-Specific Optimization Platform
1. Product Vision
Build a trustworthy discovery layer that lets a patient search by disease/treatment, budget, location and speciality, compare hospitals using disease-specific evidence, understand documented cost ranges and source quality, and use an AI chatbot for conversational discovery.
2. Target Users
•	Patients and caregivers
•	Users with a known diagnosis
•	Users who know a treatment but not a hospital
•	Users with incomplete terminology who need conversational search
•	Hospital/admin data contributors
•	Platform data-verification administrators
3. Must-Have Features — MVP
•	Search by disease/condition and treatment.
•	Budget filter and cost comparison.
•	Location and distance filter.
•	Speciality filter.
•	Disease-specific hospital treatment capability.
•	Disease-specific outcome/volume fields where available.
•	Hospital overview.
•	Source/provenance panel.
•	Cost range/package/estimate distinction.
•	Side-by-side hospital comparison.
•	Transparent ranking criteria.
•	AI chatbot for comparison and incomplete/miscellaneous searches.
•	Admin data verification workflow.
•	Responsive web UI.
•	Role-based authentication.
4. Features Explicitly Deferred
•	Real-time bed/room availability
•	Real-time doctor availability
•	Real-time OT/ICU availability
•	Online appointment booking
•	Payments
•	Insurance claims
•	Patient medical-record integration
•	Automated clinical outcome auditing
5. Search Requirements
•	Structured filters: disease, treatment, speciality, budget, location, facilities.
•	Natural-language search routed through chatbot/query parser.
•	Unknown/missing fields remain unknown rather than being guessed.
•	Results must be disease-specific.
•	Sorting options include disease-specific outcome rate where comparable, patient volume, cost, distance and data confidence.
6. Hospital Profile
•	Overview
•	Specialities
•	Treatments
•	Facilities
•	Disease-specific records
•	Cost information
•	Evidence/source timeline
•	Accreditation information
•	Data confidence
•	Last updated
7. Comparison
Comparison must normalize labels and units. It must show missing fields explicitly and must not convert unavailable data to zero.
8. Ranking
Default ranking is disease-specific and constraint-aware. Suggested conceptual ordering: eligibility → disease-specific evidence quality → disease-specific outcomes/volume where comparable → budget/cost fit → location → speciality/facilities. Do not publish a single opaque clinical-quality score.
9. Non-Functional Requirements
•	Mobile responsive
•	WCAG-oriented contrast and keyboard support
•	API response target under 500 ms for common database searches excluding external AI calls
•	Audit logs for data changes
•	Encryption in transit
•	Role-based authorization
•	Rate limiting
•	Prompt/output logging with privacy controls
•	Source freshness tracking
10. Acceptance Criteria
•	A disease-specific search returns only hospitals mapped to that disease/treatment.
•	Every displayed clinical/cost metric exposes source and date.
•	Unavailable data is visibly labeled.
•	Chatbot can convert natural language into filters.
•	Comparison page supports at least three hospitals.
•	Admin can approve/reject/edit evidence records.
•	Ranking explanation lists the factors that affected placement.
