export const seedData = {
  hospitals: [
    {
      id: "hosp_max_saket",
      canonicalName: "Max Super Speciality Hospital",
      locationName: "Saket, New Delhi",
      distanceKm: 14.2,
      ownership: "Private Super Speciality",
      abdmRegistryId: "07-ND-DEL-6011",
      accreditationTier: "NABH Full Accreditation",
      accreditations: ["NABH 5th Ed.", "JCI Accredited", "NABL Laboratory"],
      image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
      confidence: "High Confidence",
      confidenceScore: 94,
      lastAudited: "2024-Q3 MoHFW Statutory Audit",
      facilities: ["Dedicated Cardiac ICU (48 Beds)", "Hybrid Cath Lab", "Extracorporeal Membrane Oxygenation (ECMO)", "Robotic Surgery Suite"],
      specialities: ["Cardiothoracic Surgery", "Interventional Cardiology", "Oncology", "Nephrology"]
    },
    {
      id: "hosp_aiims_delhi",
      canonicalName: "AIIMS New Delhi (CT Centre)",
      locationName: "Ansari Nagar, New Delhi",
      distanceKm: 8.6,
      ownership: "Public Autonomous Apex Node",
      abdmRegistryId: "07-CT-AIIMS-001",
      accreditationTier: "Central Apex Academic Node",
      accreditations: ["Apex National Institute (MoHFW)", "NABH Certified Blood Bank", "ICMR Apex Research Node"],
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      confidence: "100% Registry Backed",
      confidenceScore: 99,
      lastAudited: "2024-Q2 Statutory Return #AIIMS-772",
      facilities: ["Apex Coronary Care Unit (64 Beds)", "Advanced Ventricular Assist Device (VAD) Lab", "Emergency Resuscitation Pavilion", "Subsidized Pharmacy Counter"],
      specialities: ["Cardiothoracic & Vascular Surgery", "Hematology", "Cardiology", "Organ Transplant"]
    },
    {
      id: "hosp_fortis_escorts",
      canonicalName: "Fortis Escorts Heart Institute",
      locationName: "Okhla Road, New Delhi",
      distanceKm: 11.4,
      ownership: "Single-Specialty Cardiac Center",
      abdmRegistryId: "07-OKH-FEHI-98",
      accreditationTier: "NABH & JCI Dual Accreditation",
      accreditations: ["NABH Tertiary", "JCI Gold Seal", "GreenOT Certified"],
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
      confidence: "High Confidence",
      confidenceScore: 91,
      lastAudited: "2024-Q3 Verified Hospital Return",
      facilities: ["Dedicated Pediatric & Adult CTVS Theatres", "Electrophysiology 3D Mapping Lab", "Post-Op Step-Down Telemetry", "Advanced Cardiac MRI"],
      specialities: ["Cardiothoracic Surgery", "Pediatric Cardiology", "Cardiac Electrophysiology"]
    },
    {
      id: "hosp_medanta_gurgaon",
      canonicalName: "Medanta The Medicity",
      locationName: "Sector 38, Gurugram NCR",
      distanceKm: 28.5,
      ownership: "Corporate Multi-Speciality",
      abdmRegistryId: "06-GGN-MED-104",
      accreditationTier: "NABH & JCI Accredited",
      accreditations: ["NABH Multi-Speciality", "JCI International", "NABL Audited"],
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
      confidence: "Verified Institution",
      confidenceScore: 89,
      lastAudited: "2024-Q2 Private Facility Audit",
      facilities: ["Heart Institute ICU (52 Beds)", "Da Vinci Xi Surgical Robot", "Intraoperative MRI", "Organ Retrieval Center"],
      specialities: ["Cardiothoracic Surgery", "Orthopedics", "Neurosciences", "Liver & Renal Transplant"]
    },
    {
      id: "hosp_tata_memorial",
      canonicalName: "Tata Memorial Hospital Node",
      locationName: "Extended NCR Referral Center",
      distanceKm: 22.0,
      ownership: "Central Autonomous Grant-in-Aid",
      abdmRegistryId: "27-MUM-TMC-002",
      accreditationTier: "ICMR Apex Oncology Research",
      accreditations: ["NABH Oncology", "DAE Statutory Institute", "WHO Collaborating Centre"],
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80",
      confidence: "Apex Registry Audited",
      confidenceScore: 97,
      lastAudited: "2024-Q3 ICMR Consolidated Audit",
      facilities: ["Clean-Room Bone Marrow Transplant Unit", "Cyclotron & PET-CT Wing", "Medical Oncology Day Care (120 Beds)", "Precision Genomics Lab"],
      specialities: ["Medical Oncology", "Surgical Oncology", "Hematology", "Bone Marrow Transplant"]
    }
  ],

  diseases: [
    {
      id: "dis_cabg",
      name: "Coronary Artery Bypass (CABG)",
      icd10: "I25.1",
      category: "Cardiovascular Diseases",
      description: "Severe triple-vessel or left-main coronary artery stenosis requiring surgical myocardial revascularization.",
      treatments: ["trt_cabg_onpump", "trt_opcab", "trt_cabg_robotic", "trt_pci"]
    },
    {
      id: "dis_knee",
      name: "Severe Knee Osteoarthritis",
      icd10: "M17.0",
      category: "Musculoskeletal & Orthopedics",
      description: "Bilateral end-stage joint space reduction with osteophyte formation requiring total knee arthroplasty.",
      treatments: ["trt_knee_bilateral", "trt_knee_unicompartmental"]
    },
    {
      id: "dis_leukemia",
      name: "Hematologic Malignancies (Leukemia/Lymphoma)",
      icd10: "C92.0",
      category: "Hematology & Oncology",
      description: "Acute myeloid or lymphoblastic leukemia requiring intensive induction chemotherapy or cellular therapy.",
      treatments: ["trt_chemo_induction", "trt_cart", "trt_bmt_allogeneic"]
    },
    {
      id: "dis_ckd",
      name: "Chronic Kidney Disease (Stage 5 / ESRD)",
      icd10: "N18.5",
      category: "Nephrology & Urology",
      description: "End-stage renal failure with GFR < 15 mL/min/1.73m² requiring regular hemodialysis or renal transplant.",
      treatments: ["trt_renal_tx", "trt_hemodialysis_maintenance"]
    }
  ],

  treatments: [
    {
      id: "trt_cabg_onpump",
      name: "Minimally Invasive On-Pump (CABG)",
      subSpeciality: "CABG / Adult Cardiac",
      technique: "Cardiopulmonary bypass with microscopic coronary anastomoses"
    },
    {
      id: "trt_opcab",
      name: "Off-Pump Coronary Artery Bypass (OPCAB)",
      subSpeciality: "Beating Heart Surgery",
      technique: "Cardiac stabilizer revascularization without cardiopulmonary arrest"
    },
    {
      id: "trt_cabg_robotic",
      name: "Robotic Assisted Revascularization",
      subSpeciality: "Robotic Minimally Invasive",
      technique: "Endoscopic LIMA harvest with mini-thoracotomy anastomosis"
    },
    {
      id: "trt_pci",
      name: "Percutaneous Coronary Intervention (PCI)",
      subSpeciality: "Interventional Cardiology",
      technique: "Drug-eluting coronary stent deployment via radial arterial access"
    },
    {
      id: "trt_knee_bilateral",
      name: "Bilateral Total Knee Arthroplasty (TKR)",
      subSpeciality: "Joint Replacement / Reconstruction",
      technique: "Simultaneous bilateral cruciate retaining or posterior stabilized prosthetic replacement"
    },
    {
      id: "trt_cart",
      name: "CAR-T Cell Immunotherapy",
      subSpeciality: "Cellular Oncology",
      technique: "Autologous T-cell genetic transduction with anti-CD19 chimeric antigen receptors"
    },
    {
      id: "trt_renal_tx",
      name: "Living Donor Renal Transplantation",
      subSpeciality: "Renal Transplant Surgery",
      technique: "Laparoscopic donor nephrectomy with iliac fossa vascular anastomosis in recipient"
    }
  ],

  outcomes: [
    {
      id: "out_max_cabg",
      hospitalId: "hosp_max_saket",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      annualVolume: 1420,
      mortalityRate30Day: 1.24,
      mortalityBenchmarkDelta: "-0.56% below state avg",
      complicationRate: 2.8,
      readmissionRate30Day: 4.1,
      outcomeDefinition: "30-day all-cause mortality post-elective primary CABG",
      reportingPeriod: "April 2023 - March 2024",
      sourceId: "src_mohfw_cea_2024_01",
      verificationStatus: "Verified by Verifier #MED-902",
      confidence: "High Confidence"
    },
    {
      id: "out_aiims_cabg",
      hospitalId: "hosp_aiims_delhi",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      annualVolume: 3180,
      mortalityRate30Day: 1.08,
      mortalityBenchmarkDelta: "-0.72% below national benchmark",
      complicationRate: 2.1,
      readmissionRate30Day: 3.4,
      outcomeDefinition: "30-day risk-adjusted inpatient mortality for isolated surgical revascularization",
      reportingPeriod: "Annual Statutory Return FY 2023-24",
      sourceId: "src_aiims_statutory_2024",
      verificationStatus: "ABDM Institutional Sign-off",
      confidence: "Apex Registry Verified"
    },
    {
      id: "out_fortis_cabg",
      hospitalId: "hosp_fortis_escorts",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      annualVolume: 1890,
      mortalityRate30Day: 1.19,
      mortalityBenchmarkDelta: "-0.61% below state avg",
      complicationRate: 2.4,
      readmissionRate30Day: 3.8,
      outcomeDefinition: "Standardized STS/EACTS 30-day in-hospital cardiac surgical mortality",
      reportingPeriod: "Calendar Year 2023 Audited Clinical Register",
      sourceId: "src_fehi_clinical_audit_2023",
      verificationStatus: "Third-Party Audited (MoHFW Format)",
      confidence: "High Confidence"
    },
    {
      id: "out_medanta_cabg",
      hospitalId: "hosp_medanta_gurgaon",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      annualVolume: 1650,
      mortalityRate30Day: 1.28,
      mortalityBenchmarkDelta: "-0.52% below state avg",
      complicationRate: 3.1,
      readmissionRate30Day: 4.5,
      outcomeDefinition: "30-day post-op elective coronary bypass mortality",
      reportingPeriod: "FY 2023-24 Consolidated Quality Ledger",
      sourceId: "src_medanta_quality_2024",
      verificationStatus: "Verified",
      confidence: "Verified Institution"
    },
    {
      id: "out_aiims_knee",
      hospitalId: "hosp_aiims_delhi",
      diseaseId: "dis_knee",
      treatmentId: "trt_knee_bilateral",
      annualVolume: 2450,
      mortalityRate30Day: 0.18,
      mortalityBenchmarkDelta: "-0.32% below benchmark",
      complicationRate: 1.6,
      readmissionRate30Day: 2.1,
      outcomeDefinition: "90-day surgical site infection & implant mechanical revision incidence",
      reportingPeriod: "FY 2023-24 Orthopedic Audit",
      sourceId: "src_aiims_statutory_2024",
      verificationStatus: "ABDM Institutional Sign-off",
      confidence: "Apex Registry Verified"
    },
    {
      id: "out_max_knee",
      hospitalId: "hosp_max_saket",
      diseaseId: "dis_knee",
      treatmentId: "trt_knee_bilateral",
      annualVolume: 1120,
      mortalityRate30Day: 0.22,
      mortalityBenchmarkDelta: "-0.28% below benchmark",
      complicationRate: 1.9,
      readmissionRate30Day: 2.5,
      outcomeDefinition: "90-day deep prosthetic joint infection and deep vein thrombosis rate",
      reportingPeriod: "FY 2023-24 Joint Registry Return",
      sourceId: "src_max_joint_audit_2024",
      verificationStatus: "Verified by Verifier #MED-902",
      confidence: "High Confidence"
    },
    {
      id: "out_tata_leukemia",
      hospitalId: "hosp_tata_memorial",
      diseaseId: "dis_leukemia",
      treatmentId: "trt_cart",
      annualVolume: 890,
      mortalityRate30Day: 2.10,
      mortalityBenchmarkDelta: "Reference Standard for Hematologic Oncology",
      complicationRate: 8.4,
      readmissionRate30Day: 9.2,
      outcomeDefinition: "Complete molecular remission at Day 90 post-chimeric cellular infusion",
      reportingPeriod: "ICMR Multicentric Registry 2023-24",
      sourceId: "src_icmr_oncology_2024",
      verificationStatus: "ICMR Peer Verified",
      confidence: "Apex Research Registry"
    }
  ],

  costs: [
    {
      id: "cost_max_cabg",
      hospitalId: "hosp_max_saket",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      costType: "Published Institutional Package (Semi-Private)",
      currency: "INR",
      minAmount: 280000,
      maxAmount: 360000,
      averageAmount: 315000,
      confidenceText: "94% of reported episodes settled within this bandwidth",
      bandwidthCoverage: 94,
      roomType: "Semi-Private Bed",
      inclusions: [
        "Pre-operative anesthetic and coronary evaluation",
        "3 days Cardiac ICU + 4 days Step-Down Ward",
        "Surgical, anesthetic, and perfusionist fees",
        "Routine consumables, baseline cardiopulmonary circuit",
        "Discharge medications (5 days supply)"
      ],
      exclusions: [
        "Prolonged ICU ventilation beyond 72 hours",
        "Mechanical circulatory support (IABP / ECMO)",
        "Blood product units beyond 2 PRBC packs",
        "Management of unassociated systemic co-morbidities"
      ],
      sourceId: "src_max_tariff_schedule_2024",
      verificationStatus: "Verified with MoHFW Costing Template"
    },
    {
      id: "cost_aiims_cabg",
      hospitalId: "hosp_aiims_delhi",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      costType: "Statutory Public Registry Subsidized Schedule / PM-JAY",
      currency: "INR",
      minAmount: 85000,
      maxAmount: 140000,
      averageAmount: 95000,
      confidenceText: "100% Free under PM-JAY; General bed waitlist index 14-28 days",
      bandwidthCoverage: 99,
      roomType: "General / Statutory Subsidized Ward",
      inclusions: [
        "All surgical interventions and institutional bed charges",
        "Comprehensive ICU stay and ventilator management",
        "Standard prosthetic graft material and vascular sutures",
        "Full institutional pharmacy and investigation package"
      ],
      exclusions: [
        "Private ward surcharge if opted by patient choice",
        "Experimental or non-formulary biologics"
      ],
      sourceId: "src_aiims_statutory_2024",
      verificationStatus: "Statutory Gazetted Schedule"
    },
    {
      id: "cost_fortis_cabg",
      hospitalId: "hosp_fortis_escorts",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      costType: "Documented Standard Package",
      currency: "INR",
      minAmount: 310000,
      maxAmount: 420000,
      averageAmount: 355000,
      confidenceText: "91% confidence score across 410 claims verified",
      bandwidthCoverage: 91,
      roomType: "Includes 3 Post-Op ICU days + Twin Sharing",
      inclusions: [
        "Surgeon, Assistant surgeon & Cardiac Anesthesiologist fee",
        "Operation Theatre charges and standard cardiopulmonary pack",
        "Routine laboratory tests & post-op chest X-rays",
        "Cardiac rehabilitation physical therapy during admission"
      ],
      exclusions: [
        "Emergency off-hours re-exploration surgery",
        "Specialized imported heart valves if concurrent replacement needed",
        "Post-discharge anticoagulant telemetry"
      ],
      sourceId: "src_fehi_tariff_2024",
      verificationStatus: "Verified across Third-Party TPA Settlements"
    },
    {
      id: "cost_medanta_cabg",
      hospitalId: "hosp_medanta_gurgaon",
      diseaseId: "dis_cabg",
      treatmentId: "trt_cabg_onpump",
      costType: "Published Corporate Tariff",
      currency: "INR",
      minAmount: 330000,
      maxAmount: 450000,
      averageAmount: 375000,
      confidenceText: "88% of elective episodes conclude within quoted tier",
      bandwidthCoverage: 88,
      roomType: "Twin Sharing Ward",
      inclusions: [
        "Standard CABG surgical consumables & bypass pump disposables",
        "3 days Coronary Care Unit + 3 days Room Nursing",
        "Daily clinical rounds by primary surgical team",
        "Comprehensive discharge summary & follow-up ECG"
      ],
      exclusions: [
        "Continuous Renal Replacement Therapy (CRRT) if required",
        "Off-formulary antibiotics and antifungal infusions"
      ],
      sourceId: "src_medanta_quality_2024",
      verificationStatus: "Verified"
    },
    {
      id: "cost_aiims_knee",
      hospitalId: "hosp_aiims_delhi",
      diseaseId: "dis_knee",
      treatmentId: "trt_knee_bilateral",
      costType: "PM-JAY Standard Cap Rate",
      currency: "INR",
      minAmount: 110000,
      maxAmount: 160000,
      averageAmount: 130000,
      confidenceText: "Full PM-JAY package schedule rate with dual implants",
      bandwidthCoverage: 98,
      roomType: "Subsidized Ward",
      inclusions: ["Dual cemented high-flex knee prostheses", "OT charges", "Physiotherapy"],
      exclusions: ["Optional premium navigation robotic disposable kits"],
      sourceId: "src_pmjay_schedule_v2",
      verificationStatus: "National Health Authority PM-JAY Locked"
    },
    {
      id: "cost_max_knee",
      hospitalId: "hosp_max_saket",
      diseaseId: "dis_knee",
      treatmentId: "trt_knee_bilateral",
      costType: "Institutional Package (Semi-Private)",
      currency: "INR",
      minAmount: 320000,
      maxAmount: 410000,
      averageAmount: 360000,
      confidenceText: "93% verified settlement rate across 280 joint episodes",
      bandwidthCoverage: 93,
      roomType: "Semi-Private Room",
      inclusions: ["FDA-approved oxidized zirconium implants", "5 days stay", "Robotic arm alignment fee"],
      exclusions: ["Home rehabilitation nurse visits post-discharge"],
      sourceId: "src_max_joint_audit_2024",
      verificationStatus: "Verified"
    },
    {
      id: "cost_tata_leukemia",
      hospitalId: "hosp_tata_memorial",
      diseaseId: "dis_leukemia",
      treatmentId: "trt_cart",
      costType: "Institutional Subsidized Research Protocol",
      currency: "INR",
      minAmount: 1400000,
      maxAmount: 2200000,
      averageAmount: 1750000,
      confidenceText: "Indigenously manufactured CAR-T protocol vs ₹2.5Cr global equivalent",
      bandwidthCoverage: 95,
      roomType: "HEPA Filtration Clean Room",
      inclusions: ["Apheresis collection", "Cellular transduction", "Cytokine storm management protocol in ICU"],
      exclusions: ["Extended post-infusion IVIG therapy if B-cell aplasia persists > 6 months"],
      sourceId: "src_icmr_oncology_2024",
      verificationStatus: "Statutory Grant-in-Aid Audited"
    }
  ],

  sourceDocuments: [
    {
      id: "src_mohfw_cea_2024_01",
      publisher: "Ministry of Health & Family Welfare (MoHFW) - Clinical Establishments Division",
      title: "Statutory Return for Tertiary Surgical Facilities: Delhi NCT (Form IV-Q3)",
      sourceType: "Government Statutory Registry Audit",
      url: "https://clinicalestablishments.mohfw.gov.in/sites/default/files/2022-06/4001_0.pdf",
      documentHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      publicationDate: "2024-04-15",
      reportingPeriod: "FY 2023-2024",
      verificationStatus: "Statutory Signed & Sealed"
    },
    {
      id: "src_aiims_statutory_2024",
      publisher: "All India Institute of Medical Sciences / Academic Senate",
      title: "Annual Clinical Volume & Hospital Performance Ledger (Cardiothoracic Node)",
      sourceType: "Statutory Autonomous Academic Report",
      url: "https://aiims.edu/ct-centre/reports/2024-clinical-statistics.pdf",
      documentHash: "sha256:3a91bb425c27051df6714ea8d6f519a16f917cb83df1e5124b4231b402123a41",
      publicationDate: "2024-05-10",
      reportingPeriod: "FY 2023-2024",
      verificationStatus: "ABDM HFR Node Synchronized"
    },
    {
      id: "src_pmjay_schedule_v2",
      publisher: "National Health Authority (NHA) - Government of India",
      title: "Ayushman Bharat PM-JAY Health Benefit Package (HBP 2.2) Master Schedule",
      sourceType: "National Public Payer Schedule",
      url: "https://nha.gov.in/img/pmjay-files/RFE_Volume_II.pdf",
      documentHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      publicationDate: "2024-01-01",
      reportingPeriod: "2024-2025 Schedule",
      verificationStatus: "Official Gazetted Tariff"
    },
    {
      id: "src_fehi_clinical_audit_2023",
      publisher: "Fortis Escorts Heart Institute / Quality Management Directorate",
      title: "Consolidated Clinical Outcomes and Standard Procedure Package Register",
      sourceType: "Institutional Quality Return (NABH Audited)",
      url: "https://fortisescorts.in/clinical-governance/audit-2023.pdf",
      documentHash: "sha256:49c0d3bcde8d42d32906b3a3ab803a62ea2b083d81b37ddde3d038dc79848520",
      publicationDate: "2024-02-28",
      reportingPeriod: "CY 2023",
      verificationStatus: "Third-Party Verified"
    },
    {
      id: "src_icmr_oncology_2024",
      publisher: "Indian Council of Medical Research (ICMR) & Tata Memorial Centre",
      title: "National Cancer Grid Multi-Centric Cellular Therapy Register 2024",
      sourceType: "Apex Research Registry",
      url: "https://www.icmr.gov.in/icmr-portals?q=clinical+trial",
      documentHash: "sha256:c02d1a37c0678d4619d85bf1832b4969248744b82d334515582987a0223d6a0f",
      publicationDate: "2024-06-01",
      reportingPeriod: "2023-2024 Trial Runs",
      verificationStatus: "ICMR Validated"
    }
  ],

  evidenceRecords: [
    {
      id: "ev_001",
      hospitalId: "hosp_max_saket",
      hospitalName: "Max Super Speciality Hospital",
      sourceDocumentId: "src_mohfw_cea_2024_01",
      field: "Annual CABG Surgical Volume",
      claimedValue: "1,420 cases",
      normalizedValue: 1420,
      unit: "cases/year",
      status: "APPROVED",
      reviewer: "Dr. Ananya Roy (ABDM Verifier #902)",
      reviewedAt: "2024-04-18T10:30:00Z",
      notes: "Cross-checked against MoHFW CEA monthly return sheets. No discrepancies detected."
    },
    {
      id: "ev_002",
      hospitalId: "hosp_max_saket",
      hospitalName: "Max Super Speciality Hospital",
      sourceDocumentId: "src_mohfw_cea_2024_01",
      field: "30-Day CABG Mortality Rate",
      claimedValue: "1.24%",
      normalizedValue: 1.24,
      unit: "percent",
      status: "APPROVED",
      reviewer: "Dr. Ananya Roy (ABDM Verifier #902)",
      reviewedAt: "2024-04-18T10:35:00Z",
      notes: "Risk-adjusted methodology verified in accordance with EACTS standard."
    },
    {
      id: "ev_003",
      hospitalId: "hosp_aiims_delhi",
      hospitalName: "AIIMS New Delhi (CT Centre)",
      sourceDocumentId: "src_aiims_statutory_2024",
      field: "Subsidized CABG Tariff Ceiling",
      claimedValue: "₹85,000 - ₹1,40,000",
      normalizedValue: 85000,
      unit: "INR",
      status: "APPROVED",
      reviewer: "Sunil Verma (Directorate of Health Services)",
      reviewedAt: "2024-05-12T14:15:00Z",
      notes: "Gazetted public hospital schedule validated against Ministry subvention guidelines."
    },
    {
      id: "ev_004",
      hospitalId: "hosp_fortis_escorts",
      hospitalName: "Fortis Escorts Heart Institute",
      sourceDocumentId: "src_fehi_clinical_audit_2023",
      field: "Elective CABG Package Rate",
      claimedValue: "₹3,10,000 - ₹4,20,000",
      normalizedValue: 310000,
      unit: "INR",
      status: "APPROVED",
      reviewer: "Kavita Rao (TPA Quality Audit Council)",
      reviewedAt: "2024-03-05T11:20:00Z",
      notes: "Audited across 410 commercial TPA settlements. High consistency."
    },
    {
      id: "ev_005",
      hospitalId: "hosp_medanta_gurgaon",
      hospitalName: "Medanta The Medicity",
      sourceDocumentId: "src_mohfw_cea_2024_01",
      field: "Robotic Revascularization Availability",
      claimedValue: "Active Clinical Program (Da Vinci Xi)",
      normalizedValue: 1,
      unit: "binary",
      status: "PENDING_REVIEW",
      reviewer: "Pending Assignment",
      reviewedAt: null,
      notes: "Submitted by hospital liaison on 2024-09-15. Pending surgical registry audit."
    },
    {
      id: "ev_006",
      hospitalId: "hosp_aiims_delhi",
      hospitalName: "AIIMS New Delhi (CT Centre)",
      sourceDocumentId: "src_aiims_statutory_2024",
      field: "Bilateral TKR Package Rate",
      claimedValue: "₹1,10,000 - ₹1,60,000",
      normalizedValue: 110000,
      unit: "INR",
      status: "PENDING_REVIEW",
      reviewer: "Pending Assignment",
      reviewedAt: null,
      notes: "Proposed PM-JAY tariff revision submitted for FY 24-25."
    }
  ],

  auditLogs: [
    {
      id: "audit_101",
      timestamp: "2024-04-18T10:30:00Z",
      action: "EVIDENCE_APPROVAL",
      entityType: "OutcomeRecord",
      entityId: "out_max_cabg",
      actor: "Dr. Ananya Roy (ABDM Verifier #902)",
      details: "Approved Annual CABG Volume of 1,420 cases for Max Super Speciality Saket."
    },
    {
      id: "audit_102",
      timestamp: "2024-04-18T10:35:00Z",
      action: "EVIDENCE_APPROVAL",
      entityType: "OutcomeRecord",
      entityId: "out_max_cabg",
      actor: "Dr. Ananya Roy (ABDM Verifier #902)",
      details: "Approved 30-Day CABG Mortality Rate of 1.24% with -0.56% state benchmark delta."
    },
    {
      id: "audit_103",
      timestamp: "2024-05-12T14:15:00Z",
      action: "EVIDENCE_APPROVAL",
      entityType: "CostRecord",
      entityId: "cost_aiims_cabg",
      actor: "Sunil Verma (DHS Verifier)",
      details: "Approved AIIMS New Delhi statutory CABG package rate of ₹85,000 - ₹1,40,000."
    },
    {
      id: "audit_104",
      timestamp: "2024-09-15T09:00:00Z",
      action: "CLAIM_SUBMISSION",
      entityType: "EvidenceRecord",
      entityId: "ev_005",
      actor: "Medanta Quality Officer",
      details: "Submitted evidence claim for Robotic Revascularization capability."
    }
  ],

  governmentSchemes: [
    {
      id: "scheme_pmjay",
      name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
      authority: "National Health Authority (NHA), Government of India",
      description: "World's largest government-funded health insurance scheme providing cashless secondary and tertiary hospitalization coverage up to ₹5 lakh per family per year at empanelled hospitals.",
      eligibility: [
        "Families identified via SECC 2011 deprivation categories (rural) or occupational categories (urban)",
        "No restriction on family size, age, or gender",
        "Pre-existing conditions covered from day one",
        "Portable across India at any empanelled hospital"
      ],
      coverageLimit: "₹5,00,000 per family per year",
      documentsRequired: [
        "Ayushman Bharat card or verified e-card via mera.pmjay.gov.in",
        "Aadhaar card for identity verification",
        "Ration card or SECC letter (if card not generated)"
      ],
      officialUrl: "https://pmjay.gov.in",
      verificationDate: "2024-06-15",
      treatments: [
        {
          diseaseId: "dis_cabg",
          treatmentId: "trt_cabg_onpump",
          packageName: "Coronary Artery Bypass Graft (Single valve, on-pump)",
          packageCode: "PM-JAY-CVS-03",
          packageAmount: 170000,
          packageCeiling: 220000,
          inclusions: ["Pre-op investigations", "Surgery", "ICU stay (up to 5 days)", "Ward stay (up to 7 days)", "Post-op medications", "Follow-up visit (1)"],
          exclusions: ["Premium imported valves beyond ₹35,000", "Extended ICU beyond 5 days", "Private room upgrade"]
        },
        {
          diseaseId: "dis_knee",
          treatmentId: "trt_knee_bilateral",
          packageName: "Bilateral Total Knee Replacement (Cemented)",
          packageCode: "PM-JAY-ORTH-12",
          packageAmount: 140000,
          packageCeiling: 180000,
          inclusions: ["Standard cemented prostheses (both knees)", "OT charges", "5-day ward stay", "Physiotherapy (in-hospital)"],
          exclusions: ["Premium navigation/robotic kit", "Extended rehabilitation beyond discharge"]
        },
        {
          diseaseId: "dis_leukemia",
          treatmentId: "trt_chemo_induction",
          packageName: "Acute Leukemia Induction Chemotherapy (Standard Protocol)",
          packageCode: "PM-JAY-ONCO-07",
          packageAmount: 100000,
          packageCeiling: 150000,
          inclusions: ["Chemotherapy drugs (standard formulary)", "Blood products", "ICU if needed", "Supportive care"],
          exclusions: ["CAR-T or experimental cell therapy", "Bone marrow transplant (separate package)"]
        }
      ],
      participatingHospitals: ["hosp_aiims_delhi", "hosp_max_saket", "hosp_fortis_escorts", "hosp_medanta_gurgaon"]
    },
    {
      id: "scheme_cghs",
      name: "Central Government Health Scheme (CGHS)",
      authority: "Ministry of Health & Family Welfare, Government of India",
      description: "Comprehensive healthcare scheme for central government employees, pensioners, and eligible dependents providing OPD, IPD, and investigation coverage at empanelled hospitals.",
      eligibility: [
        "Serving central government employees and their dependents",
        "Central government pensioners and their dependents",
        "Members of Parliament, ex-MPs, freedom fighters",
        "Certain autonomous body employees"
      ],
      coverageLimit: "As per CGHS rates (no fixed annual ceiling for most categories)",
      documentsRequired: [
        "Valid CGHS card (plastic card or e-card)",
        "Government ID / service ID",
        "Referral letter from CGHS dispensary (for non-emergency)"
      ],
      officialUrl: "https://cghs.gov.in",
      verificationDate: "2024-05-20",
      treatments: [
        {
          diseaseId: "dis_cabg",
          treatmentId: "trt_cabg_onpump",
          packageName: "CABG (CGHS Empanelled Rate)",
          packageCode: "CGHS-CARD-001",
          packageAmount: 250000,
          packageCeiling: 350000,
          inclusions: ["Full surgical package at CGHS rates", "ICU and ward as per entitlement", "Investigations", "Follow-up"],
          exclusions: ["Room category above entitlement", "Non-formulary expensive biologics"]
        }
      ],
      participatingHospitals: ["hosp_aiims_delhi", "hosp_max_saket", "hosp_fortis_escorts", "hosp_medanta_gurgaon"]
    },
    {
      id: "scheme_delhihealth",
      name: "Delhi Arogya Kosh (DAK)",
      authority: "Government of NCT of Delhi",
      description: "Financial assistance scheme for Delhi residents requiring treatment at government or empanelled hospitals for serious illnesses including cardiac surgery, cancer treatment, and organ transplants.",
      eligibility: [
        "Resident of Delhi (proof of Delhi address required)",
        "Annual family income below ₹3 lakh (for full assistance) or ₹10 lakh (for partial)",
        "Treatment at a Delhi government hospital or designated empanelled facility",
        "Not covered under any other government scheme for the same treatment"
      ],
      coverageLimit: "Up to ₹5,00,000 (case-by-case approval by committee)",
      documentsRequired: [
        "Delhi domicile proof / voter ID / Aadhaar with Delhi address",
        "Income certificate or self-declaration affidavit",
        "BPL card (if applicable)",
        "Hospital cost estimate letter",
        "Medical documents confirming diagnosis"
      ],
      officialUrl: "https://health.delhi.gov.in",
      verificationDate: "2024-04-10",
      treatments: [
        {
          diseaseId: "dis_cabg",
          treatmentId: "trt_cabg_onpump",
          packageName: "Cardiac Surgery Financial Assistance",
          packageCode: "DAK-CARD-01",
          packageAmount: 150000,
          packageCeiling: 300000,
          inclusions: ["Surgery costs at government rates", "ICU charges", "Essential investigations"],
          exclusions: ["Private hospital charges above government schedule", "Non-essential consumables"]
        }
      ],
      participatingHospitals: ["hosp_aiims_delhi"]
    }
  ]
};
