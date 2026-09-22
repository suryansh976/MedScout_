Backend Schema & Data Model
MongoDB/Mongoose-oriented schema design
1. Core Collections
Collection	Purpose
User	Authentication, profile, role
Hospital	Canonical hospital identity and static overview
Speciality	Controlled speciality taxonomy
Disease	Controlled disease/condition taxonomy
Treatment	Treatment/procedure taxonomy
HospitalTreatment	Hospital × disease × treatment capability
OutcomeRecord	Disease/treatment-specific outcome evidence
CostRecord	Price/package/estimate evidence
Facility	Hospital facility/capability
Accreditation	Accreditation/certification records
SourceDocument	Original source metadata
EvidenceRecord	Normalized claim extracted from a source
VerificationReview	Human/rule review of evidence
Comparison	Saved comparison sessions
ChatSession	Chat conversation metadata
ChatMessage	Chat turns and tool results
SearchLog	Search analytics without unnecessary medical PII
AuditLog	Immutable-ish change history
2. Hospital
{
  _id,
  canonicalName,
  aliases: [],
  registrationIds: [{type, value, sourceId}],
  type,
  ownership,
  address: {line1, city, district, state, pincode, country},
  geo: {type: "Point", coordinates: [lng, lat]},
  phone,
  website,
  specialities: [specialityId],
  treatments: [treatmentId],
  facilities: [facilityId],
  accreditations: [accreditationId],
  sourceRefs: [sourceDocumentId],
  verificationStatus,
  lastVerified,
  createdAt,
  updatedAt
}
3. HospitalTreatment
{
  _id,
  hospitalId,
  diseaseId,
  treatmentId,
  availabilityStatus: "known_capability",
  notes,
  evidenceRefs: [],
  verificationStatus,
  lastVerified
}
4. OutcomeRecord
{
  _id,
  hospitalId,
  diseaseId,
  treatmentId,
  reportingPeriod: {start, end},
  patientsTreated,
  outcomeEvaluablePatients,
  successfulOutcomes,
  mortalityCount,
  complicationCount,
  readmissionCount,
  reportedRate,
  outcomeDefinition,
  methodology,
  sourceDocumentId,
  sourceType,
  verificationStatus,
  confidence,
  createdAt,
  updatedAt
}
5. CostRecord
{
  _id,
  hospitalId,
  diseaseId,
  treatmentId,
  costType: "published_tariff | package | government_package | historical_average | hospital_estimate",
  currency: "INR",
  minAmount,
  maxAmount,
  averageAmount,
  effectiveFrom,
  effectiveTo,
  inclusions: [],
  exclusions: [],
  conditions: [],
  sourceDocumentId,
  verificationStatus,
  confidence,
  createdAt,
  updatedAt
}
6. SourceDocument
{
  _id,
  publisher,
  title,
  sourceType,
  url,
  documentHash,
  publicationDate,
  reportingPeriod,
  retrievedAt,
  storagePath,
  language,
  verificationStatus
}
7. EvidenceRecord
{
  _id,
  sourceDocumentId,
  hospitalId,
  entityType,
  entityId,
  field,
  extractedValue,
  normalizedValue,
  unit,
  context,
  pageOrSection,
  extractionMethod,
  reviewerId,
  verificationStatus,
  conflictGroupId
}
8. VerificationReview
{
  _id,
  evidenceId,
  reviewerId,
  decision,
  reason,
  checkedAgainst: [],
  reviewedAt
}
9. Chat Schema
ChatSession {
  _id, userId, extractedIntent, activeFilters, createdAt, updatedAt
}

ChatMessage {
  _id, sessionId, role, content,
  toolCalls: [{tool, arguments, resultRefs}],
  sourceRefs: [],
  safetyFlags: [],
  createdAt
}
10. Indexes
•	Hospital: 2dsphere geo index; canonicalName; aliases; specialities.
•	HospitalTreatment: compound index on diseaseId + treatmentId + hospitalId.
•	OutcomeRecord: hospitalId + diseaseId + treatmentId + reportingPeriod.
•	CostRecord: hospitalId + diseaseId + treatmentId + effectiveFrom.
•	EvidenceRecord: sourceDocumentId + entityType + entityId + field.
•	SourceDocument: publisher + publicationDate + documentHash.
•	Search: text indexes initially; migrate to OpenSearch for advanced fuzzy/faceted search.
11. Data Integrity Rules
•	Never store successRate without outcomeDefinition and reportingPeriod.
•	Never store a finalCost claim without a source defining scope.
•	Do not use null/unknown as zero.
•	Hospital IDs must be canonical to prevent duplicate hospitals.
•	Every high-impact claim must have at least one sourceDocumentId.
•	All admin changes create AuditLog entries.
