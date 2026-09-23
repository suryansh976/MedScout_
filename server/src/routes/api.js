import express from "express";
import { seedData } from "../data/seedData.js";
import { processChatMessage } from "../services/chatbotEngine.js";
import { enhanceWithOpenAI, getAIStatus } from "../services/openaiChat.js";
import { optionalAuth, authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth globally so req.user is available on all routes
router.use(optionalAuth);

// Local in-memory state copy so admin actions can modify dynamically
let hospitalsState = [...seedData.hospitals];
let outcomesState = [...seedData.outcomes];
let costsState = [...seedData.costs];
let evidenceState = [...seedData.evidenceRecords];
let auditLogsState = [...seedData.auditLogs];

// Helper: assemble complete hospital profile
function enrichHospital(hosp, diseaseId = "dis_cabg", treatmentId = "trt_cabg_onpump") {
  const outcome = outcomesState.find(
    o => o.hospitalId === hosp.id && (!diseaseId || o.diseaseId === diseaseId)
  ) || null;

  const cost = costsState.find(
    c => c.hospitalId === hosp.id && (!diseaseId || c.diseaseId === diseaseId)
  ) || null;

  const sources = seedData.sourceDocuments.filter(
    s => (outcome && outcome.sourceId === s.id) || (cost && cost.sourceId === s.id)
  );

  return {
    ...hosp,
    supportedDiseases: (hosp.supportedDiseaseIds || []).map(id => seedData.diseases.find(item => item.id === id)?.name || id),
    evidenceStatus: hosp.capabilityStatus || "EVIDENCE_BACKED",
    outcome,
    cost,
    sources
  };
}

// 1. GET /api/hospitals - list and filter
router.get("/hospitals", (req, res) => {
  const { disease, treatment, maxBudget, accreditation, query, location, speciality, maxDistance, sortBy } = req.query;
  const matchedDisease = disease && seedData.diseases.find(item =>
    item.id === disease || item.name.toLowerCase() === disease.toLowerCase()
  );
  const diseaseId = matchedDisease?.id || disease;

  let results = hospitalsState
    .filter(h => !diseaseId || h.supportedDiseaseIds?.includes(diseaseId) || !h.supportedDiseaseIds)
    .map(h => enrichHospital(h, diseaseId || "dis_cabg", treatment || "trt_cabg_onpump"));

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(h =>
      h.canonicalName.toLowerCase().includes(q) ||
      (h.locationName || "").toLowerCase().includes(q) ||
      (h.city || "").toLowerCase().includes(q) ||
      (h.specialities || []).some(s => s.toLowerCase().includes(q))
    );
  }

  if (location) {
    const loc = location.toLowerCase();
    results = results.filter(h =>
      (h.locationName || "").toLowerCase().includes(loc) ||
      (h.city || "").toLowerCase().includes(loc) ||
      (h.state || "").toLowerCase().includes(loc)
    );
  }

  if (speciality) {
    const spec = speciality.toLowerCase();
    results = results.filter(h =>
      (h.specialities || []).some(s => s.toLowerCase().includes(spec)) ||
      (h.specialityFocus || "").toLowerCase().includes(spec)
    );
  }

  if (maxDistance) {
    const distanceLimit = Number(maxDistance);
    if (!Number.isNaN(distanceLimit)) {
      results = results.filter(h => Number(h.distanceKm || 9999) <= distanceLimit);
    }
  }

  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    results = results.filter(h => !h.cost || h.cost.minAmount <= budgetNum);
  }

  if (accreditation && accreditation !== "all") {
    results = results.filter(h =>
      (h.accreditationTier || "").toLowerCase().includes(accreditation.toLowerCase()) ||
      (h.accreditations || []).some(a => a.toLowerCase().includes(accreditation.toLowerCase()))
    );
  }

  const sortKey = String(sortBy || "successRate").toLowerCase();
  const sortedResults = [...results].sort((a, b) => {
    if (sortKey === "distance") return Number(a.distanceKm || 9999) - Number(b.distanceKm || 9999);
    if (sortKey === "cost") {
      const costA = a.cost ? Number(a.cost.averageAmount || a.cost.maxAmount || 0) : Number.MAX_SAFE_INTEGER;
      const costB = b.cost ? Number(b.cost.averageAmount || b.cost.maxAmount || 0) : Number.MAX_SAFE_INTEGER;
      return costA - costB;
    }
    if (sortKey === "specialist") {
      const aMatch = (a.specialities || []).length + (a.specialityFocus ? 1 : 0);
      const bMatch = (b.specialities || []).length + (b.specialityFocus ? 1 : 0);
      return bMatch - aMatch;
    }
    const aScore = Number(a.successRate || a.confidenceScore || 0);
    const bScore = Number(b.successRate || b.confidenceScore || 0);
    return bScore - aScore;
  });

  res.json({
    success: true,
    total: sortedResults.length,
    data: sortedResults
  });
});

const HOSPITAL_ID_ALIASES = {
  "demo-apollo-delhi": "hosp_apollo_indraprastha",
  "demo-fortis-delhi": "hosp_fortis_escorts",
  "demo-fortis-gurugram": "hosp_fortis_memorial_gurgaon",
  "demo-medanta-gurugram": "hosp_medanta_gurgaon",
  "demo-medicos-centre": "hosp_medicos_chandigarh",
  "demo-shakuntala-devi-vig": "hosp_shakuntala_devi_jalandhar",
  "demo-satyam-trauma": "hosp_satyam_jalandhar",
  "demo-fortis-rajan-dhall": "hosp_fortis_vasant_kunj",
  "demo-max-gurugram": "hosp_max_gurgaon",
  "demo-tata-mumbai": "hosp_tata_memorial",
  "demo-blk-memorial": "hosp_blk_memorial",
  "demo-moolchand-medicity": "hosp_moolchand_medicity"
};

// Helper: find hospital by exact, alias, or normalized ID (supports hosp_ and demo- formats)
function findHospitalById(paramId) {
  if (!paramId) return null;
  const cleanId = String(paramId).trim().toLowerCase();

  // 1. Alias lookup
  if (HOSPITAL_ID_ALIASES[cleanId]) {
    const aliased = hospitalsState.find(h => h.id === HOSPITAL_ID_ALIASES[cleanId]);
    if (aliased) return aliased;
  }

  // 2. Direct match
  const found = hospitalsState.find(h => h.id.toLowerCase() === cleanId);
  if (found) return found;

  // 3. Normalized match: strip hosp_ or demo- and all hyphens/underscores
  const normalizedTarget = cleanId.replace(/^(demo[-_]|hosp[-_])/, "").replace(/[-_]/g, "");
  return hospitalsState.find(h => {
    const norm = h.id.toLowerCase().replace(/^(demo[-_]|hosp[-_])/, "").replace(/[-_]/g, "");
    return norm === normalizedTarget;
  }) || null;
}

// 2. GET /api/hospitals/:id - single profile
router.get("/hospitals/:id", (req, res) => {
  const hospital = findHospitalById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, error: "Hospital not found in registry" });
  }

  const allOutcomes = outcomesState.filter(o => o.hospitalId === hospital.id);
  const allCosts = costsState.filter(c => c.hospitalId === hospital.id);
  const relevantSources = seedData.sourceDocuments.filter(s =>
    allOutcomes.some(o => o.sourceId === s.id) || allCosts.some(c => c.sourceId === s.id)
  );

  res.json({
    success: true,
    data: {
      ...hospital,
      supportedDiseases: (hospital.supportedDiseaseIds || []).map(id => seedData.diseases.find(item => item.id === id)?.name || id),
      evidenceStatus: hospital.capabilityStatus || "EVIDENCE_BACKED",
      allOutcomes,
      allCosts,
      sources: relevantSources
    }
  });
});

// 3. GET /api/diseases - taxonomy
router.get("/diseases", (req, res) => {
  res.json({
    success: true,
    data: {
      diseases: seedData.diseases,
      treatments: seedData.treatments
    }
  });
});

// 4. POST /api/search - structured + NLP search
router.post("/search", (req, res) => {
  const { condition, treatment, budgetTier, locationRadius, accreditation } = req.body;

  let list = hospitalsState.map(h => enrichHospital(h, "dis_cabg", "trt_cabg_onpump"));

  // Apply budget filtering
  if (budgetTier && budgetTier.includes("PM-JAY")) {
    list = list.filter(h => h.cost && (h.cost.costType.includes("PM-JAY") || h.cost.minAmount <= 200000));
  } else if (budgetTier && budgetTier.includes("2,00,000")) {
    list = list.filter(h => h.cost && h.cost.minAmount <= 350000);
  }

  res.json({
    success: true,
    queryApplied: { condition, treatment, budgetTier, locationRadius, accreditation },
    total: list.length,
    data: list
  });
});

// 5. GET & POST /api/compare - compare selected hospitals
const handleCompare = (req, res) => {
  const rawIds = req.body?.hospitalIds || (req.query.ids ? req.query.ids.split(",") : []);
  const diseaseId = req.body?.diseaseId || req.query.diseaseId || req.query.disease || "dis_cabg";
  const treatmentId = req.body?.treatmentId || req.query.treatmentId || req.query.treatment || "trt_cabg_onpump";

  if (!rawIds || !rawIds.length) {
    return res.status(400).json({ success: false, error: "Please provide hospitalIds or ids to compare" });
  }

  const matched = rawIds.map(id => {
    const hosp = findHospitalById(id.trim());
    if (!hosp) return null;
    return enrichHospital(hosp, diseaseId, treatmentId);
  }).filter(Boolean);

  res.json({
    success: true,
    diseaseId,
    treatmentId,
    total: matched.length,
    count: matched.length,
    data: matched
  });
};

router.get("/compare", handleCompare);
router.post("/compare", handleCompare);


// 6. POST /api/chat - AI Chatbot reasoning turn (with session state)
// Session state is maintained client-side and passed back each turn
router.post("/chat", async (req, res) => {
  const { message, sessionState, report } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  const profileContext = req.user ? {
    location: req.user.preferences?.location?.value || req.user.preferredCity || null,
    budget: req.user.preferences?.budget?.max || null,
    maxDistanceKm: req.user.preferences?.maxDistance?.value || null,
    locationPermission: "profile"
  } : {};
  const mergedSessionState = {
    ...(sessionState || {}),
    context: {
      ...profileContext,
      ...(sessionState?.context || {}),
      ...(report ? { medicalReport: report } : {})
    }
  };
  const localReply = processChatMessage(message, mergedSessionState);
  if (report && !localReply.personalizationNote) {
    localReply.personalizationNote = `Analyzed uploaded report: ${report.name} (${Math.round((report.size || 0) / 1024)} KB)`;
  }
  const botReply = await enhanceWithOpenAI({ message: message.trim(), localResponse: localReply });
  res.json({
    success: true,
    data: botReply
  });
});

router.get("/chat/status", (req, res) => {
  res.json({ success: true, data: getAIStatus() });
});

// 7. GET /api/sources - list registry source documents
router.get("/sources", (req, res) => {
  res.json({
    success: true,
    data: seedData.sourceDocuments
  });
});

// 7b. GET /api/sources/:id - single source document lookup
router.get("/sources/:id", (req, res) => {
  const source = seedData.sourceDocuments.find(s => s.id === req.params.id);
  if (!source) {
    return res.status(404).json({ success: false, error: "Source document not found" });
  }
  res.json({ success: true, data: source });
});

// 7c. GET /api/schemes - government healthcare schemes
router.get("/schemes", (req, res) => {
  const { disease, hospital } = req.query;
  let schemes = seedData.governmentSchemes || [];

  if (disease) {
    schemes = schemes.filter(s =>
      s.treatments.some(t => t.diseaseId === disease)
    );
  }
  if (hospital) {
    schemes = schemes.filter(s => s.participatingHospitals.includes(hospital));
  }

  res.json({
    success: true,
    total: schemes.length,
    data: schemes
  });
});

// 8. Admin endpoints — require verifier or platform_admin
router.get("/admin/evidence", authenticateToken, requireRole("verifier", "platform_admin", "hospital_admin"), (req, res) => {
  let data = evidenceState;
  // hospital_admin can only see evidence for their associated hospital
  if (req.user.role === "hospital_admin" && req.user.associatedHospitalId) {
    data = data.filter(e => e.hospitalId === req.user.associatedHospitalId);
  }
  res.json({
    success: true,
    total: data.length,
    data
  });
});

router.post("/admin/evidence", authenticateToken, requireRole("hospital_admin", "verifier", "platform_admin"), (req, res) => {
  const { hospitalId, hospitalName, sourceDocumentId, field, claimedValue, unit } = req.body;
  const newRecord = {
    id: `ev_${Date.now()}`,
    hospitalId,
    hospitalName: hospitalName || "Institutional Submitter",
    sourceDocumentId: sourceDocumentId || "src_mohfw_cea_2024_01",
    field,
    claimedValue,
    normalizedValue: parseFloat(claimedValue) || 0,
    unit: unit || "units",
    status: "PENDING_REVIEW",
    reviewer: "Unassigned",
    reviewedAt: null,
    notes: "Submitted via Admin Evidence Portal."
  };

  evidenceState.unshift(newRecord);

  auditLogsState.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "CLAIM_SUBMISSION",
    entityType: "EvidenceRecord",
    entityId: newRecord.id,
    actor: "Portal Data Contributor",
    details: `Submitted new evidence claim: ${field} = ${claimedValue}`
  });

  res.status(201).json({
    success: true,
    data: newRecord
  });
});

router.patch("/admin/evidence/:id", authenticateToken, requireRole("verifier", "platform_admin"), (req, res) => {
  const { id } = req.params;
  const { status, notes, reviewer = "Dr. Ananya Roy (ABDM Verifier)" } = req.body;

  const itemIndex = evidenceState.findIndex(e => e.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, error: "Evidence record not found" });
  }

  const updatedItem = {
    ...evidenceState[itemIndex],
    status: status || evidenceState[itemIndex].status,
    notes: notes || evidenceState[itemIndex].notes,
    reviewer,
    reviewedAt: new Date().toISOString()
  };

  evidenceState[itemIndex] = updatedItem;

  auditLogsState.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: status === "APPROVED" ? "EVIDENCE_APPROVAL" : "EVIDENCE_REJECTION",
    entityType: "EvidenceRecord",
    entityId: id,
    actor: reviewer,
    details: `${status} evidence claim "${updatedItem.field}" (${updatedItem.claimedValue}) for ${updatedItem.hospitalName}. Notes: ${notes || "None"}`
  });

  res.json({
    success: true,
    data: updatedItem
  });
});

router.get("/admin/audit", authenticateToken, requireRole("verifier", "platform_admin"), (req, res) => {
  res.json({
    success: true,
    total: auditLogsState.length,
    data: auditLogsState
  });
});

export default router;
