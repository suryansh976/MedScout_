import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  History,
  Building2,
  RefreshCw
} from "lucide-react";

export default function AdminVerificationView() {
  const { authFetch, isVerifier, isHospitalAdmin } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    hospitalName: "Max Super Speciality Hospital",
    hospitalId: "hosp_max_saket",
    field: "Robotic Revascularization 30-Day Success",
    claimedValue: "99.1%",
    unit: "percent"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const evRes = await authFetch("/api/admin/evidence");
      const evData = await evRes.json();
      if (evData.success) setEvidenceList(evData.data);
      if (isVerifier()) {
        const auditData = await (await authFetch("/api/admin/audit")).json();
        if (auditData.success) setAuditLogs(auditData.data);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error("Error loading admin records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [authFetch]);

  if (!isVerifier() && !isHospitalAdmin()) return null;

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await authFetch(`/api/admin/evidence/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: `Updated status to ${status} via Admin Verification Workbench.`
        })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      console.error("Error updating evidence", err);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/admin/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClaim)
      });
      const data = await res.json();
      if (data.success) {
        setShowSubmitModal(false);
        loadData();
      }
    } catch (err) {
      console.error("Error creating claim", err);
    }
  };

  const filteredEvidence = evidenceList.filter(item => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
              Platform Data-Verification & Audit Workbench
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-tertiary mt-1">
            Review, audit, approve, or reject clinical evidence claims submitted by hospital contributors or retrieved via MoHFW statutory returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl border border-surface-container-high bg-white text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Registry</span>
          </button>

          {isHospitalAdmin() && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Evidence Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-surface-container-high shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Pending Claims</span>
            <span className="font-display font-extrabold text-2xl text-warning block mt-0.5">
              {evidenceList.filter(e => e.status === "PENDING_REVIEW").length}
            </span>
          </div>
          <Clock className="w-8 h-8 text-warning opacity-70" />
        </div>

        <div className="p-4 rounded-2xl bg-white border border-surface-container-high shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Approved Registry Records</span>
            <span className="font-display font-extrabold text-2xl text-secondary block mt-0.5">
              {evidenceList.filter(e => e.status === "APPROVED").length}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-secondary opacity-70" />
        </div>

        <div className="p-4 rounded-2xl bg-white border border-surface-container-high shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Total Audited Events</span>
            <span className="font-display font-extrabold text-2xl text-primary block mt-0.5">
              {auditLogs.length}
            </span>
          </div>
          <History className="w-8 h-8 text-primary opacity-70" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-3 text-xs font-semibold">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "ALL" ? "bg-primary text-white" : "text-tertiary hover:bg-surface-container"
          }`}
        >
          All Records ({evidenceList.length})
        </button>
        <button
          onClick={() => setFilter("PENDING_REVIEW")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "PENDING_REVIEW" ? "bg-warning text-white" : "text-tertiary hover:bg-surface-container"
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === "APPROVED" ? "bg-secondary text-white" : "text-tertiary hover:bg-surface-container"
          }`}
        >
          Approved
        </button>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-tertiary uppercase font-bold text-[10px] tracking-wider border-b border-surface-container-high">
                <th className="p-4">Hospital & Node</th>
                <th className="p-4">Clinical Metric / Field</th>
                <th className="p-4">Claimed Value</th>
                <th className="p-4">Reviewer & Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredEvidence.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{item.hospitalName}</div>
                    <div className="text-[10px] font-mono text-tertiary">{item.hospitalId}</div>
                  </td>
                  <td className="p-4 font-semibold text-on-surface">
                    {item.field}
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-on-surface bg-surface-container-low px-2 py-1 rounded">
                      {item.claimedValue}
                    </span>
                  </td>
                  <td className="p-4 text-tertiary max-w-xs">
                    <div className="font-medium text-on-surface-variant">{item.reviewer || "Unassigned"}</div>
                    <div className="text-[11px] truncate">{item.notes}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === "APPROVED"
                          ? "bg-secondary-container text-secondary"
                          : item.status === "REJECTED"
                          ? "bg-red-100 text-danger"
                          : "bg-amber-100 text-warning"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isVerifier() && item.status === "PENDING_REVIEW" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                          className="px-2.5 py-1 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                          className="px-2.5 py-1 bg-surface-container hover:bg-danger/10 text-danger rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-tertiary">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Timeline */}
      {isVerifier() && <div className="bg-white rounded-2xl p-5 border border-surface-container-high shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-secondary" />
          <h2 className="font-headline font-bold text-base text-on-surface">
            Statutory Audit Log (Immutable Change Ledger)
          </h2>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-surface-container-low/60 border border-surface-container-high text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-primary font-mono mr-2">[{log.action}]</span>
                <span className="text-on-surface font-medium">{log.details}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-tertiary shrink-0 font-mono">
                <span>Actor: {log.actor}</span>
                <span>•</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Submit Claim Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Submit New Clinical Evidence Claim
            </h3>
            <form onSubmit={handleCreateClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-tertiary uppercase">Hospital Name</label>
                <input
                  type="text"
                  value={newClaim.hospitalName}
                  onChange={(e) => setNewClaim({ ...newClaim, hospitalName: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-surface-container-high text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-tertiary uppercase">Clinical Metric / Field</label>
                <input
                  type="text"
                  value={newClaim.field}
                  onChange={(e) => setNewClaim({ ...newClaim, field: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-surface-container-high text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-tertiary uppercase">Claimed Value</label>
                <input
                  type="text"
                  value={newClaim.claimedValue}
                  onChange={(e) => setNewClaim({ ...newClaim, claimedValue: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-surface-container-high text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:bg-surface-container font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark"
                >
                  Submit for ABDM Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
