import express from "express";
import { seedData } from "../data/seedData.js";
import { processChatMessage } from "../services/chatbotEngine.js";
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
    outcome,
    cost,
    sources
  };
}

// 1. GET /api/hospitals - list and filter
router.get("/hospitals", (req, res) => {
  const { disease, treatment, maxBudget, accreditation, query } = req.query;

  let results = hospitalsState.map(h => enrichHospital(h, disease || "dis_cabg", treatment || "trt_cabg_onpump"));

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(h =>
      h.canonicalName.toLowerCase().includes(q) ||
      h.locationName.toLowerCase().includes(q) ||
      h.specialities.some(s => s.toLowerCase().includes(q))
    );
  }

  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    results = results.filter(h => !h.cost || h.cost.minAmount <= budgetNum);
  }

  if (accreditation && accreditation !== "all") {
    results = results.filter(h =>
      h.accreditationTier.toLowerCase().includes(accreditation.toLowerCase()) ||
      h.accreditations.some(a => a.toLowerCase().includes(accreditation.toLowerCase()))
    );
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

// 2. GET /api/hospitals/:id - single profile
router.get("/hospitals/:id", (req, res) => {
  const hospital = hospitalsState.find(h => h.id === req.params.id);
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

// 5. POST /api/compare - compare selected hospitals
router.post("/compare", (req, res) => {
  const { hospitalIds = [], diseaseId = "dis_cabg", treatmentId = "trt_cabg_onpump" } = req.body;

  if (!hospitalIds.length) {
    return res.status(400).json({ success: false, error: "Please provide hospitalIds to compare" });
  }

  const matched = hospitalIds.map(id => {
    const hosp = hospitalsState.find(h => h.id === id);
    if (!hosp) return null;
    return enrichHospital(hosp, diseaseId, treatmentId);
  }).filter(Boolean);

  res.json({
    success: true,
    diseaseId,
    treatmentId,
    count: matched.length,
    data: matched
  });
});

// 6. POST /api/chat - AI Chatbot reasoning turn (with session state)
// Session state is maintained client-side and passed back each turn
router.post("/chat", (req, res) => {
  const { message, sessionState } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  const botReply = processChatMessage(message, sessionState || {});
  res.json({
    success: true,
    data: botReply
  });
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
