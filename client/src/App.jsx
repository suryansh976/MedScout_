import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProvenanceStrip from "./components/ProvenanceStrip";
import SearchHero from "./components/SearchHero";
import HospitalCard from "./components/HospitalCard";
import FloatingCompareTray from "./components/FloatingCompareTray";
import CompareMatrix from "./components/CompareMatrix";
import AIChatbotDrawer from "./components/AIChatbotDrawer";
import HospitalDetailModal from "./components/HospitalDetailModal";
import RankingMethodologySection from "./components/RankingMethodologySection";
import AdminVerificationView from "./components/AdminVerificationView";
import DataProvenanceView from "./components/DataProvenanceView";
import DiseaseProtocolsView from "./components/DiseaseProtocolsView";
import Footer from "./components/Footer";
import ProfilePage from "./pages/ProfilePage.jsx";
import HealthCardPage from "./pages/HealthCardPage.jsx";
import LocationRequestBanner from "./components/LocationRequestBanner";
import allIndiaDemoHospitals from "./data/demoHospitals.js";
import { useAuth } from "./context/AuthContext.jsx";
import { Sparkles, SlidersHorizontal, RefreshCw, MapPin } from "lucide-react";

const CITY_COORDINATES = {
  "Delhi NCR": { lat: 28.6139, lng: 77.2090 },
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  "East Delhi": { lat: 28.6255, lng: 77.2876 },
  "Gurugram": { lat: 28.4595, lng: 77.0266 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794 },
  "Jalandhar": { lat: 31.3260, lng: 75.5762 },
  "Ludhiana": { lat: 30.9010, lng: 75.8573 },
  "Patiala": { lat: 30.3400, lng: 76.3840 },
  "Banga": { lat: 31.1794, lng: 75.9804 },
  "Mandi": { lat: 31.7099, lng: 76.9383 },
  "Shimla": { lat: 31.1048, lng: 77.1734 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Lucknow": { lat: 26.8467, lng: 80.9462 },
  "Patna": { lat: 25.5941, lng: 85.1376 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Kochi": { lat: 9.9312, lng: 76.2673 }
};

const CONDITION_ALIASES = {
  "chronic kidney disease": "Chronic Kidney Disease (Stage 5 / ESRD)",
  "nephrology": "Chronic Kidney Disease (Stage 5 / ESRD)",
  "hematologic malignancies (leukemia)": "Hematologic Malignancies (Leukemia/Lymphoma)",
  "oncology": "Hematologic Malignancies (Leukemia/Lymphoma)",
  "cardiology": "Coronary Artery Bypass (CABG)",
  "neurosciences": "Neurological Disorders",
  "neurology": "Neurological Disorders",
  "orthopedics": "Severe Knee Osteoarthritis",
  "orthopaedics": "Severe Knee Osteoarthritis",
  "general medicine": "General and Multi-Specialty Care"
};

const KNOWN_LOCATIONS = new Set(["All India", ...Object.keys(CITY_COORDINATES)]);

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

function findClosestCity(lat, lng) {
  let closest = "Delhi NCR";
  let minDistance = Infinity;
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }
  return closest;
}

const legacyDemoHospitals = [
  { id: "sir-ganga-ram", canonicalName: "Sir Ganga Ram Hospital", city: "New Delhi", state: "Delhi", address: "Rajinder Nagar, New Delhi - 110060", notes: "NABH accredited flagship; cardiology, oncology, hepato-pancreato-biliary surgery.", conditionFocus: "Cardiology", specialityFocus: "Cardiac Surgery", successRate: 93, costRange: "₹3.2L - ₹5.8L", avgCost: 420000, distanceKm: 12, lat: 28.6401, lng: 77.1951, accreditationTier: "NABH Accredited", ownership: "Private Trust", specialities: ["Cardiology", "Oncology", "Hepato-Pancreato-Biliary Surgery"], facilities: ["Cardiac ICU", "Oncology Unit", "Robotic Surgery"], image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" },
  { id: "sir-ganga-ram-city", canonicalName: "Sir Ganga Ram City Hospital", city: "New Delhi", state: "Delhi", address: "B-1/1, Pusa Road, Delhi - 110060", notes: "Cardiology and oncology capabilities with strong tertiary support.", conditionFocus: "Cardiology", specialityFocus: "Cardiac Surgery", successRate: 91, costRange: "₹2.9L - ₹5.2L", avgCost: 400000, distanceKm: 11, lat: 28.6384, lng: 77.1653, accreditationTier: "NABH Accredited", ownership: "Private Trust", specialities: ["Cardiology", "Oncology", "Hepatobiliary Surgery"], facilities: ["Critical Care", "Oncology Ward", "Cardiac Cath Lab"], image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" },
  { id: "sir-ganga-ram-kolmet", canonicalName: "Sir Ganga Ram Kolmet Hospital", city: "New Delhi", state: "Delhi", address: "7B, Pusa Road, Karol Bagh, New Delhi - 110005", notes: "NABH certificate valid to Nov 2028; multi-specialty hospital in central Delhi.", conditionFocus: "Multi-speciality", specialityFocus: "General Surgery", successRate: 88, costRange: "₹2.1L - ₹4.8L", avgCost: 335000, distanceKm: 9, lat: 28.6513, lng: 77.1975, accreditationTier: "SHCO Accredited", ownership: "Private Trust", specialities: ["Multi-Speciality Care", "General Surgery"], facilities: ["General ICU", "Emergency Ward", "Diagnostics"], image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80" },
  { id: "max-smart-saket", canonicalName: "Max Smart Super Speciality Hospital", city: "New Delhi", state: "Delhi", address: "Press Enclave Road, Saket, South Delhi - 110017", notes: "250 beds; NABH certified; renal transplant and tertiary care services.", conditionFocus: "Nephrology", specialityFocus: "Renal Transplant", successRate: 96, costRange: "₹3.5L - ₹6.2L", avgCost: 475000, distanceKm: 14, lat: 28.5244, lng: 77.2088, accreditationTier: "NABH Certified", ownership: "Private Super Speciality", specialities: ["Renal Transplant", "Nephrology", "Multi-Speciality Care"], facilities: ["Renal ICU", "Dialysis Unit", "High Dependency Ward"], image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80" },
  { id: "blk-memorial", canonicalName: "Dr B L Kapur Memorial Hospital", city: "New Delhi", state: "Delhi", address: "Pusa Road, New Delhi - 110005", notes: "Multi-specialty tertiary care center serving central and west Delhi.", conditionFocus: "Multi-speciality", specialityFocus: "General Medicine", successRate: 87, costRange: "₹2.0L - ₹4.2L", avgCost: 310000, distanceKm: 10, lat: 28.6435, lng: 77.1874, accreditationTier: "Accredited Hospital", ownership: "Private Multi-Speciality", specialities: ["Multi-Speciality Care", "General Medicine"], facilities: ["General ICU", "Emergency Care", "Medical Wards"], image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80" },
  { id: "apollo-indraprastha", canonicalName: "Apollo Hospital, Indraprastha", city: "New Delhi", state: "Delhi", address: "Sarita Vihar, Delhi-Mathura Road, New Delhi - 110076", notes: "Large multidisciplinary hospital with oncology and cardiac programs.", conditionFocus: "Cardiology", specialityFocus: "Cardiac Care", successRate: 92, costRange: "₹3.1L - ₹5.4L", avgCost: 415000, distanceKm: 18, lat: 28.5187, lng: 77.2839, accreditationTier: "JCI & NABH", ownership: "Private Multi-Speciality", specialities: ["Cardiology", "Oncology", "Multi-Speciality Care"], facilities: ["Cath Lab", "Robotic Surgery", "Cancer Unit"], image: "https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?auto=format&fit=crop&w=800&q=80" },
  { id: "moolchand-medicity", canonicalName: "Moolchand Medicity", city: "New Delhi", state: "Delhi", address: "Lajpat Nagar-3, New Delhi - 110024", notes: "Prominent multi-specialty hospital offering broad tertiary care.", conditionFocus: "Multi-speciality", specialityFocus: "General Surgery", successRate: 89, costRange: "₹2.4L - ₹4.7L", avgCost: 350000, distanceKm: 16, lat: 28.5643, lng: 77.2388, accreditationTier: "NABH Accredited", ownership: "Private Hospital", specialities: ["Multi-Speciality Care", "General Surgery"], facilities: ["Critical Care", "Orthopedic Ward", "Diagnostic Labs"], image: "https://images.unsplash.com/photo-1519494080410-f9aa8f52f24e?auto=format&fit=crop&w=800&q=80" },
  { id: "fortis-rajan-dhall", canonicalName: "Fortis Flt Lt Rajan Dhall Hospital", city: "New Delhi", state: "Delhi", address: "Sector B, Pocket 1, Vasant Kunj, New Delhi - 110070", notes: "Tertiary care with stable cardiac and general acute care capacity.", conditionFocus: "Cardiology", specialityFocus: "Cardiac Care", successRate: 90, costRange: "₹2.8L - ₹4.9L", avgCost: 365000, distanceKm: 20, lat: 28.5196, lng: 77.1463, accreditationTier: "NABH Accreditation", ownership: "Private Multi-Speciality", specialities: ["Cardiology", "Multi-Speciality Care"], facilities: ["Cardiac ICU", "Emergency Medicine", "Imaging"], image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80" },
  { id: "apex-citi", canonicalName: "Apex Citi Hospital", city: "East Delhi", state: "Delhi", address: "D-440, West Vinod Nagar, East Delhi - 110092", notes: "NABH certificate valid through Jan 2028; a key East Delhi facility.", conditionFocus: "Multi-speciality", specialityFocus: "General Care", successRate: 84, costRange: "₹1.7L - ₹3.9L", avgCost: 275000, distanceKm: 19, lat: 28.6255, lng: 77.2876, accreditationTier: "SHCO Accredited", ownership: "Private Hospital", specialities: ["General Hospital Services", "Multi-Speciality Care"], facilities: ["Emergency", "General ICU", "Diagnostics"], image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80" },
  { id: "fortis-vasant-kunj", canonicalName: "Fortis Vasant Kunj", city: "New Delhi", state: "Delhi", address: "Vasant Kunj, New Delhi", notes: "162 beds; NABH, NABL, blood bank and nursing excellence accredited.", conditionFocus: "Multi-speciality", specialityFocus: "Bariatric & General Surgery", successRate: 89, costRange: "₹2.6L - ₹4.5L", avgCost: 345000, distanceKm: 21, lat: 28.5267, lng: 77.1368, accreditationTier: "NABH & NABL", ownership: "Private Multi-Speciality", specialities: ["Bariatric Surgery", "Multi-Speciality Care"], facilities: ["Blood Bank", "ICU", "Nursing Excellence Unit"], image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
  { id: "max-gurugram", canonicalName: "Max Hospital", city: "Gurugram", state: "Haryana", address: "B-Block, Sushant Lok 1, MF Husain Marg, Gurugram - 122001", notes: "NABH certified with cancer and neonatal care capability.", conditionFocus: "Oncology", specialityFocus: "Medical Oncology", successRate: 94, costRange: "₹3.0L - ₹5.7L", avgCost: 425000, distanceKm: 32, lat: 28.4705, lng: 77.0408, accreditationTier: "NABH Certified", ownership: "Private Super Speciality", specialities: ["Medical Oncology", "Neonatology", "Multi-Speciality Care"], facilities: ["Cancer Care", "Neonatal ICU", "Medical Wards"], image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" },
  { id: "fortis-memorial-research", canonicalName: "Fortis Memorial Research Institute", city: "Gurugram", state: "Haryana", address: "Gurugram", notes: "1000-bed quaternary care center for neurosciences, oncology and renal sciences.", conditionFocus: "Neurosciences", specialityFocus: "Neurosciences", successRate: 95, costRange: "₹3.6L - ₹6.8L", avgCost: 500000, distanceKm: 31, lat: 28.4425, lng: 77.0525, accreditationTier: "Private Quaternary Care", ownership: "Private Multi-Speciality", specialities: ["Neurosciences", "Oncology", "Renal Sciences", "Cardiac Sciences"], facilities: ["Neuro ICU", "Cardiac Science Unit", "Advanced Imaging"], image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" },
  { id: "motherhood-chaitanya", canonicalName: "Motherhood Chaitanya Hospital", city: "Chandigarh", state: "Punjab", address: "Hospital Site 1&2, Sector 44-C, Chandigarh - 160047", notes: "Maternity-focused with accreditation and neonatal care capacity.", conditionFocus: "Maternity", specialityFocus: "Maternity", successRate: 85, costRange: "₹1.3L - ₹2.7L", avgCost: 210000, distanceKm: 245, lat: 30.7185, lng: 76.8048, accreditationTier: "SHCO Accredited", ownership: "Private Maternity Hospital", specialities: ["Maternity", "Neonatology"], facilities: ["Maternity Ward", "NICU", "Obstetric Surgery"], image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80" },
  { id: "dharam-hospital", canonicalName: "Dharam Hospital Pvt Ltd", city: "Chandigarh", state: "Punjab", address: "#2040, Sector-15C, Chandigarh - 160015", notes: "Nephrology, dialysis, ob-gyn and vascular services in the tricity area.", conditionFocus: "Nephrology", specialityFocus: "Nephrology", successRate: 86, costRange: "₹1.8L - ₹4.1L", avgCost: 285000, distanceKm: 244, lat: 30.7375, lng: 76.7860, accreditationTier: "Accredited Hospital", ownership: "Private Multi-Speciality", specialities: ["Nephrology", "Dialysis", "Obstetrics and Gynaecology", "Vascular Surgery"], facilities: ["Dialysis Unit", "Vascular Ward", "OB-GYN Care"], image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80" },
  { id: "medicos-centre", canonicalName: "Medicos Centre & Clinics", city: "Chandigarh", state: "Punjab", address: "SCO 801-802, Sector 22A, Chandigarh - 160022", notes: "Clinic-focused accreditation suitable for outpatient and diagnostic pathways.", conditionFocus: "General Medicine", specialityFocus: "Outpatient Care", successRate: 80, costRange: "₹45k - ₹1.5L", avgCost: 110000, distanceKm: 242, lat: 30.7287, lng: 76.7768, accreditationTier: "Clinic Accreditation", ownership: "Private Clinic Network", specialities: ["Outpatient Care", "General Medicine"], facilities: ["OPD", "Diagnostics", "Consultation Rooms"], image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
  { id: "guru-nanak-mission", canonicalName: "Guru Nanak Mission Hospital", city: "Banga", state: "Punjab", address: "Chandigarh-Phagwara Road, Banga, SBS Nagar - 144505", notes: "100-bed facility with general care and acute care capability.", conditionFocus: "General Care", specialityFocus: "General Medicine", successRate: 82, costRange: "₹70k - ₹1.8L", avgCost: 145000, distanceKm: 390, lat: 31.1794, lng: 75.9804, accreditationTier: "Accredited Hospital", ownership: "Charitable Hospital", specialities: ["General Hospital Services", "General Medicine"], facilities: ["Emergency", "Medical Wards", "Diagnostics"], image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80" },
  { id: "capitol-hospital", canonicalName: "Capitol Hospital", city: "Jalandhar", state: "Punjab", address: "NH 44, Near Reru Chowk, Jalandhar - 144012", notes: "Broad tertiary scope across CTVS, nephrology, neurosurgery, oncology and urology.", conditionFocus: "Oncology", specialityFocus: "CTVS & Oncology", successRate: 90, costRange: "₹2.4L - ₹5.1L", avgCost: 395000, distanceKm: 370, lat: 31.3260, lng: 75.5762, accreditationTier: "Accredited Tertiary Care", ownership: "Private Tertiary Care", specialities: ["Cardiothoracic Surgery", "Nephrology", "Neurosurgery", "Oncology", "Urology"], facilities: ["ICU", "Operating Theatres", "Cancer Unit"], image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80" },
  { id: "sarvodya-hospital", canonicalName: "Sarvodya Hospital", city: "Jalandhar", state: "Punjab", address: "Opp. Khalsa College, G.T. Road, Jalandhar - 144001", notes: "102-bed tertiary hospital with broad secondary service availability.", conditionFocus: "General Care", specialityFocus: "General Medicine", successRate: 81, costRange: "₹1.1L - ₹2.9L", avgCost: 195000, distanceKm: 373, lat: 31.3260, lng: 75.5762, accreditationTier: "Accredited Hospital", ownership: "Private Hospital", specialities: ["General Hospital Services", "General Medicine"], facilities: ["General Ward", "Emergency", "Diagnostics"], image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" },
  { id: "shakuntala-devi-vig", canonicalName: "Shakuntala Devi Vig Hospital", city: "Jalandhar", state: "Punjab", address: "Main Kapurthala Road, Jalandhar - 144002", notes: "A general hospital with routine surgical and emergency pathways.", conditionFocus: "General Care", specialityFocus: "General Surgery", successRate: 83, costRange: "₹95k - ₹2.2L", avgCost: 170000, distanceKm: 375, lat: 31.3260, lng: 75.5762, accreditationTier: "Accredited Hospital", ownership: "Private Hospital", specialities: ["General Hospital Services", "General Surgery"], facilities: ["Emergency", "OT", "Medical Wards"], image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" },
  { id: "satyam-trauma", canonicalName: "Satyam Hospital and Trauma Centre", city: "Jalandhar", state: "Punjab", address: "392, Adarsh Nagar, Kapurthala Chowk, Jalandhar - 144008", notes: "Trauma and emergency-focused acute care center in central Jalandhar.", conditionFocus: "Trauma", specialityFocus: "Trauma Care", successRate: 79, costRange: "₹85k - ₹1.9L", avgCost: 140000, distanceKm: 374, lat: 31.3260, lng: 75.5762, accreditationTier: "Accredited Trauma Care", ownership: "Private Trauma Centre", specialities: ["Trauma Care", "Emergency Care"], facilities: ["Trauma Unit", "Emergency OT", "ICU"], image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80" },
  { id: "ranjit-hospital", canonicalName: "Ranjit Hospital", city: "Jalandhar", state: "Punjab", address: "58, Kapurthala Road, Jalandhar - 144001", notes: "General secondary care facility supporting day-care and surgery pathways.", conditionFocus: "General Care", specialityFocus: "General Surgery", successRate: 80, costRange: "₹80k - ₹1.8L", avgCost: 130000, distanceKm: 375, lat: 31.3260, lng: 75.5762, accreditationTier: "Accredited Hospital", ownership: "Private Hospital", specialities: ["General Hospital Services", "General Surgery"], facilities: ["Surgery", "OPD", "General Wards"], image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
  { id: "gtb-ludhiana", canonicalName: "Guru Teg Bahadur Sahib Charitable Hospital", city: "Ludhiana", state: "Punjab", address: "GTB Hospital Road, Model Town, Ludhiana - 141002", notes: "Maternity, orthopedics and paediatric care facility with charitable services.", conditionFocus: "Orthopedics", specialityFocus: "Orthopaedics", successRate: 84, costRange: "₹1.1L - ₹2.5L", avgCost: 180000, distanceKm: 315, lat: 30.9000, lng: 75.8573, accreditationTier: "Charitable Hospital", ownership: "Charitable Multi-Speciality", specialities: ["Obstetrics and Gynaecology", "Orthopaedics", "Paediatrics", "Plastic Surgery"], facilities: ["Orthopedic Ward", "NICU", "OB-GYN Services"], image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80" },
  { id: "malhotra-mandi", canonicalName: "Malhotra Hospital and Trauma Centre", city: "Mandi", state: "Himachal Pradesh", address: "Ner-Chowk, Mandi - 175008", notes: "Orthopedic and trauma services; accreditation validity should be checked before relying on it.", conditionFocus: "Orthopedics", specialityFocus: "Orthopaedics", successRate: 78, costRange: "₹1.0L - ₹2.4L", avgCost: 170000, distanceKm: 470, lat: 31.7099, lng: 76.9383, accreditationTier: "Directory Record", ownership: "Private Trauma Centre", specialities: ["Orthopaedics", "Joint Replacement", "Urology", "Trauma Care"], facilities: ["Orthopedic Ward", "Trauma OT", "Urology Ward"], image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" },
  { id: "sandhya-hot-spring", canonicalName: "Sandhya Hot Spring Healthcare", city: "Shimla", state: "Himachal Pradesh", address: "Tattapani, near Naldehra Golf Course, Shimla - 171301", notes: "AYUSH and wellness facility—not a general tertiary care center.", conditionFocus: "Wellness", specialityFocus: "Wellness", successRate: 65, costRange: "₹45k - ₹1.1L", avgCost: 90000, distanceKm: 410, lat: 31.1048, lng: 77.1734, accreditationTier: "AYUSH / Wellness", ownership: "AYUSH / Wellness Facility", specialities: ["AYUSH", "Wellness"], facilities: ["Wellness Therapy", "Thermal Baths", "Recovery Rooms"], image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" },
  { id: "nitin-hospital", canonicalName: "Nitin Hospital", city: "Patiala", state: "Punjab", address: "SCO-45,46,47, New Leela Bhawan Market, Patiala - 147001", notes: "General hospital with broader secondary care and emergency support.", conditionFocus: "General Care", specialityFocus: "General Medicine", successRate: 81, costRange: "₹90k - ₹2.0L", avgCost: 150000, distanceKm: 230, lat: 30.3400, lng: 76.3840, accreditationTier: "Accredited Hospital", ownership: "Private Hospital", specialities: ["General Hospital Services", "General Medicine"], facilities: ["Outpatient", "Emergency", "General Wards"], image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" }
];

const demoHospitals = allIndiaDemoHospitals;

export default function App() {
  const { user, isAuthenticated, isVerifier } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem("medscout-theme") === "dark");
  const [activeTab, setActiveTab] = useState("discovery"); // discovery, card, protocols, provenance, admin
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState("");

  // Location & Privacy state
  const [userCoords, setUserCoords] = useState(() => {
    try {
      const saved = localStorage.getItem("medscout_user_coords");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem("medscout_user_location") || null;
  });

  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !localStorage.getItem("medscout_user_location") && !localStorage.getItem("medscout_user_coords");
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Filters
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [selectedBudget, setSelectedBudget] = useState("All Pricing Tiers & Schemes");
  const [selectedScheme, setSelectedScheme] = useState("All Schemes & Private");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = localStorage.getItem("medscout_user_location");
    return savedLocation && KNOWN_LOCATIONS.has(savedLocation) ? savedLocation : "All India";
  });
  const [selectedSpeciality, setSelectedSpeciality] = useState("All Specialities");
  const [maxDistance, setMaxDistance] = useState(5000);
  const [sortBy, setSortBy] = useState("successRate");
  const [schemeShuffleSeed, setSchemeShuffleSeed] = useState(0);

  // Queued hospitals for side-by-side comparison
  const [queuedHospitals, setQueuedHospitals] = useState([]);
  const [isCompareMatrixOpen, setIsCompareMatrixOpen] = useState(false);

  // Selected hospital for deep-dive detail dossier
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState(null);

  // AI Chatbot Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState("");
  const [chatInitialReport, setChatInitialReport] = useState(null);

  // Automatically sync logged-in user profile city if available
  useEffect(() => {
    if (isAuthenticated && user?.city && !userLocation) {
      const city = user.city;
      setUserLocation(city);
      setSelectedLocation(city);
      setShowLocationPrompt(false);
      if (CITY_COORDINATES[city]) {
        setUserCoords(CITY_COORDINATES[city]);
        localStorage.setItem("medscout_user_coords", JSON.stringify(CITY_COORDINATES[city]));
      }
      localStorage.setItem("medscout_user_location", city);
    }
  }, [isAuthenticated, user]);

  const userLocationKnown = Boolean(userCoords || (userLocation && userLocation !== "All India"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("medscout-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location access is not supported by your browser. Please select your city from the list.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        const closestCity = findClosestCity(latitude, longitude);

        setUserCoords(coords);
        setUserLocation(closestCity);
        setSelectedLocation(closestCity);
        setShowLocationPrompt(false);
        setIsDetectingGps(false);

        localStorage.setItem("medscout_user_coords", JSON.stringify(coords));
        localStorage.setItem("medscout_user_location", closestCity);
      },
      (err) => {
        setIsDetectingGps(false);
        alert("Location access was denied or timed out. Please pick your city or browse All India.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (city) => {
    setUserLocation(city);
    setSelectedLocation(city);
    setShowLocationPrompt(false);
    localStorage.setItem("medscout_user_location", city);

    if (CITY_COORDINATES[city]) {
      setUserCoords(CITY_COORDINATES[city]);
      localStorage.setItem("medscout_user_coords", JSON.stringify(CITY_COORDINATES[city]));
    } else {
      setUserCoords(null);
      localStorage.removeItem("medscout_user_coords");
    }
  };

  const handleBrowseAllIndia = () => {
    setSelectedLocation("All India");
    setShowLocationPrompt(false);
  };

  const getFilteredDemoHospitals = () => {
    let results = demoHospitals.map(h => {
      let computedDist = null;
      let computedMins = null;

      const activeLat = userCoords?.lat || (selectedLocation && CITY_COORDINATES[selectedLocation]?.lat);
      const activeLng = userCoords?.lng || (selectedLocation && CITY_COORDINATES[selectedLocation]?.lng);

      if (userLocationKnown && activeLat && activeLng && h.lat && h.lng) {
        computedDist = calculateDistanceKm(activeLat, activeLng, h.lat, h.lng);
        computedMins = Math.round(computedDist * 2.2);
      }

      return {
        ...h,
        distanceKm: computedDist,
        driveMinutes: computedMins
      };
    });

    if (selectedCondition && selectedCondition !== "All Conditions") {
      const condition = selectedCondition.toLowerCase();
      const normalizedCondition = CONDITION_ALIASES[condition] || selectedCondition;
      results = results.filter(h =>
        (h.conditionFocus || "").toLowerCase().includes(condition) ||
        (h.specialityFocus || "").toLowerCase().includes(condition) ||
        (h.specialities || []).some(s => s.toLowerCase().includes(condition)) ||
        (h.supportedDiseases || []).some(disease => {
          const normalizedDisease = disease.toLowerCase();
          return normalizedDisease === condition || normalizedDisease.includes(condition) || condition.includes(normalizedDisease) || normalizedDisease === normalizedCondition.toLowerCase();
        })
      );
    }

    if (selectedLocation && selectedLocation !== "All India" && selectedLocation !== "All locations") {
      const loc = selectedLocation.toLowerCase();
      results = results.filter(h =>
        (loc === "delhi ncr" && (h.city.toLowerCase().includes("delhi") || h.city.toLowerCase().includes("gurugram") || h.state.toLowerCase() === "haryana")) ||
        h.city.toLowerCase().includes(loc) ||
        h.state.toLowerCase().includes(loc) ||
        h.address.toLowerCase().includes(loc)
      );
    }

    if (selectedSpeciality && selectedSpeciality !== "All Specialities") {
      const spec = selectedSpeciality.toLowerCase();
      results = results.filter(h =>
        (h.specialities || []).some(s => s.toLowerCase().includes(spec)) ||
        (h.specialityFocus || "").toLowerCase().includes(spec)
      );
    }

    if (maxDistance && maxDistance < 5000 && userLocationKnown) {
      results = results.filter(h => h.distanceKm !== null && Number(h.distanceKm) <= Number(maxDistance));
    }

    if (selectedBudget && selectedBudget !== "All Pricing Tiers & Schemes") {
      if (selectedBudget.includes("PM-JAY") || selectedBudget.includes("2.2")) {
        results = results.filter(h => (h.avgCost || 0) <= 220000);
      } else if (selectedBudget.includes("3,50,000") || selectedBudget.includes("3.5")) {
        results = results.filter(h => (h.avgCost || 0) <= 350000);
      } else if (selectedBudget.includes("5,50,000") || selectedBudget.includes("5.5")) {
        results = results.filter(h => (h.avgCost || 0) <= 550000);
      }
    }

    if (selectedScheme && selectedScheme !== "All Schemes & Private") {
      if (selectedScheme === "Subsidized Hospitals Only") {
        results = results.filter(h => h.subsidyAvailable === true);
      } else if (selectedScheme === "Private Only (Without Subsidy)") {
        results = results.filter(h => !h.subsidyAvailable);
      } else if (selectedScheme === "Ayushman Bharat (PM-JAY)") {
        results = results.filter(h =>
          (h.governmentSchemes || []).some(s => s.toLowerCase().includes("pm-jay") || s.toLowerCase().includes("ayushman"))
        );
      } else if (selectedScheme === "Central Govt Health Scheme (CGHS)") {
        results = results.filter(h =>
          (h.governmentSchemes || []).some(s => s.toLowerCase().includes("cghs"))
        );
      } else if (selectedScheme === "Ex-Servicemen Scheme (ECHS)") {
        results = results.filter(h =>
          (h.governmentSchemes || []).some(s => s.toLowerCase().includes("echs"))
        );
      } else if (selectedScheme === "State Government Health Schemes") {
        results = results.filter(h =>
          (h.governmentSchemes || []).some(s => s.toLowerCase().includes("state"))
        );
      } else if (selectedScheme === "Any Govt Scheme Accepted") {
        results = results.filter(h => (h.governmentSchemes || []).length > 0);
      }
    }

    const sorted = [...results].sort((a, b) => {
      if (selectedScheme !== "All Schemes & Private") {
        const shuffleKey = (id) => [...id].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, schemeShuffleSeed + 1);
        const aKey = Math.sin(shuffleKey(a.id) * 12.9898) * 43758.5453;
        const bKey = Math.sin(shuffleKey(b.id) * 12.9898) * 43758.5453;
        return (aKey - Math.floor(aKey)) - (bKey - Math.floor(bKey));
      }
      if (sortBy === "distance") {
        if (!userLocationKnown) return 0;
        return Number(a.distanceKm || 9999) - Number(b.distanceKm || 9999);
      }
      if (sortBy === "cost") return Number(a.avgCost || 0) - Number(b.avgCost || 0);
      if (sortBy === "specialist") {
        const aScore = (a.specialities || []).length + (a.specialityFocus ? 2 : 0);
        const bScore = (b.specialities || []).length + (b.specialityFocus ? 2 : 0);
        return bScore - aScore || (b.successRate || 0) - (a.successRate || 0);
      }
      return (b.successRate || 0) - (a.successRate || 0);
    });

    return sorted;
  };

  const fetchHospitals = async () => {
    setLoading(true);
    setHospitalError("");

    const results = getFilteredDemoHospitals();
    setHospitals(results);
    if (queuedHospitals.length === 0 && results.length >= 2) {
      setQueuedHospitals([results[0], results[1]]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCondition, selectedBudget, selectedScheme, selectedLocation, selectedSpeciality, maxDistance, sortBy, schemeShuffleSeed, userCoords, userLocationKnown]);

  const handleToggleQueue = (hospital) => {
    setQueuedHospitals(prev => {
      const exists = prev.some(h => h.id === hospital.id);
      if (exists) {
        return prev.filter(h => h.id !== hospital.id);
      } else {
        if (prev.length >= 4) {
          alert("Maximum 4 facilities can be compared simultaneously in the matrix.");
          return prev;
        }
        return [...prev, hospital];
      }
    });
  };

  const handleRemoveFromQueue = (id) => {
    setQueuedHospitals(prev => prev.filter(h => h.id !== id));
  };

  const handleClearQueue = () => {
    setQueuedHospitals([]);
  };

  const handleStructuredSearch = (searchParams) => {
    fetchHospitals();
  };

  const handleNaturalLanguageSearch = (prompt, attachedReport = null) => {
    if (prompt && prompt.trim()) {
      setChatInitialPrompt(prompt.trim());
    }
    if (attachedReport) {
      setChatInitialReport(attachedReport);
    }
    setIsChatOpen(true);
  };

  const handleApplyExtractedFilters = (filters) => {
    if (filters.disease) setSelectedCondition(filters.disease);
    if (filters.budgetCelling) setSelectedBudget(filters.budgetCelling);
    fetchHospitals();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
      {/* 1. Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queuedCount={queuedHospitals.length}
        onOpenCompare={() => setIsCompareMatrixOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenProfile={() => setActiveTab("profile")}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(value => !value)}
      />

      <main className="flex-1 pt-16">
        {/* VIEW 1: SEARCH & DISCOVERY (HOME) */}
        {activeTab === "discovery" && (
          <div className="space-y-0">
            {/* Search Hero with 3D Ambient WebGL Network */}
            <SearchHero
              onSearch={handleStructuredSearch}
              onNaturalLanguageSearch={handleNaturalLanguageSearch}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedBudget={selectedBudget}
              setSelectedBudget={setSelectedBudget}
              selectedScheme={selectedScheme}
              setSelectedScheme={(scheme) => {
                setSelectedScheme(scheme);
                setSchemeShuffleSeed(seed => seed + 1);
              }}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedSpeciality={selectedSpeciality}
              setSelectedSpeciality={setSelectedSpeciality}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              sortBy={sortBy}
              setSortBy={setSortBy}
              hospitalCount={hospitals.length}
              hospitals={hospitals}
              onSelectHospital={(h) => setSelectedHospitalForModal(h)}
              onLocationDetected={(loc) => {
                setUserCoords(loc.coords);
                setUserLocation(loc.city);
                setSelectedLocation(loc.city);
                setShowLocationPrompt(false);
                localStorage.setItem("medscout_user_coords", JSON.stringify(loc.coords));
                localStorage.setItem("medscout_user_location", loc.city);
              }}
            />

            {/* Privacy & Location Access Prompt Banner */}
            {!userLocationKnown && showLocationPrompt && !isAuthenticated && (
              <LocationRequestBanner
                onDetectGps={handleDetectLocation}
                isDetectingGps={isDetectingGps}
                onSelectCity={handleSelectCity}
                onOpenLogin={() => window.dispatchEvent(new CustomEvent("medscout:open-auth"))}
                onBrowseAllIndia={handleBrowseAllIndia}
                onClose={() => setShowLocationPrompt(false)}
              />
            )}

            {/* Statutory Provenance Strip */}
            <ProvenanceStrip />

            {/* Featured Live Comparison Matrix Section */}
            <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 gap-4 border-b border-surface-container-high/60">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-secondary-container text-secondary text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span>Updated quarterly • Last check: Q3</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
                    Clinical Comparison: {selectedCondition}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-tertiary">
                      {userLocationKnown ? (
                        <>Sourced from official government health records for verified facilities near <strong className="text-on-surface font-semibold">{selectedLocation}</strong>.</>
                      ) : (
                        <>Sourced from official government health records across India. Set location or log in to view nearby facilities and travel distances.</>
                      )}
                    </p>
                    {userLocationKnown ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowLocationPrompt(true);
                          setUserLocation(null);
                          setUserCoords(null);
                          setSelectedLocation("All India");
                          localStorage.removeItem("medscout_user_location");
                          localStorage.removeItem("medscout_user_coords");
                        }}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        (Change location)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLocationPrompt(true)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        (Set location)
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs font-semibold text-tertiary">
                  Showing {hospitals.length} verified facilities
                </div>
              </div>

              <div className="mt-8">
                {loading ? (
                  <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-12 text-center text-sm text-tertiary flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading hospitals from the clinical registry…</span>
                  </div>
                ) : hospitalError ? (
                  <div className="rounded-2xl border border-danger/30 bg-danger-light p-8 text-center text-sm text-danger">
                    <p>{hospitalError}</p>
                    <button onClick={fetchHospitals} className="mt-4 rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white">Retry registry connection</button>
                  </div>
                ) : hospitals.length === 0 ? (
                  <div className="rounded-2xl border border-warning/30 bg-warning-light p-8 text-center text-sm text-warning">
                    No hospitals match the current search criteria. Try adjusting your distance radius or condition filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hospitals.map((hosp) => (
                      <HospitalCard
                        key={hosp.id}
                        hospital={hosp}
                        isQueued={queuedHospitals.some(q => q.id === hosp.id)}
                        onToggleQueue={handleToggleQueue}
                        onOpenDetails={(h) => setSelectedHospitalForModal(h)}
                        userLocationKnown={userLocationKnown}
                        onPromptLocation={() => setShowLocationPrompt(true)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Transparent 5-Tier Ranking Methodology Section */}
            <RankingMethodologySection
              onReadMethodology={() => setActiveTab("provenance")}
            />
          </div>
        )}

        {/* VIEW 2: DISEASE PROTOCOLS */}
        {activeTab === "protocols" && (
          <DiseaseProtocolsView
            onSelectCondition={(cond) => {
              setSelectedCondition(cond);
              setActiveTab("discovery");
            }}
          />
        )}

        {/* VIEW 3: DATA PROVENANCE & REGISTRY STANDARDS */}
        {activeTab === "provenance" && <DataProvenanceView />}

        {activeTab === "card" && <HealthCardPage onOpenChat={() => setIsChatOpen(true)} />}

        {/* VIEW 4: ADMIN VERIFICATION WORKBENCH */}
        {activeTab === "admin" && (isVerifier() ? <AdminVerificationView /> : null)}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {/* Floating Docked Comparison Queue Bar */}
      <FloatingCompareTray
        queuedHospitals={queuedHospitals}
        onClear={handleClearQueue}
        onOpenCompare={() => setIsCompareMatrixOpen(true)}
      />

      {/* Side-by-Side Comparison Matrix Modal */}
      {isCompareMatrixOpen && (
        <CompareMatrix
          hospitals={queuedHospitals.length > 0 ? queuedHospitals : hospitals.slice(0, 3)}
          onClose={() => setIsCompareMatrixOpen(false)}
          onRemoveHospital={handleRemoveFromQueue}
        />
      )}

      {/* Deep-Dive Hospital Detail Dossier Modal */}
      {selectedHospitalForModal && (
        <HospitalDetailModal
          hospital={selectedHospitalForModal}
          onClose={() => setSelectedHospitalForModal(null)}
          onQueue={handleToggleQueue}
        />
      )}

      {/* Slide-over Grounded AI Chatbot Drawer */}
      <AIChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatInitialPrompt}
        initialReport={chatInitialReport}
        onClearInitialPrompt={() => {
          setChatInitialPrompt("");
          setChatInitialReport(null);
        }}
        initialLocation={userLocationKnown ? selectedLocation : null}
        onApplyExtractedFilters={handleApplyExtractedFilters}
        onViewHospital={(h) => setSelectedHospitalForModal(h)}
        onQueueHospital={(h) => handleToggleQueue(h)}
      />

      {/* Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />
    </div>
  );
}
