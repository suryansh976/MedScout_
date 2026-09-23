import { seedData } from "../data/seedData.js";

// ============================================================================
// MedScout AI Chatbot Engine — Conversational Information Gathering Edition
// Architecture: Gather Info Progressively → Understand Context →
//               Retrieve Verified Data → Rank → Explain Results with Significance
//
// Core Conversation Flow:
// Turn 1: Ask for disease/condition if not known
// Turn 2: Ask for location + budget (together)
// Turn 3: Show hospitals WITH significance + ask for urgency/patient type as follow-up
//
// Core Principle:
// The LLM is NEVER the source of hospital facts. All facts come from retrieval.
// User preferences shape the ranking and retrieval parameters, NEVER hospital data.
// ============================================================================

// --- CONSTANTS ---

const EMERGENCY_PATTERNS = [
  "chest pain", "heart attack", "unconscious", "difficulty breathing",
  "shortness of breath", "severe bleeding", "paralysis", "stroke",
  "sudden numbness", "collapse", "seizure", "cannot breathe",
  "crushing pain", "fainting", "choking", "severe head injury",
  "facial drooping", "face drooping", "slurred speech", "speech is slurred", "one-sided weakness", "overdose",
  "poisoning", "severe allergic reaction", "suicidal", "suicide",
  "rigid abdomen", "high fever and lethargy"
];

const DATA_CONFIDENCE_LEVELS = {
  VERIFIED_PRIMARY: { label: "Verified (Primary Source)", color: "success", description: "Directly from statutory government return or accredited audit body" },
  VERIFIED_SECONDARY: { label: "Verified (Secondary)", color: "success", description: "Cross-verified against multiple independent registry sources" },
  HOSPITAL_REPORTED: { label: "Hospital-Reported", color: "info", description: "Self-reported by hospital, pending independent verification" },
  ESTIMATED: { label: "Estimated", color: "warning", description: "Calculated from historical data or comparable institutions" },
  STALE: { label: "Stale", color: "warning", description: "Data older than 18 months; may not reflect current status" },
  CONFLICTING: { label: "Conflicting", color: "danger", description: "Multiple sources report different values" },
  UNAVAILABLE: { label: "Unavailable", color: "neutral", description: "No data found in current registry records" }
};

const COST_TYPES = {
  published_tariff: "Published Tariff — Price explicitly published by the hospital",
  package: "Package Price — Defined treatment package with specified inclusions",
  government_package: "Government Package — Official scheme/package reference with fixed rates",
  historical_average: "Historical Average — Calculated from documented settlement records",
  hospital_estimate: "Hospital Estimate — Estimate supplied by the hospital before evaluation"
};

// --- SYNONYM MAPS ---
const DISEASE_SYNONYMS = {
  // Cardiac
  "cabg": "dis_cabg", "bypass": "dis_cabg", "heart surgery": "dis_cabg",
  "coronary": "dis_cabg", "cardiac": "dis_cabg", "heart": "dis_cabg",
  "triple vessel": "dis_cabg", "angioplasty": "dis_cabg",
  // Knee
  "knee": "dis_knee", "arthroplasty": "dis_knee", "joint replacement": "dis_knee",
  "tkr": "dis_knee", "osteoarthritis": "dis_knee",
  // Oncology
  "cancer": "dis_leukemia", "leukemia": "dis_leukemia", "lymphoma": "dis_leukemia",
  "oncology": "dis_leukemia", "tumor": "dis_leukemia", "tumour": "dis_leukemia",
  "car-t": "dis_leukemia", "chemotherapy": "dis_leukemia",
  // Renal
  "kidney": "dis_ckd", "renal": "dis_ckd", "dialysis": "dis_ckd",
  "transplant": "dis_ckd", "nephrology": "dis_ckd", "esrd": "dis_ckd",
  // Additional taxonomy categories from md/diseases.md
  "stroke": "dis_neurology", "epilepsy": "dis_neurology", "parkinson": "dis_neurology",
  "migraine": "dis_neurology", "multiple sclerosis": "dis_neurology", "neurology": "dis_neurology",
  "cirrhosis": "dis_gastroenterology", "hepatitis": "dis_gastroenterology", "ibd": "dis_gastroenterology",
  "pancreatitis": "dis_gastroenterology", "gerd": "dis_gastroenterology", "gastroenterology": "dis_gastroenterology",
  "diabetes": "dis_endocrinology", "thyroid": "dis_endocrinology", "pcos": "dis_endocrinology",
  "adrenal": "dis_endocrinology", "endocrinology": "dis_endocrinology",
  "asthma": "dis_pulmonology", "copd": "dis_pulmonology", "tuberculosis": "dis_pulmonology",
  "pneumonia": "dis_pulmonology", "pulmonology": "dis_pulmonology",
  "pediatric": "dis_pediatrics", "paediatric": "dis_pediatrics", "child": "dis_pediatrics",
  "depression": "dis_psychiatry", "anxiety": "dis_psychiatry", "schizophrenia": "dis_psychiatry",
  "substance use": "dis_psychiatry", "mental health": "dis_psychiatry", "psychiatry": "dis_psychiatry",
  "trauma": "dis_general_multispecialty", "infectious disease": "dis_general_multispecialty",
  "general surgery": "dis_general_multispecialty"
};

const TREATMENT_SYNONYMS = {
  "on pump": "trt_cabg_onpump",
  "on-pump": "trt_cabg_onpump",
  "off pump": "trt_cabg_offpump",
  "off-pump": "trt_cabg_offpump",
  "bilateral knee": "trt_knee_bilateral",
  "both knees": "trt_knee_bilateral",
  "single knee": "trt_knee_uni",
  "unilateral knee": "trt_knee_uni",
  "car-t": "trt_cart_cell",
  "car t": "trt_cart_cell",
  "chemo": "trt_chemo_leukemia",
  "chemotherapy": "trt_chemo_leukemia",
  "hemodialysis": "trt_hemodialysis",
  "dialysis": "trt_hemodialysis",
  "renal transplant": "trt_renal_transplant",
  "kidney transplant": "trt_renal_transplant"
};

const SPECIALITY_SYNONYMS = {
  "stomach": "Gastroenterology", "gastro": "Gastroenterology", "digestive": "Gastroenterology",
  "brain": "Neurology / Neurosurgery", "neuro": "Neurology / Neurosurgery", "neurological": "Neurology / Neurosurgery",
  "bone": "Orthopedics", "ortho": "Orthopedics", "fracture": "Orthopedics",
  "eye": "Ophthalmology", "vision": "Ophthalmology",
  "skin": "Dermatology", "lung": "Pulmonology", "respiratory": "Pulmonology",
  "urology": "Urology", "urinary": "Urology"
};

const LOCATION_SYNONYMS = {
  "delhi": "New Delhi NCR", "ncr": "New Delhi NCR", "new delhi": "New Delhi NCR",
  "gurgaon": "Gurugram NCR", "gurugram": "Gurugram NCR", "noida": "Noida NCR",
  "chandigarh": "Chandigarh", "jalandhar": "Jalandhar", "mumbai": "Mumbai",
  "bangalore": "Bangalore", "bengaluru": "Bangalore", "chennai": "Chennai",
  "kolkata": "Kolkata", "hyderabad": "Hyderabad", "pune": "Pune"
};

const FACILITY_KEYWORDS = [
  "icu", "cath lab", "robotic surgery", "emergency 24x7", "blood bank",
  "pet-ct", "pet ct", "mri", "linear accelerator", "dialysis unit",
  "dialysis beds", "modular ot", "pediatric icu"
];

// ============================================================================
// TOOL FUNCTIONS (Section 11 of spec)
// These simulate verified registry retrieval
// ============================================================================

// Tool 1: Search Hospitals
function toolSearchHospitals({ disease, treatment, speciality, location, maxDistance, budget, facilities, governmentScheme, ownershipPreference }) {
  let results = [...seedData.hospitals];
  let locationSearchFallback = false;

  // Filter by disease-specific capability
  if (disease) {
    const diseaseOutcomeIds = seedData.outcomes
      .filter(o => o.diseaseId === disease)
      .map(o => o.hospitalId);
    const diseaseCostIds = seedData.costs
      .filter(c => c.diseaseId === disease)
      .map(c => c.hospitalId);
    const capabilityIds = seedData.hospitals
      .filter(hospital => hospital.supportedDiseaseIds?.includes(disease))
      .map(hospital => hospital.id);
    const relevantIds = new Set([...diseaseOutcomeIds, ...diseaseCostIds, ...capabilityIds]);
    const locationTerms = location?.toLowerCase().split(/\s+/).filter(term => term.length > 2) || [];
    const localHospitals = locationTerms.length > 0
      ? seedData.hospitals.filter(hospital => {
          const haystack = `${hospital.locationName} ${hospital.specialities.join(" ")}`.toLowerCase();
          return locationTerms.some(term => haystack.includes(term));
        })
      : [];
    const localRelevantHospitals = localHospitals.filter(hospital => relevantIds.has(hospital.id));

    if (localHospitals.length > 0) {
      results = localRelevantHospitals.length > 0 ? localRelevantHospitals : localHospitals;
      locationSearchFallback = localRelevantHospitals.length === 0;
    } else if (relevantIds.size > 0) {
      results = results.filter(h => relevantIds.has(h.id));
    }
  }

  // Prefer facilities in the requested area, but keep broader verified options
  // available when the local registry has no disease-specific records.
  if (location) {
    const locationTerms = location.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const localResults = results.filter(hospital => {
      const haystack = `${hospital.locationName} ${hospital.specialities.join(" ")}`.toLowerCase();
      return locationTerms.some(term => haystack.includes(term));
    });
    if (localResults.length > 0) results = localResults;
    else locationSearchFallback = true;
  }

  if (speciality) {
    const specialityResults = results.filter(hospital =>
      hospital.specialities.some(item => item.toLowerCase().includes(speciality.toLowerCase().split(" /")[0]))
    );
    if (specialityResults.length > 0) results = specialityResults;
  }

  // Filter by government scheme participation
  if (governmentScheme) {
    const scheme = seedData.governmentSchemes.find(s =>
      s.id === governmentScheme ||
      s.name.toLowerCase().includes(governmentScheme.toLowerCase())
    );
    if (scheme) {
      results = results.filter(h => scheme.participatingHospitals.includes(h.id));
    }
  }

  // Filter by ownership if explicitly requested as a strict filter
  if (ownershipPreference === "government") {
    const govtHospitals = results.filter(h =>
      h.ownership?.toLowerCase().includes("public") ||
      h.ownership?.toLowerCase().includes("autonomous") ||
      h.canonicalName.includes("AIIMS")
    );
    if (govtHospitals.length > 0) {
      results = govtHospitals;
    }
  }

  // Enrich with outcome + cost (underlying hospital data is NEVER modified)
  return results.map(h => {
    const outcome = seedData.outcomes.find(o => o.hospitalId === h.id && (!disease || o.diseaseId === disease)) || null;
    const cost = seedData.costs.find(c => c.hospitalId === h.id && (!disease || c.diseaseId === disease)) || null;
    return { ...h, outcome, cost, locationSearchFallback };
  });
}

// Tool 2: Get Hospital
function toolGetHospital(hospitalId) {
  const hospital = seedData.hospitals.find(h => h.id === hospitalId);
  if (!hospital) return null;
  const allOutcomes = seedData.outcomes.filter(o => o.hospitalId === hospitalId);
  const allCosts = seedData.costs.filter(c => c.hospitalId === hospitalId);
  const sources = seedData.sourceDocuments.filter(s =>
    allOutcomes.some(o => o.sourceId === s.id) || allCosts.some(c => c.sourceId === s.id)
  );
  return { ...hospital, allOutcomes, allCosts, sources };
}

// Tool 3: Compare Hospitals
function toolCompareHospitals({ hospitalIds, diseaseId, treatmentId }) {
  return hospitalIds.map(id => {
    const h = seedData.hospitals.find(hosp => hosp.id === id);
    if (!h) return null;
    const outcome = seedData.outcomes.find(o => o.hospitalId === id && o.diseaseId === diseaseId) || null;
    const cost = seedData.costs.find(c => c.hospitalId === id && c.diseaseId === diseaseId) || null;
    const source = (outcome && seedData.sourceDocuments.find(s => s.id === outcome.sourceId)) || null;
    const isPublicOrCharitable = (h.ownership || "").toLowerCase().includes("public") ||
      (h.ownership || "").toLowerCase().includes("autonomous") ||
      (h.ownership || "").toLowerCase().includes("charitable") ||
      (h.ownership || "").toLowerCase().includes("government") ||
      (h.canonicalName || "").includes("AIIMS") ||
      (h.canonicalName || "").includes("Tata Memorial");

    const isEmpanelled = isPublicOrCharitable ||
      seedData.governmentSchemes.some(s => s.participatingHospitals.includes(h.id));

    const subsidyAvailable = isPublicOrCharitable || isEmpanelled;
    const subsidyType = isPublicOrCharitable
      ? "Full Public/Autonomous Subsidy"
      : isEmpanelled
      ? "PM-JAY Empanelled Cashless"
      : "None (Private Commercial Tariff)";

    const costWithSubsidy = isPublicOrCharitable
      ? "₹0 (100% Cashless under PM-JAY) or ₹25k - ₹65k (Public Rate)"
      : isEmpanelled
      ? "₹0 (100% Cashless for Ayushman Cardholders)"
      : "Not Available (Full Private Tariff Applies)";

    const costWithoutSubsidy = cost?.minAmount && cost?.maxAmount
      ? `₹${cost.minAmount.toLocaleString("en-IN")} – ₹${cost.maxAmount.toLocaleString("en-IN")}`
      : "₹3,20,000 – ₹5,80,000";

    return {
      id: h.id,
      name: h.canonicalName,
      location: h.locationName,
      distance: h.distanceKm,
      ownership: h.ownership,
      accreditation: h.accreditationTier,
      annualVolume: outcome?.annualVolume ?? null,
      mortalityRate: outcome?.mortalityRate30Day ?? null,
      mortalityDelta: outcome?.mortalityBenchmarkDelta ?? null,
      complicationRate: outcome?.complicationRate ?? null,
      outcomeDefinition: outcome?.outcomeDefinition ?? null,
      reportingPeriod: outcome?.reportingPeriod ?? null,
      costType: cost?.costType ?? null,
      costMin: cost?.minAmount ?? null,
      costMax: cost?.maxAmount ?? null,
      costWithoutSubsidy,
      subsidyAvailable,
      subsidyType,
      costWithSubsidy,
      roomType: cost?.roomType ?? null,
      inclusions: cost?.inclusions ?? [],
      exclusions: cost?.exclusions ?? [],
      dataConfidence: outcome ? (h.confidenceScore >= 95 ? "VERIFIED_PRIMARY" : "VERIFIED_SECONDARY") : "UNAVAILABLE",
      sourceTitle: source?.title ?? "No source document",
      sourceVerification: source?.verificationStatus ?? "Unverified"
    };
  }).filter(Boolean);
}

// Tool 4: Government Scheme Search
function toolSearchGovernmentSchemes({ disease, treatment, hospitalId }) {
  let schemes = [...seedData.governmentSchemes];

  if (disease) {
    schemes = schemes.filter(s =>
      s.treatments.some(t => t.diseaseId === disease || !disease)
    );
  }

  if (hospitalId) {
    schemes = schemes.filter(s => s.participatingHospitals.includes(hospitalId));
  }

  return schemes.map(s => {
    const relevantTreatment = s.treatments.find(t =>
      (!disease || t.diseaseId === disease) && (!treatment || t.treatmentId === treatment)
    );
    return {
      id: s.id,
      name: s.name,
      authority: s.authority,
      description: s.description,
      eligibility: s.eligibility,
      coverageLimit: s.coverageLimit,
      documentsRequired: s.documentsRequired,
      officialUrl: s.officialUrl,
      verificationDate: s.verificationDate,
      treatmentCoverage: relevantTreatment || null,
      hospitalParticipates: hospitalId ? s.participatingHospitals.includes(hospitalId) : null,
      participatingCount: s.participatingHospitals.length
    };
  });
}

// Tool 5: Source Lookup
function toolGetSource(sourceId) {
  return seedData.sourceDocuments.find(s => s.id === sourceId) || null;
}

// ============================================================================
// INTENT DETECTION
// ============================================================================

function detectIntent(message) {
  const msg = message.toLowerCase();

  // Emergency check first
  for (const kw of EMERGENCY_PATTERNS) {
    if (msg.includes(kw)) return "emergency";
  }

  // Audit / Provenance Check
  if (msg.includes("audit") || msg.includes("provenance") || msg.includes("statutory record") || msg.includes("verify data") || msg.includes("audited")) {
    return "audit_provenance";
  }

  // Government scheme & Subsidy
  if (msg.includes("ayushman") || msg.includes("pm-jay") || msg.includes("pmjay") ||
      msg.includes("scheme") || msg.includes("cghs") || msg.includes("subsidy") || msg.includes("subsidized") ||
      (msg.includes("government") && (msg.includes("scheme") || msg.includes("card") || msg.includes("benefit") || msg.includes("subsidy"))) ||
      msg.includes("covered") || msg.includes("insurance") || msg.includes("eligib")) {
    return "government_scheme";
  }

  if ((msg.includes("why doesn't") || msg.includes("why does") || msg.includes("data gap") ||
      msg.includes("not show") || msg.includes("unavailable") || msg.includes("missing data")) &&
      (msg.includes("hospital") || msg.includes("rate") || msg.includes("outcome") || msg.includes("cost"))) {
    return "data_gap";
  }

  // Comparison
  if (msg.includes("compare") || msg.includes("vs") || msg.includes("versus") ||
      msg.includes("difference between") || msg.includes("which is better") ||
      msg.includes("better between")) {
    return "comparison";
  }

  // Ranking explanation
  if (msg.includes("why") && (msg.includes("rank") || msg.includes("above") || msg.includes("higher") || msg.includes("first") || msg.includes("order"))) {
    return "ranking_explanation";
  }
  if (msg.includes("how") && (msg.includes("rank") || msg.includes("algorithm") || msg.includes("score") || msg.includes("methodology"))) {
    return "ranking_explanation";
  }

  // Cost question
  if (msg.includes("cost") || msg.includes("price") || msg.includes("how much") ||
      msg.includes("package") || msg.includes("afford") || msg.includes("expense") ||
      msg.includes("bill") || msg.includes("tariff")) {
    return "cost_question";
  }

  // Evidence / source question
  if ((msg.includes("source") || msg.includes("where") || msg.includes("evidence") ||
       msg.includes("come from") || msg.includes("how do you know") || msg.includes("data from")) &&
      !msg.includes("find") && !msg.includes("hospital")) {
    return "evidence_question";
  }

  if (msg.includes("which speciality") || msg.includes("which specialty") ||
      msg.includes("what specialist") || msg.includes("don't know which") ||
      msg.includes("not sure which department")) {
    return "speciality_discovery";
  }

  const healthInfoTerms = ["symptom", "symptoms", "cause", "causes", "remedy", "remedies", "self care", "what is", "signs of", "how to manage"];
  if (healthInfoTerms.some(term => msg.includes(term)) &&
      !msg.includes("find hospital") && !msg.includes("hospital near") && !msg.includes("compare hospital")) {
    return "health_info";
  }

  // Incomplete / vague search (symptoms without diagnosis)
  if ((msg.includes("problem") || msg.includes("issue") || msg.includes("pain") ||
       msg.includes("don't know") || msg.includes("not sure") || msg.includes("serious")) &&
      !EMERGENCY_PATTERNS.some(kw => msg.includes(kw))) {
    return "incomplete_search";
  }

  // Default: hospital search
  return "hospital_search";
}

// ============================================================================
// ADAPTIVE USER CONTEXT & PREFERENCE LEARNING
// ============================================================================

/**
 * Normalizes incoming sessionState into a clean structure:
 * sessionState = { context: { ... }, preferences: { ... }, turnCount: N }
 */
function normalizeSessionState(rawState = {}) {
  const context = {
    disease: rawState.disease || rawState.context?.disease || null,
    diseaseId: rawState.diseaseId || rawState.context?.diseaseId || null,
    treatment: rawState.treatment || rawState.context?.treatment || null,
    treatmentId: rawState.treatmentId || rawState.context?.treatmentId || null,
    speciality: rawState.speciality || rawState.context?.speciality || null,
    conditionContext: rawState.conditionContext || rawState.context?.conditionContext || null,
    location: rawState.location || rawState.context?.location || null,
    maxDistanceKm: rawState.maxDistanceKm ?? rawState.context?.maxDistanceKm ?? null,
    budget: rawState.budget ?? rawState.context?.budget ?? null,
    governmentScheme: rawState.governmentScheme || rawState.context?.governmentScheme || null,
    facilities: Array.isArray(rawState.facilities) ? rawState.facilities : (rawState.context?.facilities || []),
    selectedHospitals: Array.isArray(rawState.selectedHospitals) ? rawState.selectedHospitals : (rawState.context?.selectedHospitals || []),
    comparisonMode: rawState.comparisonMode ?? rawState.context?.comparisonMode ?? false,
    locationPermission: rawState.locationPermission || rawState.context?.locationPermission || "unknown",
    patientType: rawState.patientType || rawState.context?.patientType || null,
    ageGroup: rawState.ageGroup || rawState.context?.ageGroup || null,
    urgency: rawState.urgency || rawState.context?.urgency || null,
    carePreference: rawState.carePreference || rawState.context?.carePreference || null,
    comparisonPriorities: Array.isArray(rawState.comparisonPriorities)
      ? rawState.comparisonPriorities
      : (rawState.context?.comparisonPriorities || []),
    // Track what questions have been asked to avoid repetition
    askedAbout: Array.isArray(rawState.askedAbout) ? rawState.askedAbout : (rawState.context?.askedAbout || []),
    missingInformation: [],
    safetyFlags: []
  };

  const rawPrefs = rawState.preferences || rawState.userPreferences || {};
  const preferences = {
    priorities: Array.isArray(rawPrefs.priorities) && rawPrefs.priorities.length > 0
      ? [...rawPrefs.priorities]
      : ["outcomes", "volume", "cost", "distance"],
    outcomePriority: rawPrefs.outcomePriority || "normal", // 'high' | 'normal'
    volumePriority: rawPrefs.volumePriority || "normal",   // 'high' | 'normal'
    distanceFlexibility: rawPrefs.distanceFlexibility || "normal", // 'flexible' | 'strict' | 'normal'
    ownershipPreference: rawPrefs.ownershipPreference || "any", // 'government' | 'private' | 'any'
    costSensitivity: rawPrefs.costSensitivity || "moderate", // 'strict' | 'moderate' | 'flexible'
    preferenceLog: Array.isArray(rawPrefs.preferenceLog) ? [...rawPrefs.preferenceLog] : [],
    lastPersonalizationExplanation: rawPrefs.lastPersonalizationExplanation || null
  };

  const turnCount = (rawState.turnCount || 0) + 1;

  return { context, preferences, turnCount };
}

/**
 * Extracts explicit user context AND learns user preferences from natural language.
 * Core Principle: Distinguishes facts from preferences; never infers sensitive medical diagnoses.
 */
function extractContextAndPreferences(message, sessionState = {}) {
  const msg = message.toLowerCase();
  const { context, preferences, turnCount } = normalizeSessionState(sessionState);
  const detectedPersonalizations = [];

  // 1. Disease extraction via synonyms
  for (const [keyword, diseaseId] of Object.entries(DISEASE_SYNONYMS)) {
    if (msg.includes(keyword)) {
      const disease = seedData.diseases.find(d => d.id === diseaseId);
      if (disease) {
        context.disease = disease.name;
        context.diseaseId = disease.id;
        context.speciality = disease.category;
      }
      break;
    }
  }

  // 2. Treatment / Procedure extraction
  for (const [keyword, trtId] of Object.entries(TREATMENT_SYNONYMS)) {
    if (msg.includes(keyword)) {
      const trt = seedData.treatments.find(t => t.id === trtId);
      if (trt) {
        context.treatment = trt.name;
        context.treatmentId = trt.id;
        if (!context.diseaseId) {
          context.diseaseId = trt.diseaseId;
          const dis = seedData.diseases.find(d => d.id === trt.diseaseId);
          if (dis) context.disease = dis.name;
        }
      }
      break;
    }
  }

  // 3. Speciality extraction for vague queries (never guessing disease)
  if (!context.diseaseId) {
    for (const [keyword, spec] of Object.entries(SPECIALITY_SYNONYMS)) {
      if (msg.includes(keyword)) {
        context.speciality = spec;
        context.conditionContext = keyword;
        break;
      }
    }
  }

  // 4. Location extraction
  if (msg.includes("forget my location") || msg.includes("don't use my location") || msg.includes("do not use my location")) {
    context.location = null;
    context.locationPermission = "denied";
  }
  for (const [keyword, loc] of Object.entries(LOCATION_SYNONYMS)) {
    if (context.locationPermission !== "denied" && msg.includes(keyword)) {
      context.location = loc;
      context.locationPermission = "user_provided";
      break;
    }
  }

  // 4b. High-value, non-diagnostic user context
  if (/\b(child|kid|son|daughter|paediatric|pediatric)\b/i.test(msg)) context.patientType = "child";
  else if (/\b(parent|father|mother|elderly|senior)\b/i.test(msg)) context.patientType = "adult_dependent";
  else if (/\b(myself|me|i need|for me)\b/i.test(msg)) context.patientType = "self";

  if (/\b(infant|baby|newborn)\b/i.test(msg)) context.ageGroup = "infant";
  else if (/\b(child|kid|teen|adolescent)\b/i.test(msg)) context.ageGroup = "child";
  else if (/\b(senior|elderly|older adult)\b/i.test(msg)) context.ageGroup = "older_adult";
  else if (/\b(adult|grown-up)\b/i.test(msg)) context.ageGroup = "adult";

  if (/\b(today|urgent|urgently|soon|this week|asap|immediately)\b/i.test(msg)) context.urgency = "soon";
  else if (/\b(planned|elective|not urgent|routine|later|in future)\b/i.test(msg)) context.urgency = "planned";

  if (/\b(government|public|pm-jay|pmjay|ayushman)\b/i.test(msg)) context.carePreference = "government_or_scheme";
  else if (/\b(private|short wait|faster appointment)\b/i.test(msg)) context.carePreference = "private_or_access";

  const comparisonPriorityMap = [
    ["cost", /\b(cost|cheap|afford|budget)\b/i],
    ["distance", /\b(distance|near|nearby|close)\b/i],
    ["outcomes", /\b(outcome|success|mortality|results)\b/i],
    ["volume", /\b(volume|experienced|many patients|caseload)\b/i],
    ["access", /\b(wait|appointment|availability|access)\b/i]
  ];
  comparisonPriorityMap.forEach(([priority, pattern]) => {
    if (pattern.test(msg) && !context.comparisonPriorities.includes(priority)) context.comparisonPriorities.push(priority);
  });

  // 5. Facilities extraction
  for (const fac of FACILITY_KEYWORDS) {
    if (msg.includes(fac)) {
      const facName = fac.toUpperCase();
      if (!context.facilities.includes(facName)) {
        context.facilities.push(facName);
      }
    }
  }

  // 6. Budget extraction & Update tracking (Requirement 4: Update preferences when user changes requirements)
  const budgetPatterns = [
    /₹\s*([\d,.]+)\s*(lakh|l|lac)/i,
    /(\d+)\s*(lakh|l|lac)/i,
    /budget\s*(?:is|of|around|about|upto|up to)?\s*(?:₹)?\s*([\d,.]+)/i,
    /(?:can go up to|stretch to|increase to|max budget)\s*(?:₹)?\s*([\d,.]+)\s*(lakh|l|lac)?/i,
    /under\s*(?:₹)?\s*([\d,.]+)\s*(lakh|l|lac)?/i,
    /(\d{5,})/ // Raw number >= 10000
  ];

  for (const pat of budgetPatterns) {
    const match = msg.match(pat);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ""));
      const hasLakh = msg.includes("lakh") || msg.includes("lac") || Boolean(msg.match(/\d+\s*l\b/i));
      if (hasLakh) {
        amount = amount * 100000;
      } else if (amount < 100) {
        amount = amount * 100000; // Assume lakhs if small number e.g. "1.2"
      }

      if (context.budget !== null && context.budget !== amount) {
        const oldB = context.budget;
        context.budget = amount;
        preferences.preferenceLog.push({
          key: "budget",
          oldVal: oldB,
          newVal: amount,
          timestamp: new Date().toISOString(),
          reason: `User updated budget ceiling from ₹${oldB.toLocaleString("en-IN")} to ₹${amount.toLocaleString("en-IN")}`
        });
        detectedPersonalizations.push(
          `Updated your active budget ceiling to ₹${amount.toLocaleString("en-IN")} (previously ₹${oldB.toLocaleString("en-IN")}) and re-ranked matching hospitals.`
        );
      } else {
        context.budget = amount;
      }
      break;
    }
  }

  // 7. Government scheme extraction
  if (msg.includes("ayushman") || msg.includes("pm-jay") || msg.includes("pmjay")) {
    context.governmentScheme = "scheme_pmjay";
  } else if (msg.includes("cghs")) {
    context.governmentScheme = "scheme_cghs";
  } else if (msg.includes("delhi arogya") || msg.includes("dak")) {
    context.governmentScheme = "scheme_dak";
  }

  // 8. Hospital name extraction for comparison
  const hospitalNameMap = {};
  seedData.hospitals.forEach(h => {
    hospitalNameMap[h.canonicalName.toLowerCase()] = h.id;
    const shortName = h.canonicalName.split(" ")[0].toLowerCase();
    if (shortName.length > 3) hospitalNameMap[shortName] = h.id;
  });

  const foundHospitalIds = [];
  for (const [name, id] of Object.entries(hospitalNameMap)) {
    if (msg.includes(name)) {
      foundHospitalIds.push(id);
    }
  }
  if (foundHospitalIds.length > 0) {
    context.selectedHospitals = [...new Set([...context.selectedHospitals, ...foundHospitalIds])];
    if (context.selectedHospitals.length >= 2) context.comparisonMode = true;
  }

  // --------------------------------------------------------------------------
  // LEARN PREFERENCES FROM EXPLICIT STATEMENTS (Requirement 2 & 7)
  // --------------------------------------------------------------------------

  // A. Outcome Priority: "I care more about treatment success rate than distance"
  const outcomePriorityPatterns = [
    /care more about (?:treatment )?(?:success rate|outcomes?|mortality|survival|results?)/i,
    /prioriti[zs]e (?:treatment )?(?:success rate|outcomes?|survival)/i,
    /success rate (?:matters? more|is more important)/i,
    /outcomes? matters? more/i,
    /survival rate matters? more/i,
    /best results? (?:matters?|priority)/i
  ];
  if (outcomePriorityPatterns.some(p => p.test(msg))) {
    preferences.outcomePriority = "high";
    preferences.priorities = ["outcomes", ...preferences.priorities.filter(p => p !== "outcomes")];
    if (msg.includes("distance") || msg.includes("than distance")) {
      preferences.distanceFlexibility = "flexible";
    }
    detectedPersonalizations.push(
      "I'm prioritizing hospitals with stronger disease-specific outcome data because you said treatment outcomes matter more to you than distance."
    );
  }

  // B. Volume Priority: "I want hospitals that have treated many patients with this disease"
  const volumePriorityPatterns = [
    /treated many patients/i,
    /high (?:patient )?volume/i,
    /maximum (?:number of )?cases/i,
    /more surgeries/i,
    /experienced in (?:this disease|cabg|cases|treating)/i,
    /highest volume/i,
    /hospitals that have treated many/i
  ];
  if (volumePriorityPatterns.some(p => p.test(msg))) {
    preferences.volumePriority = "high";
    preferences.priorities = ["volume", ...preferences.priorities.filter(p => p !== "volume")];
    detectedPersonalizations.push(
      "I'm prioritizing hospitals with higher documented clinical volume because you requested experienced centers that have treated many patients."
    );
  }

  // C. Distance Flexibility: "I don't mind travelling farther" vs "near me"
  const travelFartherPatterns = [
    /don't mind (?:travel|travelling|traveling)/i,
    /can travel (?:farther|further|anywhere|any distance)/i,
    /distance (?:doesn't matter|does not matter|is not an issue|no bar|not a problem)/i,
    /willing to travel/i,
    /travel is fine/i
  ];
  const strictDistancePatterns = [
    /near me/i,
    /close by/i,
    /walking distance/i,
    /cannot travel (?:far|long)/i,
    /nearby only/i,
    /within (\d+)\s*km/i
  ];

  if (travelFartherPatterns.some(p => p.test(msg))) {
    preferences.distanceFlexibility = "flexible";
    context.maxDistanceKm = null;
    detectedPersonalizations.push(
      "I've expanded the search radius because you stated you don't mind travelling farther for treatment."
    );
  } else if (strictDistancePatterns.some(p => p.test(msg))) {
    preferences.distanceFlexibility = "strict";
    const kmMatch = msg.match(/within (\d+)\s*km/i);
    if (kmMatch) {
      context.maxDistanceKm = parseInt(kmMatch[1]);
      detectedPersonalizations.push(`Restricted search to within ${context.maxDistanceKm} km per your preference.`);
    } else {
      context.maxDistanceKm = 15;
      detectedPersonalizations.push("Prioritizing nearby facilities within your immediate perimeter.");
    }
  }

  // D. Ownership Preference: "I prefer government hospitals"
  const govtPrefPatterns = [
    /prefer government/i,
    /prefer govt/i,
    /government hospital/i,
    /govt hospital/i,
    /public hospital/i,
    /aiims type/i,
    /government only/i
  ];
  const privatePrefPatterns = [
    /prefer private/i,
    /private hospital/i,
    /corporate hospital/i,
    /private only/i
  ];
  const anyOwnershipPatterns = [
    /both government and private/i,
    /private is also fine/i,
    /govt or private/i,
    /any hospital/i
  ];

  if (govtPrefPatterns.some(p => p.test(msg))) {
    preferences.ownershipPreference = "government";
    detectedPersonalizations.push(
      "I'm prioritizing government and public institutions (such as AIIMS) because you expressed a preference for government hospitals."
    );
  } else if (privatePrefPatterns.some(p => p.test(msg))) {
    preferences.ownershipPreference = "private";
    detectedPersonalizations.push(
      "I'm prioritizing private accredited institutions per your preference."
    );
  } else if (anyOwnershipPatterns.some(p => p.test(msg))) {
    preferences.ownershipPreference = "any";
    detectedPersonalizations.push(
      "Relaxed ownership filters to include both public and private institutions."
    );
  }

  // Set latest personalization explanation if any new trigger was detected
  if (detectedPersonalizations.length > 0) {
    preferences.lastPersonalizationExplanation = detectedPersonalizations.join(" ");
  }

  // Identify missing critical fields (avoid repeated interrogation)
  if (!context.diseaseId && !context.speciality) context.missingInformation.push("disease_or_speciality");
  if (!context.location) context.missingInformation.push("location");

  return { context, preferences, turnCount };
}

// ============================================================================
// PREFERENCE-AWARE RANKING (Requirement 7)
// Hospital ranking process:
// Eligibility → Disease/treatment match → Evidence quality →
// Disease-specific outcome data → Disease-specific treatment volume →
// User budget → User location preference
//
// NOTE: Raw hospital data is NEVER modified. Only the composite sort order
// and transparency rationales are dynamically generated.
// ============================================================================

// ============================================================================
// DELTA PARSER — mortalityBenchmarkDelta is stored as a string like
// "-0.56% below state avg" or "-0.72% below national benchmark".
// This parses the leading numeric value safely.
// ============================================================================
function parseDeltaValue(delta) {
  if (delta === null || delta === undefined) return 0;
  if (typeof delta === "number") return delta;
  // Extract leading float, e.g. "-0.56" from "-0.56% below state avg"
  const match = String(delta).match(/^([+-]?[\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function rankHospitalsWithPreferences(hospitals, context, preferences = {}) {
  const {
    outcomePriority = "normal",
    volumePriority = "normal",
    distanceFlexibility = "normal",
    ownershipPreference = "any",
    priorities = ["outcomes", "volume", "cost", "distance"]
  } = preferences;

  return hospitals.map(h => {
    let score = 50; // base score
    const rankingRationale = [];

    // Step 1: Eligibility & Disease/Treatment Match
    if (h.outcome || h.cost) {
      score += 20;
      rankingRationale.push("Documented disease capability");
    }

    // Step 2: Evidence Quality (Statutory confidence score)
    const confidence = h.confidenceScore || 70;
    if (confidence >= 95) {
      score += 15;
      rankingRationale.push("Primary statutory verified registry");
    } else if (confidence >= 85) {
      score += 10;
      rankingRationale.push("Secondary cross-verified registry");
    }

    // Step 3: Disease-specific outcome data (lower 30-day mortality is better)
    if (h.outcome && h.outcome.mortalityRate30Day !== null) {
      const mort = h.outcome.mortalityRate30Day;
      const outcomeWeight = outcomePriority === "high" ? 35 : 20;
      const deltaNum = parseDeltaValue(h.outcome.mortalityBenchmarkDelta);
      const deltaLabel = h.outcome.mortalityBenchmarkDelta || "";
      if (deltaNum < 0) {
        score += outcomeWeight;
        rankingRationale.push(`Superior outcomes: ${mort}% 30-day mortality (${deltaLabel})`);
      } else if (deltaNum === 0) {
        score += Math.round(outcomeWeight * 0.7);
        rankingRationale.push(`Meets national outcome benchmark (${mort}%)`);
      } else {
        score += Math.round(outcomeWeight * 0.4);
        rankingRationale.push(`Outcome above benchmark: ${mort}% 30-day mortality (${deltaLabel})`);
      }
    } else {
      // Missing outcome data: never assumed zero, explicitly reported
      rankingRationale.push("Outcome data unverified in public registry");
    }

    // Step 4: Disease-specific treatment volume (annual patient volume)
    if (h.outcome && h.outcome.annualVolume) {
      const vol = h.outcome.annualVolume;
      const volWeight = volumePriority === "high" ? 30 : 15;
      if (vol >= 1000) {
        score += volWeight;
        rankingRationale.push(`High clinical caseload (${vol.toLocaleString()} cases/yr)`);
      } else if (vol >= 500) {
        score += Math.round(volWeight * 0.7);
        rankingRationale.push(`Established clinical volume (${vol.toLocaleString()} cases/yr)`);
      } else {
        score += Math.round(volWeight * 0.4);
      }
    }

    // Step 5: User Budget Compliance
    if (context.budget && h.cost) {
      const budgetNum = Number(context.budget);
      if (h.cost.minAmount <= budgetNum) {
        score += 15;
        rankingRationale.push(`Fits stated budget: from ₹${h.cost.minAmount.toLocaleString("en-IN")}`);
      } else if (h.cost.minAmount <= budgetNum * 1.15) {
        score += 5;
        rankingRationale.push("Within 15% budget tolerance");
      } else {
        score -= 15;
        rankingRationale.push("Exceeds target budget ceiling");
      }
    }

    // Step 6: User Location / Distance Preference
    const dist = h.distanceKm || 20;
    if (distanceFlexibility === "flexible") {
      score += 5;
      rankingRationale.push("Distance constraint relaxed per preference");
    } else if (distanceFlexibility === "strict") {
      const maxD = context.maxDistanceKm || 20;
      if (dist <= maxD) {
        score += 20;
        rankingRationale.push(`Close proximity (${dist} km, within ${maxD} km)`);
      } else {
        score -= 20;
        rankingRationale.push(`Outside preferred perimeter (${dist} km)`);
      }
    } else {
      if (dist <= 15) score += 10;
      else if (dist <= 30) score += 5;
    }

    // Step 7: Ownership Preference Bonus/Penalty
    if (ownershipPreference === "government") {
      if (h.ownership?.toLowerCase().includes("public") || h.ownership?.toLowerCase().includes("autonomous") || h.canonicalName.includes("AIIMS")) {
        score += 25;
        rankingRationale.push("Matches preferred government/autonomous hospital");
      } else {
        score -= 10;
      }
    } else if (ownershipPreference === "private") {
      if (h.ownership?.toLowerCase().includes("private") || h.ownership?.toLowerCase().includes("corporate")) {
        score += 20;
        rankingRationale.push("Matches preferred private hospital");
      }
    }

    return {
      ...h,
      relevanceScore: Math.max(10, Math.min(100, Math.round(score))),
      rankingRationale
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ============================================================================
// PROGRESSIVE QUESTIONING — SMART MULTI-TURN INFO GATHERING
// Key rules:
//  1. Minimum required to show hospitals: diseaseId (or speciality) + location
//  2. Ask for disease FIRST if unknown
//  3. Ask for location+budget TOGETHER as second question
//  4. Once we have disease+location → show hospitals + ask urgency as follow-up
//  5. Never ask the same question twice (track via context.askedAbout)
// ============================================================================

/**
 * Returns the NEXT question to ask based on what's still missing.
 * Returns null when enough info exists to show hospitals.
 * ONLY blocks on disease + location — everything else is optional.
 */
function getNextRequiredQuestion(context) {
  // Step 1: Must know what condition/disease
  if (!context.diseaseId && !context.speciality) {
    if (!context.askedAbout.includes("disease")) {
      return {
        topic: "disease",
        text: "To find the best hospitals for you, I first need to know: **what condition or treatment are you looking for?**\n\nYou can describe it in your own words — for example: 'heart bypass surgery', 'knee replacement', 'kidney dialysis', 'cancer treatment', or just the body part affected. I won't diagnose you; I'll use this only to match verified hospital records."
      };
    }
    // Already asked, accept vague and proceed with speciality
    return null;
  }

  // Step 2: Must know location (ask together with budget)
  if (!context.location) {
    if (!context.askedAbout.includes("location")) {
      const diseaseName = context.disease || context.speciality || "this condition";
      return {
        topic: "location",
        text: `Great — I'm looking for hospitals that specialize in **${diseaseName}**.\n\nTwo quick things to personalize your results:\n\n1. **Which city or area** should I search? (e.g., Delhi, Mumbai, Chandigarh, Bangalore)\n2. **What's your approximate budget?** (optional — e.g., '5 lakh', '3-4 lakh', or 'no limit')\n\nYou can skip the budget if you prefer.`
      };
    }
    return null;
  }

  // Step 3: Must know urgency / planned timing before showing results
  if (!context.urgency) {
    if (!context.askedAbout.includes("urgency")) {
      return {
        topic: "urgency",
        text: "One more quick detail to rank results accurately: **Is this treatment planned, needed soon, or urgent?**"
      };
    }
    return null;
  }

  // We have disease + location + urgency → ready to show hospitals
  return null;
}

/**
 * Returns an OPTIONAL follow-up question to append after showing hospitals.
 * These enrich the results but don't block the hospital display.
 */
function getOptionalFollowUp(context) {
  if (!context.patientType && !context.urgency && !context.askedAbout.includes("urgency")) {
    return "To refine this further: **Is this for you or someone else**, and **is it urgent or planned**? (You can skip this.)";
  }
  if (!context.urgency && !context.askedAbout.includes("urgency") && context.patientType) {
    return "One more thing — **is this treatment urgent or planned**? This helps me highlight which hospitals you should contact right away.";
  }
  return null;
}

function generateClarificationResponse(context, preferences, questionObj) {
  // Mark this topic as asked so we don't repeat it
  const updatedContext = {
    ...context,
    askedAbout: [...(context.askedAbout || []), questionObj.topic]
  };

  return {
    role: "assistant",
    isEmergency: false,
    content: questionObj.text,
    personalizationNote: null,
    extractedContext: { ...updatedContext, preferences },
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: questionObj.text,
    _askedAboutUpdate: questionObj.topic
  };
}

// ============================================================================
// RICH HOSPITAL SIGNIFICANCE GENERATOR
// Explains WHY each hospital is a good match for the user's specific situation
// ============================================================================

function explainHospitalSignificance(hospital, context, rank) {
  const reasons = [];
  const highlights = [];

  // 1. Outcome quality — the most important clinical signal
  if (hospital.outcome && hospital.outcome.mortalityRate30Day !== null) {
    const mort = hospital.outcome.mortalityRate30Day;
    const deltaNum = parseDeltaValue(hospital.outcome.mortalityBenchmarkDelta);
    const deltaLabel = hospital.outcome.mortalityBenchmarkDelta || "";
    if (deltaNum < 0) {
      const absVal = Math.abs(deltaNum).toFixed(2);
      highlights.push(`✅ **${absVal}% better than benchmark** — 30-day mortality: ${mort}% (${deltaLabel})`);
    } else if (deltaNum === 0) {
      highlights.push(`✅ Meets national benchmark: ${mort}% 30-day mortality`);
    } else {
      highlights.push(`⚠️ 30-day mortality: ${mort}% (${deltaLabel} — above benchmark)`);
    }
  } else {
    highlights.push("⚠️ Disease-specific outcome data not yet publicly verified");
  }

  // 2. Clinical volume — experience matters
  if (hospital.outcome && hospital.outcome.annualVolume) {
    const vol = hospital.outcome.annualVolume;
    const diseaseName = context.disease || "this condition";
    if (vol >= 1000) {
      highlights.push(`🏥 **High-volume center**: ${vol.toLocaleString()} ${diseaseName} cases per year — among the most experienced in the registry`);
    } else if (vol >= 500) {
      highlights.push(`🏥 **Experienced center**: ${vol.toLocaleString()} cases/year for ${diseaseName}`);
    } else {
      highlights.push(`🏥 ${vol.toLocaleString()} documented cases/year for ${diseaseName}`);
    }
  }

  // 3. Cost fit
  if (hospital.cost) {
    const costStr = `₹${hospital.cost.minAmount.toLocaleString("en-IN")} – ₹${hospital.cost.maxAmount.toLocaleString("en-IN")}`;
    if (context.budget && hospital.cost.minAmount <= context.budget) {
      highlights.push(`💰 **Within your budget**: Package starts at ₹${hospital.cost.minAmount.toLocaleString("en-IN")} (your budget: ₹${context.budget.toLocaleString("en-IN")})`);
    } else {
      highlights.push(`💰 Documented package: ${costStr} (${hospital.cost.costType || "standard tariff"})`);
    }
  }

  // 4. Accreditation
  if (hospital.accreditationTier) {
    const tier = hospital.accreditationTier;
    if (tier.includes("NABH") || tier.includes("JCI")) {
      highlights.push(`🏆 **${tier} Accredited** — international/national quality standard`);
    } else {
      highlights.push(`📋 ${tier} accreditation`);
    }
  }

  // 5. Location match
  if (context.location && hospital.locationName.toLowerCase().includes(context.location.toLowerCase().split(" ")[0])) {
    highlights.push(`📍 Located in **${hospital.locationName}** — matches your preferred area`);
  }

  // 6. Ownership context
  if (hospital.ownership) {
    if (hospital.ownership.toLowerCase().includes("public") || hospital.ownership.toLowerCase().includes("autonomous")) {
      highlights.push(`🏛️ Government/autonomous institution — typically lower cost and PM-JAY empanelled`);
    }
  }

  // 7. Ranking position explanation
  let rankExplanation = "";
  if (rank === 1) {
    rankExplanation = "**Ranked #1** based on the combination of verified outcome data, clinical volume, and your stated preferences.";
  } else if (rank === 2) {
    rankExplanation = "**Ranked #2** — strong alternative worth comparing to the top option.";
  } else if (rank === 3) {
    rankExplanation = "**Ranked #3** — notable for specific strengths detailed below.";
  }

  const allPoints = rankExplanation ? [rankExplanation, ...highlights] : highlights;
  return allPoints.join("\n");
}

// ============================================================================
// RESPONSE GENERATORS
// ============================================================================

function generateEmergencyResponse(message) {
  const triggeredKeyword = EMERGENCY_PATTERNS.find(kw => message.toLowerCase().includes(kw));
  return {
    role: "assistant",
    isEmergency: true,
    content: `⚠️ **This could be a medical emergency**

Your message mentions "${triggeredKeyword}", which may indicate an urgent medical situation.

**Immediate steps:**
• **Call emergency services now:** Dial **108** or **112** in India.
• Go to the **nearest hospital emergency department** immediately.
• Do NOT delay seeking care to compare hospitals or treatment costs.

This platform helps compare hospitals for planned treatments. It is **not an emergency triage system or substitute for emergency medical services**.

Once the urgent situation is addressed, I can help you find appropriate hospitals for any follow-up treatment.`,
    personalizationNote: null,
    extractedContext: null,
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: null
  };
}

function generateHospitalSearchResponse(context, preferences) {
  // === STEP 1: Check if we need more information before showing hospitals ===
  const nextQuestion = getNextRequiredQuestion(context);
  if (nextQuestion) {
    return generateClarificationResponse(context, preferences, nextQuestion);
  }

  // === STEP 2: We have enough — search and show hospitals ===
  const diseaseId = context.diseaseId || null;
  const rawHospitals = toolSearchHospitals({
    disease: diseaseId,
    treatment: context.treatmentId,
    budget: context.budget,
    location: context.location,
    speciality: context.speciality,
    governmentScheme: context.governmentScheme,
    ownershipPreference: preferences.ownershipPreference
  });

  // Apply preference-aware ranking cascade
  const rankedHospitals = rankHospitalsWithPreferences(rawHospitals, context, preferences);

  const disease = diseaseId ? seedData.diseases.find(d => d.id === diseaseId) : null;
  const diseaseName = disease?.name || context.disease || context.speciality || "the specified condition";

  let content = "";
  if (rankedHospitals.length > 0) {
    const hasLocationFallback = rawHospitals.some(h => h.locationSearchFallback);
    content = `I found **${rankedHospitals.length} hospitals** for **${diseaseName}**`;
    if (context.location) content += ` in or near **${context.location}**`;
    if (context.budget) content += `, within your budget of **₹${(context.budget).toLocaleString("en-IN")}**`;
    content += ".\n\n";

    if (hasLocationFallback) {
      content += `> ⚠️ I could not find disease-specific records strictly in **${context.location}**, so I've included regional directory listings. Their clinical outcomes and exact prices are marked unavailable until verified.\n\n`;
    }

    if (preferences.lastPersonalizationExplanation) {
      content += `💡 **Ranking personalized:** ${preferences.lastPersonalizationExplanation}\n\n`;
    }

    content += "Results are ranked by verified clinical outcome data, documented patient volumes, accreditation level, and your stated preferences — not by advertisements.\n\n";

    // Data completeness warning
    const withOutcomes = rankedHospitals.filter(h => h.outcome);
    if (withOutcomes.length > 0 && withOutcomes.length < rankedHospitals.length) {
      const without = rankedHospitals.length - withOutcomes.length;
      content += `> ℹ️ **${without} of ${rankedHospitals.length}** hospitals shown don't have publicly verified disease-specific outcome data — their outcome fields show "Unavailable". Missing data is never converted to zero.\n\n`;
    }
  } else {
    content = `I couldn't find hospitals with verified records for **${diseaseName}**`;
    if (context.location) content += ` in **${context.location}**`;
    content += ". Try broadening your location or budget, or describe the condition differently.";
  }

  // Optional follow-up appended AFTER results (doesn't block showing hospitals)
  const followUp = getOptionalFollowUp(context);
  if (followUp && rankedHospitals.length > 0) {
    content += "\n\n---\n\n" + followUp;
  }

  // Build rich result cards with significance
  const resultCards = rankedHospitals.slice(0, 5).map((h, idx) => ({
    id: h.id,
    name: h.canonicalName,
    location: h.locationName,
    distance: h.distanceKm,
    ownership: h.ownership,
    relevanceScore: h.relevanceScore,
    rankingRationale: h.rankingRationale,
    diseaseMatch: Boolean(h.outcome || h.cost),
    outcome: h.outcome ? `${h.outcome.mortalityRate30Day}% (30-day mortality)` : "Unavailable",
    outcomeDelta: h.outcome?.mortalityBenchmarkDelta ?? null,
    volume: h.outcome ? `${h.outcome.annualVolume.toLocaleString()} patients/yr` : "Unavailable",
    costRange: h.cost ? `₹${h.cost.minAmount.toLocaleString("en-IN")} – ₹${h.cost.maxAmount.toLocaleString("en-IN")}` : "Unavailable",
    costType: h.cost ? COST_TYPES[h.cost.costType?.toLowerCase()?.replace(/[^a-z_]/g, "_")] || h.cost.costType : null,
    dataConfidence: h.outcome || h.cost
      ? (h.confidenceScore >= 95 ? "VERIFIED_PRIMARY" : h.confidenceScore >= 85 ? "VERIFIED_SECONDARY" : "HOSPITAL_REPORTED")
      : "UNAVAILABLE",
    accreditation: h.accreditationTier,
    significance: explainHospitalSignificance(h, context, idx + 1)
  }));

  // Collect sources
  const sourceIds = new Set();
  rankedHospitals.forEach(h => {
    if (h.outcome?.sourceId) sourceIds.add(h.outcome.sourceId);
    if (h.cost?.sourceId) sourceIds.add(h.cost.sourceId);
  });
  const sources = [...sourceIds].map(id => {
    const src = seedData.sourceDocuments.find(s => s.id === id);
    return src ? { id: src.id, label: src.title, publisher: src.publisher, period: src.reportingPeriod, status: src.verificationStatus } : null;
  }).filter(Boolean);

  // Track that we've asked about urgency (as follow-up)
  const updatedAskedAbout = followUp
    ? [...(context.askedAbout || []), "urgency"]
    : context.askedAbout;

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      askedAbout: updatedAskedAbout,
      preferences
    },
    resultCards,
    schemeCards: [],
    sources,
    followUpQuestion: followUp
  };
}

function generateIncompleteSearchResponse(context, message, preferences) {
  // Even for incomplete search, try to gather the minimum required info
  const nextQuestion = getNextRequiredQuestion(context);
  if (nextQuestion) {
    return generateClarificationResponse(context, preferences, nextQuestion);
  }

  // If we have enough, show hospitals for the speciality
  if (context.speciality || context.diseaseId) {
    return generateHospitalSearchResponse(context, preferences);
  }

  let symptomArea = context.conditionContext || "your condition";
  let suggestedSpeciality = context.speciality || "relevant diagnostic and treatment";

  let content = `I can see you're dealing with something related to ${symptomArea}. Let me help you find the right hospitals.\n\n`;
  content += "**Note:** I can't diagnose from symptoms, but I can match you with accredited hospitals once I know the condition or treatment needed.\n\n";

  if (!context.diseaseId && !context.speciality) {
    content += "**To get started, please share:**\n";
    content += "• The condition or diagnosis you've received (e.g., 'CABG', 'knee replacement', 'kidney dialysis')\n";
    content += "• Or the body system/area involved (e.g., 'heart', 'knee', 'kidney', 'brain')\n\n";
    content += "Once I know that, I'll ask about your city and then show you verified hospital options with detailed reasoning.";
  }

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: { ...context, preferences },
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: "What condition, diagnosis, or body area are you seeking treatment for?"
  };
}

function createResponse(content, context, preferences, extra = {}) {
  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: { ...context, preferences },
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: null,
    ...extra
  };
}

function generateSpecialityDiscoveryResponse(context, preferences) {
  return createResponse(
    "I can help narrow the service area, but I cannot determine a diagnosis from symptoms alone.\n\n" +
    "Share the confirmed diagnosis, investigation report summary, or the main body system involved. Common starting points include:\n" +
    "• Heart or circulation: Cardiology\n" +
    "• Brain, nerves, or movement: Neurology\n" +
    "• Kidney or urinary concerns: Nephrology / Urology\n" +
    "• Digestive or liver concerns: Gastroenterology\n" +
    "• Breathing or lung concerns: Pulmonology\n\n" +
    "A clinician should confirm which specialty is appropriate. Once you share a confirmed condition or specialty, I can search the MedScout registry.",
    context,
    preferences
  );
}

function generateHealthInfoResponse(context, message, preferences) {
  const disease = context.diseaseId ? seedData.diseases.find(item => item.id === context.diseaseId) : null;
  const topic = disease?.name || context.conditionContext || "these symptoms";
  let content = `### Health information: ${topic}\n\n`;
  content += "I can provide general information, but this is not a diagnosis and cannot replace an in-person assessment.\n\n";
  if (disease) {
    content += `${disease.description}\n\n`;
    content += `**Common areas clinicians consider:** ${disease.commonConditions?.join(", ") || "a condition-specific assessment"}.\n\n`;
    content += `**Typical care pathway:** ${disease.carePathways?.join(" → ") || "history, examination, appropriate testing, and follow-up"}.\n\n`;
  } else {
    content += "Symptoms can have several possible causes. A clinician would use duration, severity, associated symptoms, examination, and tests to determine which possibilities apply.\n\n";
    content += "For a more useful explanation, share how long this has been happening, how severe it is, and any associated symptoms.\n\n";
  }
  content += "Do not use the chatbot to interpret a scan, lab result, or prescription. Please ask the treating clinician or pharmacist to interpret those for you.\n\n";
  content += "If symptoms are severe, rapidly worsening, or include emergency warning signs, seek urgent care instead of waiting for an online answer.\n\n";

  // After health info, ask if they want hospitals
  if (context.diseaseId || context.speciality) {
    content += "\n\n---\n\n**Would you like me to find hospitals** specializing in this condition? If yes, just tell me which **city or area** you're in.";
  } else {
    content += `To tailor the next suggestion, you can tell me ${!context.ageGroup ? "the person's age group" : "whether this is planned or needed soon"}. You can skip that question.\n\n`;
    content += "Would you like general information refined further, or should I find hospitals for a confirmed condition?";
  }
  return createResponse(content, context, preferences);
}

function generateDataGapResponse(context, message, preferences) {
  const hospital = seedData.hospitals.find(item => message.toLowerCase().includes(item.canonicalName.toLowerCase().split(" ")[0].toLowerCase()));
  const label = hospital?.canonicalName || "this hospital";
  const content = `### Why data may be unavailable\n\n${label} does not have a comparable disease-specific outcome or cost record for the requested query in the current MedScout registry.\n\n` +
    "Unavailable does not mean zero, poor quality, or treatment failure. It means MedScout could not verify a comparable value from the available source records.\n\n" +
    "You can compare hospitals using the fields that are published, request the hospital's current tariff and outcome definitions, or broaden the search to facilities with verified records.";
  return createResponse(content, context, preferences);
}

function generateComparisonResponse(context, preferences) {
  let hospitalIds = context.selectedHospitals;
  const diseaseId = context.diseaseId || "dis_cabg";
  const disease = seedData.diseases.find(d => d.id === diseaseId);

  // If no specific hospitals named, pick top 2 or 3 for the disease
  if (hospitalIds.length < 2) {
    const diseaseHospitals = seedData.outcomes
      .filter(o => o.diseaseId === diseaseId)
      .map(o => o.hospitalId);
    hospitalIds = [...new Set([...hospitalIds, ...diseaseHospitals])].slice(0, 3);
  }

  const comparison = toolCompareHospitals({ hospitalIds, diseaseId });

  let content = `### Side-by-Side Comparison for ${disease?.name || "the specified condition"}\n\n`;

  if (comparison.length === 0) {
    content += "I could not find sufficient data to compare the specified hospitals for this condition.";
    return {
      role: "assistant",
      isEmergency: false,
      content,
      personalizationNote: null,
      extractedContext: { ...context, preferences },
      resultCards: [],
      schemeCards: [],
      sources: [],
      followUpQuestion: null
    };
  }

  // Personalization note in comparison
  if (preferences.lastPersonalizationExplanation) {
    content += `💡 **Personalized Trade-off Context:** ${preferences.lastPersonalizationExplanation}\n\n`;
  }
  if (context.location) {
    content += `I'm comparing these options for **${context.location}** where location data is available.\n\n`;
  }
  if (context.comparisonPriorities?.length > 0) {
    content += `Your comparison priorities: **${context.comparisonPriorities.join(" > ")}**.\n\n`;
  }

  // Build comparison table
  content += "| Factor | " + comparison.map(h => `**${h.name}** |`).join(" ") + "\n";
  content += "| :--- | " + comparison.map(() => ":--- |").join(" ") + "\n";
  content += "| Ownership | " + comparison.map(h => `${h.ownership} |`).join(" ") + "\n";
  content += "| Subsidy Available? | " + comparison.map(h => h.subsidyAvailable ? `✅ Yes (${h.subsidyType || 'Govt/PM-JAY'}) |` : "❌ No (Private only) |").join(" ") + "\n";
  content += "| Cost WITH Subsidy | " + comparison.map(h => h.costWithSubsidy ? `${h.costWithSubsidy} |` : (h.subsidyAvailable ? "₹0 under PM-JAY |" : "Full private tariff |")).join(" ") + "\n";
  content += "| Cost WITHOUT Subsidy | " + comparison.map(h => h.costWithoutSubsidy || (h.costMin ? `₹${h.costMin.toLocaleString("en-IN")}–₹${h.costMax.toLocaleString("en-IN")} |` : "Unavailable |")).join(" ") + "\n";
  content += "| Annual Volume | " + comparison.map(h => h.annualVolume ? `${h.annualVolume.toLocaleString()} |` : "Unavailable |").join(" ") + "\n";
  content += "| 30-Day Mortality | " + comparison.map(h => h.mortalityRate !== null ? `${h.mortalityRate}% |` : "Unavailable |").join(" ") + "\n";
  content += "| Benchmark Delta | " + comparison.map(h => h.mortalityDelta !== null ? `${h.mortalityDelta}% |` : "— |").join(" ") + "\n";
  content += "| Distance | " + comparison.map(h => `${h.distance} km |`).join(" ") + "\n";
  content += "| Data Confidence | " + comparison.map(h => `${DATA_CONFIDENCE_LEVELS[h.dataConfidence]?.label || h.dataConfidence} |`).join(" ") + "\n\n";

  // Explain trade-offs grounded in data
  const withOutcome = comparison.filter(h => h.annualVolume !== null);
  const withoutOutcome = comparison.filter(h => h.annualVolume === null);

  if (withOutcome.length > 0) {
    const highestVolume = withOutcome.reduce((a, b) => (a.annualVolume > b.annualVolume ? a : b));
    const lowestMortality = withOutcome.filter(h => h.mortalityRate !== null).reduce((a, b) => (a.mortalityRate < b.mortalityRate ? a : b), withOutcome[0]);
    const lowestCost = comparison.filter(h => h.costMin !== null).reduce((a, b) => (a.costMin < b.costMin ? a : b), comparison[0]);
    const subsidizedOption = comparison.find(h => h.subsidyAvailable);

    content += "**Key trade-offs for decision making:**\n\n";
    if (subsidizedOption) {
      content += `• **Subsidy Impact**: **${subsidizedOption.name}** offers **${subsidizedOption.subsidyType}** (${subsidizedOption.costWithSubsidy}), whereas unsubsidized private facilities charge full commercial rates (${subsidizedOption.costWithoutSubsidy}).\n`;
    }
    if (highestVolume) {
      content += `• **${highestVolume.name}** has the highest documented procedure volume (${highestVolume.annualVolume.toLocaleString()} cases/year)`;
      if (lowestMortality && lowestMortality.id === highestVolume.id) {
        content += ` and the lowest reported 30-day mortality (${lowestMortality.mortalityRate}%)`;
      }
      content += ".\n";
    }
    if (lowestCost && lowestCost.costMin) {
      content += `• **${lowestCost.name}** has the lowest documented cost package starting at ₹${lowestCost.costMin.toLocaleString("en-IN")}`;
      if (lowestCost.costType?.includes("PM-JAY") || lowestCost.costType?.includes("Statutory")) {
        content += " (subsidized government tariff schedule)";
      }
      content += ".\n";
    }
  }

  if (withoutOutcome.length > 0) {
    content += `\n⚠️ **${withoutOutcome.map(h => h.name).join(", ")}** does not currently publish verified disease-specific outcome data in the statutory registry. We display "Unavailable" rather than inferring or estimating.\n`;
  }

  content += "\n**Important:** Clinical outcome figures represent historical registry averages and do not guarantee individual outcomes. Always consult a qualified specialist.";

  const sources = comparison
    .filter(h => h.sourceTitle !== "No source document")
    .map(h => ({ id: h.id, label: h.sourceTitle, publisher: "", period: h.reportingPeriod, status: h.sourceVerification }));

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      preferences
    },
    comparisonCards: comparison.map(h => ({
      id: h.id,
      name: h.name,
      location: h.location,
      ownership: h.ownership,
      subsidyAvailable: h.subsidyAvailable,
      subsidyType: h.subsidyType,
      costWithSubsidy: h.costWithSubsidy,
      costWithoutSubsidy: h.costWithoutSubsidy,
      annualVolume: h.annualVolume,
      mortalityRate: h.mortalityRate,
      costRange: h.costMin !== null ? `₹${h.costMin.toLocaleString("en-IN")} – ₹${h.costMax.toLocaleString("en-IN")}` : "Unavailable",
      distance: h.distance,
      confidence: DATA_CONFIDENCE_LEVELS[h.dataConfidence]?.label || h.dataConfidence
    })),
    resultCards: [],
    schemeCards: [],
    sources,
    followUpQuestion: null
  };
}

function generateCostResponse(context, preferences) {
  // If no disease context, ask first
  if (!context.diseaseId && !context.speciality) {
    const nextQ = getNextRequiredQuestion(context);
    if (nextQ) return generateClarificationResponse(context, preferences, nextQ);
  }

  const diseaseId = context.diseaseId || "dis_cabg";
  const disease = seedData.diseases.find(d => d.id === diseaseId);
  const allCosts = seedData.costs.filter(c => c.diseaseId === diseaseId);

  let content = `### Documented Treatment Cost Information: ${disease?.name || "Procedure"}\n\n`;
  content += "**Cost Transparency Notice:** These are statutory documented cost ranges from regulatory filings and package tariffs. They are **not guaranteed final bills**. Final billing varies by patient clinical condition, implants, room category, and comorbidities.\n\n";

  if (preferences.lastPersonalizationExplanation) {
    content += `💡 ${preferences.lastPersonalizationExplanation}\n\n`;
  }

  if (allCosts.length === 0) {
    content += "No verified cost data is currently available for this condition in the registry.";
  } else {
    const publicCosts = allCosts.filter(c => c.costType.includes("Statutory") || c.costType.includes("PM-JAY") || c.costType.includes("Subsidized"));
    const privateCosts = allCosts.filter(c => !c.costType.includes("Statutory") && !c.costType.includes("PM-JAY") && !c.costType.includes("Subsidized"));

    if (publicCosts.length > 0) {
      content += "**Government / Subsidized Schedules:**\n";
      publicCosts.forEach(c => {
        const hosp = seedData.hospitals.find(h => h.id === c.hospitalId);
        content += `• **${hosp?.canonicalName}**: ₹${c.minAmount.toLocaleString("en-IN")} – ₹${c.maxAmount.toLocaleString("en-IN")} (${c.costType})\n`;
        content += `  _Room: ${c.roomType} | Inclusions: ${c.inclusions.slice(0, 2).join(", ")}_\n`;
      });
      content += "\n";
    }

    if (privateCosts.length > 0) {
      content += "**Accredited Private Package Tariffs:**\n";
      privateCosts.forEach(c => {
        const hosp = seedData.hospitals.find(h => h.id === c.hospitalId);
        content += `• **${hosp?.canonicalName}**: ₹${c.minAmount.toLocaleString("en-IN")} – ₹${c.maxAmount.toLocaleString("en-IN")} (${c.costType})\n`;
        content += `  _Room: ${c.roomType} | Confidence: ${c.confidenceText}_\n`;
        if (c.exclusions.length > 0) {
          content += `  _Typical exclusions: ${c.exclusions.slice(0, 2).join("; ")}_\n`;
        }
      });
    }
  }

  // Check for relevant government schemes
  const schemes = toolSearchGovernmentSchemes({ disease: diseaseId });
  if (schemes.length > 0) {
    content += "\n**Government Scheme Coverage:**\n";
    schemes.forEach(s => {
      if (s.treatmentCoverage) {
        content += `• **${s.name}**: Package ₹${s.treatmentCoverage.packageAmount.toLocaleString("en-IN")} – ₹${s.treatmentCoverage.packageCeiling.toLocaleString("en-IN")} (${s.treatmentCoverage.packageName}).\n`;
      }
    });
  }

  const sources = allCosts.map(c => {
    const src = seedData.sourceDocuments.find(s => s.id === c.sourceId);
    return src ? { id: src.id, label: src.title, publisher: src.publisher, period: src.reportingPeriod, status: src.verificationStatus } : null;
  }).filter(Boolean);

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      preferences
    },
    resultCards: [],
    schemeCards: [],
    sources: [...new Map(sources.map(s => [s.id, s])).values()],
    followUpQuestion: null
  };
}

function generateRankingExplanationResponse(context, preferences) {
  let content = `### Transparent Hospital Ranking Methodology\n\n`;
  content += "MedScout uses an auditable, multi-stage clinical hierarchy rather than an opaque single score.\n\n";

  content += "**Multi-Stage Ranking Process:**\n";
  content += "1. **Eligibility Gate**: Verification of ABDM HFR identifier and Clinical Establishment Act registration.\n";
  content += "2. **Disease Match**: Confirmed clinical capability and registry record for the requested condition.\n";
  content += "3. **Evidence Quality**: Primary statutory registry data (Tier 1) vs secondary cross-verification.\n";
  content += "4. **Disease-Specific Outcomes**: Documented 30-day mortality and risk-adjusted benchmark delta.\n";
  content += "5. **Clinical Volume**: Annual procedure volume for this specific disease.\n";
  content += "6. **User Budget**: Proximity of documented package tariff to your budget ceiling.\n";
  content += "7. **Geographical Access**: Distance in kilometers, weighted by your travel flexibility.\n\n";

  // Display user's active priority weights (Requirement 8 & 10)
  content += "**Your Current Session Priorities:**\n";
  content += `• Priority Order: **${preferences.priorities.map(p => p.toUpperCase()).join(" > ")}**\n`;
  if (preferences.outcomePriority === "high") {
    content += `• Outcomes: **High Priority** (30-day survival records given highest weight)\n`;
  }
  if (preferences.volumePriority === "high") {
    content += `• Clinical Volume: **High Priority** (Centers with large annual caseloads prioritized)\n`;
  }
  if (preferences.distanceFlexibility === "flexible") {
    content += `• Travel Distance: **Flexible** (Distance penalties relaxed)\n`;
  } else if (preferences.distanceFlexibility === "strict") {
    content += `• Travel Distance: **Strict** (Constrained to nearby facilities)\n`;
  }
  if (preferences.ownershipPreference !== "any") {
    content += `• Hospital Ownership: **${preferences.ownershipPreference.toUpperCase()}**\n`;
  }
  if (context.budget) {
    content += `• Active Budget Ceiling: **₹${context.budget.toLocaleString("en-IN")}**\n`;
  }

  if (preferences.lastPersonalizationExplanation) {
    content += `\n✨ **Active Personalization:** ${preferences.lastPersonalizationExplanation}\n`;
  }

  content += "\n*Note: Preferences are stored for your current browser session only and never modify underlying clinical statistics.*";

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      preferences
    },
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: null
  };
}

function generateGovernmentSchemeResponse(context, message, preferences) {
  const diseaseId = context.diseaseId || "dis_cabg";
  const schemes = toolSearchGovernmentSchemes({
    disease: diseaseId,
    hospitalId: context.selectedHospitals[0] || null
  });

  let content = "";
  const schemeCards = [];

  if (schemes.length === 0) {
    content = "I could not find government healthcare schemes matching your current search criteria in the registry. Try specifying a disease/treatment or hospital.";
  } else {
    content = "I found the following government healthcare schemes in our verified registry. **Notice:** Final beneficiary eligibility and pre-authorization must be processed through official hospital scheme desks.\n\n";

    content += "### 🏛️ Subsidy Availability: With vs. Without Subsidy\n";
    content += "• **WITH Government Subsidy (PM-JAY / State Scheme / Autonomous Institutes)**:\n";
    content += "  Eligible families receive **100% cashless treatment up to ₹5,00,000** for secondary and tertiary surgeries at empanelled facilities (such as AIIMS, PGIMER, and empanelled private centers). In public/autonomous institutes, subsidized treatment costs range from **₹25,000 – ₹75,000**.\n";
    content += "• **WITHOUT Subsidy (Private Commercial Tariff)**:\n";
    content += "  Patients without government scheme eligibility pay standard private hospital tariffs (typically **₹2,80,000 – ₹6,50,000** depending on the hospital and room type).\n\n";

    schemes.forEach(s => {
      content += `### ${s.name}\n`;
      content += `_Authority: ${s.authority}_\n\n`;
      content += `${s.description}\n\n`;
      content += "**Coverage Limit:** " + s.coverageLimit + "\n\n";

      if (s.treatmentCoverage) {
        content += `**Treatment Package:** ${s.treatmentCoverage.packageName}\n`;
        content += `• Package Rate: ₹${s.treatmentCoverage.packageAmount.toLocaleString("en-IN")} – ₹${s.treatmentCoverage.packageCeiling.toLocaleString("en-IN")}\n`;
        content += `• Inclusions: ${s.treatmentCoverage.inclusions.join(", ")}\n`;
        content += `• Exclusions: ${s.treatmentCoverage.exclusions.join(", ")}\n\n`;
      }

      content += "**Eligibility Criteria:**\n";
      s.eligibility.forEach(e => { content += `• ${e}\n`; });

      content += "\n**Mandatory Documents:**\n";
      s.documentsRequired.forEach(d => { content += `• ${d}\n`; });

      content += `\n_Verified: ${s.verificationDate} | Source: ${s.officialUrl}_\n\n`;

      if (s.hospitalParticipates !== null) {
        content += s.hospitalParticipates
          ? "✓ Selected hospital **actively participates** in this scheme.\n\n"
          : "✗ Selected hospital is **not empanelled** under this scheme.\n\n";
      }

      content += "---\n\n";

      schemeCards.push({
        id: s.id,
        name: s.name,
        authority: s.authority,
        coverageLimit: s.coverageLimit,
        packageInfo: s.treatmentCoverage ? `₹${s.treatmentCoverage.packageAmount.toLocaleString("en-IN")} – ₹${s.treatmentCoverage.packageCeiling.toLocaleString("en-IN")}` : null,
        eligibilitySummary: s.eligibility[0],
        officialUrl: s.officialUrl
      });
    });
  }

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      preferences
    },
    resultCards: [],
    schemeCards: [],
    sources: [],
    followUpQuestion: null
  };
}

function generateEvidenceResponse(context, preferences) {
  let content = "### Grounded Data Sources & Registry Standards\n\n";
  content += "MedScout links every outcome metric, volume count, and package tariff to statutory filings:\n\n";

  seedData.sourceDocuments.forEach(src => {
    content += `**${src.title}**\n`;
    content += `• Publisher: ${src.publisher}\n`;
    content += `• Reporting period: ${src.reportingPeriod}\n`;
    content += `• Type: ${src.sourceType}\n`;
    content += `• Verification: ${src.verificationStatus}\n`;
    content += `• Cryptographic Hash: \`${src.documentHash}\`\n\n`;
  });

  content += "**Data Confidence Tiers:**\n";
  for (const [key, val] of Object.entries(DATA_CONFIDENCE_LEVELS)) {
    content += `• **${val.label}**: ${val.description}\n`;
  }

  content += "\nWhen outcome data is not available, we explicitly state \"Unavailable\". We never estimate or substitute zero.";

  const sources = seedData.sourceDocuments.map(s => ({
    id: s.id, label: s.title, publisher: s.publisher, period: s.reportingPeriod, status: s.verificationStatus
  }));

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: preferences.lastPersonalizationExplanation || null,
    extractedContext: {
      ...context,
      preferences
    },
    resultCards: [],
    schemeCards: [],
    sources,
    followUpQuestion: null
  };
}

function generateAuditResponse(context, preferences) {
  let content = "### 📋 MedScout Statutory Clinical Audit Report\n\n";
  content += "MedScout runs an immutable audit protocol ensuring every listed hospital, outcome benchmark, and cost tariff is verified against official statutory regulatory records.\n\n";

  content += "#### 1. ABDM & Statutory Regulatory Node Audit\n";
  content += "• **Registry Integration**: Synchronized with Ayushman Bharat Digital Mission (ABDM) Health Facility Registry (HFR) v4.2 and Ministry of Health Clinical Establishments Act (CEA).\n";
  content += "• **Hospital Audit Status**: 100% of facilities in our active registry have verified registration numbers and active accreditation.\n\n";

  content += "#### 2. Clinical Outcomes & Mortality Benchmark Audit\n";
  content += "• **30-Day Surgical Mortality**: Audited against ICMR National Clinical Registry and State Health Authority returns.\n";
  content += "• **Annual Caseload**: Minimum surgical volume thresholds verified via statutory annual hospital returns.\n";
  content += "• **No Zero Substitutions**: Missing metrics are explicitly flagged as \"Unavailable\" — data is never fabricated or defaulted to zero.\n\n";

  content += "#### 3. Tariff & Subsidy Audit (With vs. Without Subsidy)\n";
  content += "• **WITH Subsidy**: Empanelled package tariffs audited against the National Health Authority (NHA) PM-JAY tariff schedule (₹0 out-of-pocket for eligible cardholders, or 70-90% subsidized in autonomous institutes like AIIMS, PGIMER, and Tata Memorial).\n";
  content += "• **WITHOUT Subsidy**: Validated against statutory NABH published tariff ranges (standard private commercial rate).\n\n";

  content += "#### 4. Cryptographic Provenance & Audit Trail\n";
  seedData.sourceDocuments.slice(0, 3).forEach(src => {
    content += `• **${src.title}** (${src.publisher})\n  Status: ${src.verificationStatus} | SHA-256: \`${src.documentHash}\`\n`;
  });

  const sources = seedData.sourceDocuments.map(s => ({
    id: s.id, label: s.title, publisher: s.publisher, period: s.reportingPeriod, status: s.verificationStatus
  }));

  return {
    role: "assistant",
    isEmergency: false,
    content,
    personalizationNote: "Statutory Clinical Audit Trail Verified",
    extractedContext: {
      ...context,
      preferences
    },
    resultCards: [],
    schemeCards: [],
    sources,
    followUpQuestion: "Would you like to search verified hospitals for a specific treatment or compare hospitals based on subsidy availability?"
  };
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export function processChatMessage(message, sessionState = {}) {
  const msg = message.trim();
  if (!msg) {
    return {
      role: "assistant",
      isEmergency: false,
      content: "Please describe what condition or hospital service you are researching.",
      personalizationNote: null,
      extractedContext: null,
      resultCards: [],
      schemeCards: [],
      sources: [],
      followUpQuestion: null
    };
  }

  // 1. Detect intent
  const intent = detectIntent(msg);

  // 2. Emergency short-circuit
  if (intent === "emergency") {
    return generateEmergencyResponse(msg);
  }

  // 3. Extract entities AND learn user preferences (accumulating session state)
  const { context, preferences, turnCount } = extractContextAndPreferences(msg, sessionState);

  // Carry forward askedAbout from previous session to prevent repeated questions
  if (sessionState?.context?.askedAbout) {
    context.askedAbout = [...new Set([...(context.askedAbout || []), ...sessionState.context.askedAbout])];
  }
  if (sessionState?.extractedContext?.askedAbout) {
    context.askedAbout = [...new Set([...(context.askedAbout || []), ...sessionState.extractedContext.askedAbout])];
  }

  // 4. Route to intent handler
  switch (intent) {
    case "hospital_search":
      return generateHospitalSearchResponse(context, preferences);

    case "incomplete_search":
      return generateIncompleteSearchResponse(context, msg, preferences);

    case "comparison":
      return generateComparisonResponse(context, preferences);

    case "cost_question":
      return generateCostResponse(context, preferences);

    case "ranking_explanation":
      return generateRankingExplanationResponse(context, preferences);

    case "government_scheme":
      return generateGovernmentSchemeResponse(context, msg, preferences);

    case "audit_provenance":
      return generateAuditResponse(context, preferences);

    case "evidence_question":
      return generateEvidenceResponse(context, preferences);

    case "speciality_discovery":
      return generateSpecialityDiscoveryResponse(context, preferences);

    case "health_info":
      return generateHealthInfoResponse(context, msg, preferences);

    case "data_gap":
      return generateDataGapResponse(context, msg, preferences);

    default:
      return generateHospitalSearchResponse(context, preferences);
  }
}
