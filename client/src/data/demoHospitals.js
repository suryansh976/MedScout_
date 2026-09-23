const images = {
  general: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
  clinic: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
  care: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
  cardiac: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
  women: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80"
};

const records = [
  ["demo-aiims-delhi", "AIIMS New Delhi", "New Delhi", "Delhi", "Ansari Nagar, New Delhi - 110029", "Cardiology", "Cardiothoracic Surgery", 97, "₹0.9L - ₹2.4L", 160000, 8, 28.5672, 77.2100, "Central Government Institute", "Public Autonomous", ["Cardiology", "Cardiothoracic Surgery", "Neurology", "Oncology"], ["Cardiac ICU", "Emergency", "Organ Transplant", "Research Centre"], "NABH and ICMR linked; apex public referral centre.", 3180, 1.08, images.cardiac],
  ["demo-sir-ganga-ram", "Sir Ganga Ram Hospital", "New Delhi", "Delhi", "Rajinder Nagar, New Delhi - 110060", "Cardiology", "Cardiac Surgery", 93, "₹3.2L - ₹5.8L", 420000, 12, 28.6401, 77.1951, "Private Trust", "Private Trust Multi-Speciality", ["Cardiology", "Oncology", "Hepatobiliary Surgery"], ["Cardiac ICU", "Oncology Unit", "Robotic Surgery"], "NABH accredited flagship with tertiary cardiac and oncology services.", 2140, 1.32, images.general],
  ["demo-apollo-delhi", "Apollo Hospital Indraprastha", "New Delhi", "Delhi", "Sarita Vihar, New Delhi - 110076", "Cardiology", "Cardiac Care", 92, "₹3.1L - ₹5.4L", 415000, 18, 28.5187, 77.2839, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Oncology", "Transplant Medicine"], ["Cath Lab", "Robotic Surgery", "Cancer Unit"], "Large multidisciplinary hospital with cardiac and oncology programs.", 1980, 1.4, images.cardiac],
  ["demo-max-saket", "Max Smart Super Speciality Hospital", "New Delhi", "Delhi", "Press Enclave Road, Saket - 110017", "Nephrology", "Renal Transplant", 96, "₹3.5L - ₹6.2L", 475000, 14, 28.5244, 77.2088, "Private Hospital", "Private Super Speciality", ["Renal Transplant", "Nephrology", "Oncology"], ["Renal ICU", "Dialysis Unit", "High Dependency Ward"], "250-bed NABH-certified tertiary centre with renal transplant capability.", 1450, 1.21, images.general],
  ["demo-fortis-delhi", "Fortis Escorts Heart Institute", "New Delhi", "Delhi", "Okhla Road, New Delhi - 110025", "Cardiology", "Cardiac Surgery", 94, "₹3.4L - ₹6.0L", 460000, 15, 28.5622, 77.2732, "Private Hospital", "Single-Specialty Cardiac Centre", ["Cardiothoracic Surgery", "Pediatric Cardiology", "Electrophysiology"], ["Cardiac ICU", "3D Mapping Lab", "Cardiac MRI"], "NABH and JCI cardiac centre with adult and paediatric programs.", 1890, 1.19, images.cardiac],
  ["demo-fortis-gurugram", "Fortis Memorial Research Institute", "Gurugram", "Haryana", "Sector 44, Gurugram - 122002", "Neurosciences", "Neurosciences", 95, "₹3.6L - ₹6.8L", 500000, 31, 28.4425, 77.0525, "Private Hospital", "Private Quaternary Care", ["Neurosciences", "Oncology", "Renal Sciences", "Cardiac Sciences"], ["Neuro ICU", "Cardiac Sciences", "Advanced Imaging"], "1000-bed quaternary centre with neuroscience, oncology and renal programs.", 2800, 1.26, images.care],
  ["demo-medanta-gurugram", "Medanta The Medicity", "Gurugram", "Haryana", "Sector 38, Gurugram - 122001", "Cardiology", "Cardiothoracic Surgery", 91, "₹3.0L - ₹6.1L", 440000, 29, 28.4239, 77.0415, "Private Hospital", "Corporate Multi-Speciality", ["Cardiothoracic Surgery", "Orthopedics", "Neurosciences", "Transplant"], ["Heart Institute ICU", "Surgical Robot", "Organ Retrieval Centre"], "Multi-speciality tertiary hospital with high-volume transplant and cardiac services.", 1650, 1.28, images.general],
  ["demo-pgimer", "PGIMER Chandigarh", "Chandigarh", "Chandigarh", "Sector 12, Chandigarh - 160012", "Neurology", "Neurology and Research", 96, "₹0.4L - ₹1.8L", 105000, 245, 30.7647, 76.7797, "Central Government Institute", "Public Academic Institute", ["Neurology", "Cardiology", "Nephrology", "Oncology"], ["Emergency", "Research Centre", "Transplant Unit", "Teaching Hospital"], "Government academic referral centre with broad specialty coverage.", 4200, 1.15, images.care],
  ["demo-dharam-chandigarh", "Dharam Hospital Pvt Ltd", "Chandigarh", "Chandigarh", "Sector 15C, Chandigarh - 160015", "Nephrology", "Nephrology", 86, "₹1.8L - ₹4.1L", 285000, 244, 30.7375, 76.7860, "Private Hospital", "Private Multi-Speciality", ["Nephrology", "Dialysis", "Vascular Surgery", "Obstetrics and Gynaecology"], ["Dialysis Unit", "Vascular Ward", "Emergency", "Diagnostics"], "Nephrology, dialysis, ob-gyn and vascular services in the tricity area.", 920, 1.8, images.general],
  ["demo-capitol-jalandhar", "Capitol Hospital", "Jalandhar", "Punjab", "NH 44, Near Reru Chowk, Jalandhar - 144012", "Oncology", "CTVS and Oncology", 90, "₹2.4L - ₹5.1L", 395000, 370, 31.3260, 75.5762, "Private Hospital", "Private Tertiary Care", ["Cardiothoracic Surgery", "Nephrology", "Neurosurgery", "Oncology", "Urology"], ["ICU", "Operating Theatres", "Cancer Unit", "Dialysis"], "Broad tertiary scope across cardiac, renal, neuro, oncology and urology care.", 1240, 1.55, images.care],
  ["demo-dmc-ludhiana", "Dayanand Medical College and Hospital", "Ludhiana", "Punjab", "Civil Lines, Ludhiana - 141001", "Cardiology", "Tertiary Multi-Speciality", 92, "₹1.4L - ₹4.6L", 300000, 315, 30.9010, 75.8573, "Teaching Hospital", "Public-Trust Academic", ["Cardiology", "Orthopedics", "Oncology", "Pediatrics", "Nephrology"], ["Trauma Centre", "Teaching Hospital", "ICU", "Transplant Services"], "Academic referral centre with broad clinical and teaching programs.", 2400, 1.44, images.general],
  ["demo-apollo-chennai", "Apollo Hospitals Chennai", "Chennai", "Tamil Nadu", "Greams Road, Chennai - 600006", "Cardiology", "Cardiac Care", 94, "₹3.0L - ₹6.5L", 470000, 2180, 13.0569, 80.2425, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Oncology", "Transplant", "Orthopedics"], ["Heart Institute", "Robotic Surgery", "Transplant ICU", "Cancer Centre"], "National tertiary care centre with cardiac, oncology and transplant services.", 2750, 1.22, images.cardiac],
  ["demo-miot-chennai", "MIOT International", "Chennai", "Tamil Nadu", "Manapakkam, Chennai - 600089", "Orthopedics", "Joint Replacement", 93, "₹2.2L - ₹5.0L", 350000, 2195, 13.0340, 80.1686, "Private Hospital", "Private Multi-Speciality", ["Orthopedics", "Trauma", "Transplant", "Cardiology"], ["Joint Replacement", "Trauma ICU", "Imaging", "Rehabilitation"], "Known for orthopedics, trauma and complex multi-specialty care.", 1850, 1.36, images.care],
  ["demo-narayana-bengaluru", "Narayana Health City", "Bengaluru", "Karnataka", "Bommasandra, Bengaluru - 560099", "Cardiology", "Cardiac Surgery", 95, "₹1.8L - ₹4.8L", 310000, 2050, 12.8452, 77.6602, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Cardiac Surgery", "Oncology", "Pediatrics"], ["Cardiac ICU", "Pediatric Cardiac Unit", "Cancer Centre", "Research"], "High-volume cardiac and multi-specialty campus with complex-care programs.", 3600, 1.05, images.cardiac],
  ["demo-manipal-bengaluru", "Manipal Hospital Old Airport Road", "Bengaluru", "Karnataka", "Old Airport Road, Bengaluru - 560017", "Nephrology", "Renal Transplant", 92, "₹2.5L - ₹5.5L", 390000, 2040, 12.9600, 77.6412, "Private Hospital", "Private Multi-Speciality", ["Nephrology", "Transplant", "Neurology", "Oncology"], ["Dialysis", "Transplant ICU", "Neuro ICU", "Advanced Imaging"], "Established multi-specialty centre with renal and transplant programs.", 2100, 1.31, images.general],
  ["demo-tata-mumbai", "Tata Memorial Hospital", "Mumbai", "Maharashtra", "Parel, Mumbai - 400012", "Oncology", "Medical Oncology", 96, "₹0.5L - ₹3.2L", 155000, 1400, 19.0040, 72.8420, "Central Government Institute", "Autonomous Cancer Institute", ["Medical Oncology", "Surgical Oncology", "Hematology", "Radiation Oncology"], ["Cancer Centre", "PET-CT", "Bone Marrow Transplant", "Research"], "Public cancer institute with national referral and research programs.", 5200, 2.1, images.care],
  ["demo-kokilaben-mumbai", "Kokilaben Dhirubhai Ambani Hospital", "Mumbai", "Maharashtra", "Andheri West, Mumbai - 400053", "Neurosciences", "Neurosciences", 94, "₹3.0L - ₹7.0L", 490000, 1410, 19.1364, 72.8258, "Private Hospital", "Private Quaternary Care", ["Neurosciences", "Oncology", "Cardiology", "Robotic Surgery"], ["Neuro ICU", "Robotic Surgery", "Cancer Centre", "Transplant"], "Quaternary care centre with advanced neuro, oncology and robotic programs.", 2400, 1.3, images.general],
  ["demo-narayana-kolkata", "Narayana Superspeciality Hospital Howrah", "Kolkata", "West Bengal", "Andul Road, Howrah - 711103", "Cardiology", "Cardiac Surgery", 90, "₹1.7L - ₹4.2L", 275000, 1500, 22.5839, 88.2636, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Cardiac Surgery", "Oncology", "Nephrology"], ["Cardiac ICU", "Cath Lab", "Dialysis", "Emergency"], "Eastern India tertiary centre with cardiac and oncology programs.", 1900, 1.42, images.cardiac],
  ["demo-jaslok-mumbai", "Jaslok Hospital and Research Centre", "Mumbai", "Maharashtra", "Pedder Road, Mumbai - 400026", "Nephrology", "Transplant Medicine", 89, "₹2.8L - ₹6.0L", 420000, 1415, 18.9714, 72.8093, "Private Hospital", "Private Multi-Speciality", ["Nephrology", "Transplant", "Oncology", "Cardiology"], ["Transplant Unit", "ICU", "Dialysis", "Research Centre"], "Long-standing tertiary hospital with specialist and transplant services.", 1320, 1.5, images.general],
  ["demo-care-hyderabad", "CARE Hospitals Banjara Hills", "Hyderabad", "Telangana", "Banjara Hills, Hyderabad - 500034", "Cardiology", "Cardiac Care", 91, "₹2.0L - ₹4.8L", 325000, 1550, 17.4156, 78.4347, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Neurology", "Orthopedics", "Oncology"], ["Cardiac ICU", "Stroke Unit", "Emergency", "Diagnostics"], "Multi-specialty hospital serving Telangana and regional referral patients.", 1760, 1.35, images.cardiac],
  ["demo-kims-hyderabad", "KIMS Hospitals Secunderabad", "Hyderabad", "Telangana", "Minister Road, Secunderabad - 500003", "Cardiology", "Cardiothoracic Surgery", 90, "₹1.8L - ₹4.5L", 300000, 1545, 17.4399, 78.4983, "Private Hospital", "Private Multi-Speciality", ["Cardiothoracic Surgery", "Nephrology", "Neurology", "Critical Care"], ["Heart Institute", "Dialysis", "Neuro ICU", "Emergency"], "Regional tertiary care hospital with cardiac and critical-care capability.", 1520, 1.49, images.general],
  ["demo-amrita-kochi", "Amrita Hospital Kochi", "Kochi", "Kerala", "Ponekkara, Kochi - 682041", "Cardiology", "Cardiac Surgery", 95, "₹2.2L - ₹5.6L", 390000, 2700, 10.0447, 76.2942, "Private Hospital", "Academic Multi-Speciality", ["Cardiology", "Neurosciences", "Oncology", "Transplant"], ["Cardiac ICU", "Robotic Surgery", "Transplant", "Research"], "Academic tertiary centre with broad complex-care and transplant services.", 2800, 1.17, images.care],
  ["demo-medanta-lucknow", "Medanta Hospital Lucknow", "Lucknow", "Uttar Pradesh", "Sultanpur Road, Lucknow - 226010", "Cardiology", "Cardiac Care", 89, "₹1.7L - ₹4.4L", 285000, 490, 26.8467, 80.9462, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Neurology", "Oncology", "Nephrology"], ["Cardiac ICU", "Cancer Centre", "Dialysis", "Emergency"], "Uttar Pradesh tertiary centre with cardiac and cancer services.", 1440, 1.54, images.general],
  ["demo-sgs-jaipur", "Sawai Man Singh Hospital", "Jaipur", "Rajasthan", "JLN Marg, Jaipur - 302004", "General Medicine", "Government Tertiary Care", 87, "₹0.2L - ₹1.5L", 65000, 280, 26.9124, 75.7873, "State Government Hospital", "Public Teaching Hospital", ["General Medicine", "Cardiology", "Oncology", "Trauma"], ["Emergency", "Trauma Centre", "Teaching Hospital", "ICU"], "Large public teaching hospital with broad government referral services.", 4500, 1.62, images.care],
  ["demo-sterling-ahmedabad", "Sterling Hospital Ahmedabad", "Ahmedabad", "Gujarat", "Memnagar, Ahmedabad - 380052", "Cardiology", "Cardiac Care", 90, "₹1.8L - ₹4.7L", 315000, 950, 23.0470, 72.5277, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Oncology", "Nephrology", "Orthopedics"], ["Cath Lab", "Dialysis", "Cancer Centre", "ICU"], "Gujarat multi-specialty hospital with cardiac and oncology programs.", 1680, 1.43, images.cardiac],
  ["demo-medanta-patna", "Jay Prabha Medanta Hospital", "Patna", "Bihar", "Jai Prakash Nagar, Patna - 800025", "Cardiology", "Cardiac Care", 86, "₹1.2L - ₹3.5L", 220000, 1050, 25.5941, 85.1376, "Private Hospital", "Private Multi-Speciality", ["Cardiology", "Nephrology", "Neurology", "General Surgery"], ["Cardiac ICU", "Dialysis", "Emergency", "Diagnostics"], "Regional tertiary care facility serving Bihar and nearby states.", 1180, 1.78, images.general],
  ["demo-igmc-shimla", "Indira Gandhi Medical College Shimla", "Shimla", "Himachal Pradesh", "Ridge Sanjauli Road, Shimla - 171001", "General Medicine", "Government Tertiary Care", 84, "₹0.2L - ₹1.2L", 55000, 410, 31.1048, 77.1734, "State Government Hospital", "Public Teaching Hospital", ["General Medicine", "Trauma", "Orthopedics", "Pediatrics"], ["Emergency", "Trauma Unit", "Teaching Hospital", "ICU"], "Government teaching hospital and referral centre for Himachal Pradesh.", 2100, 1.75, images.care]
  , ["demo-sir-ganga-ram-city", "Sir Ganga Ram City Hospital", "New Delhi", "Delhi", "B-1/1, Pusa Road, Delhi - 110060", "Cardiology", "Cardiac Surgery", 90, "₹2.8L - ₹5.0L", 385000, 11, 28.6384, 77.1653, "NABH Accredited", "Private Trust Multi-Speciality", ["Cardiology", "Oncology", "Hepatobiliary Surgery"], ["Cardiac ICU", "Oncology Ward", "Cath Lab"], "Cardiology, hepato-pancreato-biliary surgery and oncology services.", 1720, 1.5, images.cardiac],
  ["demo-sir-ganga-ram-kolmet", "Sir Ganga Ram Kolmet Hospital", "New Delhi", "Delhi", "7B, Pusa Road, Karol Bagh, New Delhi - 110005", "General Medicine", "Multi-Speciality Care", 86, "₹1.8L - ₹3.8L", 270000, 12, 28.6513, 77.1975, "SHCO Accredited", "Private Trust Multi-Speciality", ["Multi-Speciality Care", "General Surgery"], ["General ICU", "Emergency", "Diagnostics"], "Directory demo record with SHCO certificate noted as valid to Nov 2028.", 980, 1.9, images.general],
  ["demo-blk-memorial", "Dr B L Kapur Memorial Hospital", "New Delhi", "Delhi", "Pusa Road, New Delhi - 110005", "General Medicine", "Multi-Speciality Care", 88, "₹2.0L - ₹4.2L", 310000, 11, 28.6435, 77.1874, "Accredited Hospital", "Private Multi-Speciality", ["Tertiary Care", "Multi-Speciality Care"], ["General ICU", "Emergency", "Medical Wards"], "Multi-specialty tertiary care hospital in central Delhi.", 1340, 1.7, images.general],
  ["demo-moolchand-medicity", "Moolchand Medicity", "New Delhi", "Delhi", "Lajpat Nagar-3, New Delhi - 110024", "General Medicine", "Multi-Speciality Care", 87, "₹1.9L - ₹4.0L", 295000, 16, 28.5643, 77.2388, "Accredited Hospital", "Private Multi-Speciality", ["Multi-Speciality Care", "Orthopedics", "General Medicine"], ["Critical Care", "Orthopedic Ward", "Diagnostics"], "Multi-specialty hospital with broad clinical services.", 1210, 1.8, images.general],
  ["demo-fortis-rajan-dhall", "Fortis Flt Lt Rajan Dhall Hospital", "New Delhi", "Delhi", "Sector B, Pocket 1, Vasant Kunj, New Delhi - 110070", "Cardiology", "Cardiac Care", 90, "₹2.8L - ₹4.9L", 365000, 20, 28.5196, 77.1463, "NABH Accredited", "Private Multi-Speciality", ["Cardiology", "Multi-Speciality Care"], ["Cardiac ICU", "Emergency", "Imaging"], "Tertiary care hospital with cardiac and acute-care capacity.", 1450, 1.58, images.cardiac],
  ["demo-apex-citi", "Apex Citi Hospital", "East Delhi", "Delhi", "D-440, West Vinod Nagar, East Delhi - 110092", "General Medicine", "General Care", 82, "₹1.4L - ₹3.2L", 235000, 19, 28.6255, 77.2876, "SHCO Accredited", "Private Hospital", ["General Hospital Services", "Multi-Speciality Care"], ["Emergency", "General ICU", "Diagnostics"], "SHCO demo record with validity noted through January 2028.", 760, 2.1, images.clinic],
  ["demo-fortis-vasant-kunj", "Fortis Vasant Kunj", "New Delhi", "Delhi", "Vasant Kunj, New Delhi", "General Surgery", "Bariatric and General Surgery", 89, "₹2.6L - ₹4.5L", 345000, 21, 28.5267, 77.1368, "NABH and NABL", "Private Multi-Speciality", ["Bariatric Surgery", "Multi-Speciality Care"], ["Blood Bank", "ICU", "Nursing Excellence Unit"], "162-bed demo profile with NABH, NABL and blood bank accreditation notes.", 1180, 1.72, images.clinic],
  ["demo-max-gurugram", "Max Hospital Gurugram", "Gurugram", "Haryana", "B-Block, Sushant Lok 1, Gurugram - 122001", "Oncology", "Medical Oncology", 92, "₹2.9L - ₹5.5L", 410000, 32, 28.4705, 77.0408, "NABH Accredited", "Private Multi-Speciality", ["Medical Oncology", "Neonatology", "Multi-Speciality Care"], ["Cancer Care", "Neonatal ICU", "Medical Wards"], "NABH demo record with medical oncology and neonatology services.", 1560, 1.46, images.general],
  ["demo-motherhood-chaitanya", "Motherhood Chaitanya Hospital", "Chandigarh", "Chandigarh", "Hospital Site 1&2, Sector 44-C, Chandigarh - 160047", "Maternity", "Maternity", 85, "₹1.3L - ₹2.7L", 210000, 245, 30.7185, 76.8048, "SHCO Accredited", "Private Maternity Hospital", ["Maternity", "Neonatology"], ["Maternity Ward", "NICU", "Obstetric Surgery"], "Maternity-focused demo profile with neonatal care capability.", 890, 1.9, images.women],
  ["demo-medicos-centre", "Medicos Centre and Clinics", "Chandigarh", "Chandigarh", "SCO 801-802, Sector 22A, Chandigarh - 160022", "General Medicine", "Outpatient Care", 80, "₹45k - ₹1.5L", 110000, 242, 30.7287, 76.7768, "Clinic Accreditation", "Private Clinic Network", ["Outpatient Care", "General Medicine"], ["OPD", "Diagnostics", "Consultation Rooms"], "Clinic-level demo record for outpatient and diagnostic pathways.", 620, 2.2, images.clinic],
  ["demo-guru-nanak-mission", "Guru Nanak Mission Hospital", "Banga", "Punjab", "Chandigarh-Phagwara Road, Banga, SBS Nagar - 144505", "General Medicine", "General Hospital Services", 82, "₹70k - ₹1.8L", 145000, 390, 31.1794, 75.9804, "Accredited Hospital", "Charitable Hospital", ["General Hospital Services", "General Medicine"], ["Emergency", "Medical Wards", "Diagnostics"], "100-bed charitable hospital demo profile.", 730, 2.0, images.care],
  ["demo-sarvodya-jalandhar", "Sarvodya Hospital", "Jalandhar", "Punjab", "Opp. Khalsa College, G.T. Road, Jalandhar - 144001", "General Medicine", "General Hospital Services", 81, "₹1.1L - ₹2.9L", 195000, 373, 31.3260, 75.5762, "Accredited Hospital", "Private Hospital", ["General Hospital Services", "General Medicine"], ["General Ward", "Emergency", "Diagnostics"], "102-bed demo profile with general secondary and tertiary services.", 720, 2.0, images.general],
  ["demo-shakuntala-devi-vig", "Shakuntala Devi Vig Hospital", "Jalandhar", "Punjab", "Main Kapurthala Road, Jalandhar - 144002", "General Surgery", "General Surgery", 83, "₹95k - ₹2.2L", 170000, 375, 31.3260, 75.5762, "Accredited Hospital", "Private Hospital", ["General Hospital Services", "General Surgery"], ["Emergency", "Operating Theatre", "Medical Wards"], "General hospital demo profile with routine surgical pathways.", 680, 1.95, images.general],
  ["demo-satyam-trauma", "Satyam Hospital and Trauma Centre", "Jalandhar", "Punjab", "392, Adarsh Nagar, Kapurthala Chowk, Jalandhar - 144008", "Trauma", "Trauma Care", 79, "₹85k - ₹1.9L", 140000, 374, 31.3260, 75.5762, "Accredited Trauma Care", "Private Trauma Centre", ["Trauma Care", "Emergency Care"], ["Trauma Unit", "Emergency OT", "ICU"], "Trauma and emergency-focused demo profile.", 640, 2.3, images.care],
  ["demo-ranjit-jalandhar", "Ranjit Hospital", "Jalandhar", "Punjab", "58, Kapurthala Road, Jalandhar - 144001", "General Surgery", "General Surgery", 80, "₹80k - ₹1.8L", 130000, 375, 31.3260, 75.5762, "Accredited Hospital", "Private Hospital", ["General Hospital Services", "General Surgery"], ["Surgery", "OPD", "General Wards"], "General secondary-care demo profile.", 600, 2.2, images.clinic],
  ["demo-gtb-ludhiana", "Guru Teg Bahadur Sahib Charitable Hospital", "Ludhiana", "Punjab", "GTB Hospital Road, Model Town, Ludhiana - 141002", "Orthopedics", "Orthopaedics", 84, "₹1.1L - ₹2.5L", 180000, 315, 30.9000, 75.8573, "Charitable Hospital", "Charitable Multi-Speciality", ["Obstetrics and Gynaecology", "Orthopaedics", "Paediatrics", "Plastic Surgery"], ["Orthopedic Ward", "NICU", "OB-GYN Services"], "Charitable hospital demo profile with orthopaedic, paediatric and maternity services.", 820, 2.05, images.care],
  ["demo-malhotra-mandi", "Malhotra Hospital and Trauma Centre", "Mandi", "Himachal Pradesh", "Ner-Chowk, Mandi - 175008", "Orthopedics", "Orthopaedics", 78, "₹1.0L - ₹2.4L", 170000, 470, 31.7099, 76.9383, "Directory Demo Record", "Private Trauma Centre", ["Orthopaedics", "Joint Replacement", "Urology", "Trauma Care"], ["Orthopedic Ward", "Trauma OT", "Urology Ward"], "Orthopaedic and trauma demo profile; current accreditation requires verification.", 530, 2.45, images.care],
  ["demo-sandhya-hot-spring", "Sandhya Hot Spring Healthcare", "Shimla", "Himachal Pradesh", "Tattapani, near Naldehra Golf Course, Shimla - 171301", "Wellness", "Wellness", 65, "₹45k - ₹1.1L", 90000, 410, 31.1048, 77.1734, "AYUSH and Wellness", "AYUSH / Wellness Facility", ["AYUSH", "Wellness"], ["Wellness Therapy", "Thermal Baths", "Recovery Rooms"], "AYUSH and wellness demo profile, not a general tertiary hospital.", 380, 2.8, images.women],
  ["demo-nitin-patiala", "Nitin Hospital", "Patiala", "Punjab", "SCO-45,46,47, New Leela Bhawan Market, Patiala - 147001", "General Medicine", "General Medicine", 81, "₹90k - ₹2.0L", 150000, 230, 30.3400, 76.3840, "Accredited Hospital", "Private Hospital", ["General Hospital Services", "General Medicine"], ["Outpatient", "Emergency", "General Wards"], "General hospital demo profile with secondary-care and emergency support.", 650, 2.15, images.general],
  ["demo-ruby-pune", "Ruby Hall Clinic Pune", "Pune", "Maharashtra", "Sassoon Road, Pune - 411001", "Cardiology", "Multi-Speciality Care", 90, "₹1.8L - ₹4.6L", 305000, 1250, 18.5204, 73.8567, "NABH Accredited", "Private Multi-Speciality", ["Cardiology", "Oncology", "Neurology", "Orthopedics"], ["Cardiac ICU", "Cancer Centre", "Emergency", "Diagnostics"], "Pune demo profile with cardiac, oncology, neurology and orthopaedic services.", 1740, 1.48, images.general]
];

const diseaseDefinitions = [
  { id: "dis_cabg", name: "Coronary Artery Bypass (CABG)", keywords: ["cardio", "cardiac", "heart", "ctvs"] },
  { id: "dis_knee", name: "Severe Knee Osteoarthritis", keywords: ["orthopedic", "orthopaedic", "joint", "trauma"] },
  { id: "dis_leukemia", name: "Hematologic Malignancies (Leukemia/Lymphoma)", keywords: ["oncology", "hematology", "cancer"] },
  { id: "dis_ckd", name: "Chronic Kidney Disease (Stage 5 / ESRD)", keywords: ["nephro", "renal", "dialysis", "transplant"] },
  { id: "dis_neurology", name: "Neurological Disorders", keywords: ["neuro", "stroke"] },
  { id: "dis_gastroenterology", name: "Gastrointestinal and Liver Disorders", keywords: ["gastro", "liver", "hepat", "multi-speciality", "multi-specialty"] },
  { id: "dis_endocrinology", name: "Endocrine and Metabolic Disorders", keywords: ["multi-speciality", "multi-specialty", "general medicine", "general care"] },
  { id: "dis_pulmonology", name: "Respiratory Diseases", keywords: ["pulmonary", "respiratory", "critical", "multi-speciality", "multi-specialty"] },
  { id: "dis_pediatrics", name: "Pediatric and Developmental Conditions", keywords: ["pediatric", "paediatric", "neonat", "maternity", "children"] },
  { id: "dis_psychiatry", name: "Mental Health and Substance Use Disorders", keywords: ["mental", "psychiat", "general medicine", "multi-speciality", "multi-specialty"] },
  { id: "dis_general_multispecialty", name: "General and Multi-Specialty Care", keywords: ["general", "multi-speciality", "multi-specialty", "emergency", "trauma"] }
];

const SCHEMES_MAP = {
  "demo-aiims-delhi": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-sir-ganga-ram": ["CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-sir-ganga-ram-city": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-sir-ganga-ram-kolmet": ["CGHS Empanelled"],
  "demo-apollo-delhi": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-max-saket": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "ECHS Empanelled"],
  "demo-fortis-delhi": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-fortis-gurugram": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-medanta-gurugram": ["CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-pgimer": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-dharam-chandigarh": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-capitol-jalandhar": ["PM-JAY (Ayushman Bharat)", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-dmc-ludhiana": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "State Govt Health Scheme"],
  "demo-apollo-chennai": ["CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-miot-chennai": ["CGHS Empanelled", "State Govt Health Scheme"],
  "demo-narayana-bengaluru": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-manipal-bengaluru": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-tata-mumbai": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "State Govt Health Scheme"],
  "demo-kokilaben-mumbai": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-narayana-kolkata": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-jaslok-mumbai": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-care-hyderabad": ["CGHS Empanelled", "State Govt Health Scheme"],
  "demo-kims-hyderabad": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "State Govt Health Scheme"],
  "demo-amrita-kochi": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-medanta-lucknow": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled"],
  "demo-sgs-jaipur": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "ECHS Empanelled", "State Govt Health Scheme"],
  "demo-sterling-ahmedabad": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-medanta-patna": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-igmc-shimla": ["PM-JAY (Ayushman Bharat)", "CGHS Empanelled", "State Govt Health Scheme"],
  "demo-blk-memorial": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-moolchand-medicity": ["CGHS Empanelled"],
  "demo-fortis-rajan-dhall": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-apex-citi": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-fortis-vasant-kunj": ["CGHS Empanelled"],
  "demo-max-gurugram": ["CGHS Empanelled", "ECHS Empanelled"],
  "demo-motherhood-chaitanya": ["State Govt Health Scheme"],
  "demo-guru-nanak-mission": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-sarvodya-jalandhar": ["PM-JAY (Ayushman Bharat)"],
  "demo-satyam-trauma": ["PM-JAY (Ayushman Bharat)"],
  "demo-gtb-ludhiana": ["PM-JAY (Ayushman Bharat)", "State Govt Health Scheme"],
  "demo-nitin-patiala": ["State Govt Health Scheme"]
};

export const demoHospitals = records.map((record, index) => {
  const [id, canonicalName, city, state, address, conditionFocus, specialityFocus, successRate, costRange, avgCost, distanceKm, lat, lng, accreditation, ownership, specialities, facilities, notes, annualVolume, mortalityRate30Day, image] = record;
  const governmentSchemes = SCHEMES_MAP[id] || [];
  const isPublicOrCharitable = ownership.toLowerCase().includes("public") ||
    ownership.toLowerCase().includes("charitable") ||
    ownership.toLowerCase().includes("government") ||
    ownership.toLowerCase().includes("autonomous");

  const hasPmjay = governmentSchemes.some(s => s.toLowerCase().includes("pm-jay") || s.toLowerCase().includes("ayushman"));
  const hasGovtScheme = governmentSchemes.length > 0;
  const subsidyAvailable = isPublicOrCharitable || hasGovtScheme;

  let subsidyType = "No Subsidy (Full Private Tariff)";
  let costWithSubsidy = "Not Available (Standard Private Tariff)";
  let subsidyCoveragePercent = 0;
  let subsidyDetails = "Private commercial institution. 100% out-of-pocket or private cashless TPA insurance.";

  if (isPublicOrCharitable && hasPmjay) {
    subsidyType = "Full Government Subsidy (PM-JAY & Public Rates)";
    costWithSubsidy = "₹0 (100% Cashless under PM-JAY) or ₹25k - ₹65k (Subsidized Public Rate)";
    subsidyCoveragePercent = 100;
    subsidyDetails = "Apex public/charitable institution: 100% free under PM-JAY or heavily subsidized under Central/State government grants.";
  } else if (isPublicOrCharitable) {
    subsidyType = "Government / Charitable Concession (70-90% Subsidized)";
    costWithSubsidy = "₹35,000 – ₹85,000 (Subsidized Public Rate)";
    subsidyCoveragePercent = 80;
    subsidyDetails = "Subsidized bed & OT charges under government / charitable trust allocation.";
  } else if (hasPmjay) {
    subsidyType = "PM-JAY Empanelled (100% Cashless for Cardholders)";
    costWithSubsidy = "₹0 (100% Cashless for Ayushman Cardholders)";
    subsidyCoveragePercent = 100;
    subsidyDetails = "Private facility empanelled for PM-JAY package rates. ₹0 out-of-pocket for eligible cardholders; standard private rates for non-beneficiaries.";
  } else if (hasGovtScheme) {
    subsidyType = "CGHS / ECHS / State Subsidized Package";
    costWithSubsidy = "₹1,20,000 – ₹1,80,000 (Fixed Scheme Tariff)";
    subsidyCoveragePercent = 50;
    subsidyDetails = "Fixed government schedule tariff for CGHS/ECHS/State scheme beneficiaries with cashless reimbursement.";
  }

  const costWithoutSubsidy = costRange || `₹${(avgCost * 0.8 / 100000).toFixed(1)}L – ₹${(avgCost * 1.3 / 100000).toFixed(1)}L`;

  return {
    id,
    canonicalName,
    city,
    state,
    address,
    locationName: `${city}, ${state}`,
    distanceKm,
    lat,
    lng,
    ownership,
    abdmRegistryId: `DEMO-HFR-${String(index + 1).padStart(3, "0")}`,
    accreditationTier: accreditation,
    accreditations: [accreditation, "ABDM HFR demo record"],
    image,
    registryStatus: "DEMO_VERIFIED",
    directorySource: "MedScout demo registry based on md/hospitals.md; replace with current official verification before production use.",
    confidence: "Demo record with populated sample metrics",
    confidenceScore: successRate,
    lastAudited: "Demo dataset refreshed September 2026",
    conditionFocus,
    specialityFocus,
    successRate,
    costRange,
    avgCost,
    notes,
    specialities,
    facilities,
    governmentSchemes,
    subsidyAvailable,
    subsidyType,
    costWithSubsidy,
    costWithoutSubsidy,
    subsidyCoveragePercent,
    subsidyDetails,
    supportedDiseaseIds: diseaseDefinitions.map(disease => disease.id),
    supportedDiseases: diseaseDefinitions.map(disease => disease.name),
    outcome: {
      annualVolume,
      mortalityRate30Day,
      mortalityBenchmarkDelta: `${Math.max(0.1, 2.0 - mortalityRate30Day).toFixed(2)}% below demo benchmark`,
      complicationRate: Number((mortalityRate30Day + 1.5).toFixed(2)),
      readmissionRate30Day: Number((mortalityRate30Day + 2.8).toFixed(2)),
      outcomeDefinition: "Demo annual hospital outcome summary for discovery and comparison UI",
      reportingPeriod: "April 2025 - March 2026",
      sourceId: `demo-source-${index + 1}`,
      verificationStatus: "Demo populated record",
      confidence: "Demo populated metric"
    },
    cost: {
      minAmount: Math.round(avgCost * 0.75),
      maxAmount: Math.round(avgCost * 1.25),
      averageAmount: avgCost,
      roomType: "Standard package estimate",
      confidenceText: "Demo package range populated for comparison",
      bandwidthCoverage: 90,
      costType: "Demo package estimate",
      currency: "INR",
      sourceId: `demo-source-${index + 1}`,
      verificationStatus: "Demo populated record"
    },
    source: {
      id: `demo-source-${index + 1}`,
      title: "MedScout all-India demo hospital profile",
      publisher: "MedScout demo registry",
      sourceType: "Demo record",
      retrievedAt: "2026-09-23"
    }
  };
});

export default demoHospitals;
