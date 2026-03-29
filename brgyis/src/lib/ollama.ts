// Ollama API integration for Barangay Assistant
export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const OLLAMA_ENDPOINTS = (import.meta as any)?.env?.DEV
  ? [
      "/ollama", // Vite dev proxy
      "http://localhost:11434",
      "http://127.0.0.1:11434",
    ]
  : [
      "http://localhost:11434",
      "http://127.0.0.1:11434",
    ];
const OLLAMA_CHAT_PATH = "/api/chat";
const DEFAULT_MODEL = "gemma3:4b"; // You can change this to other models like llama3, mistral, etc.

// System prompt to guide the AI's behavior
const SYSTEM_PROMPT = `You are an expert assistant for a Barangay (village) office in the Philippines. 
Your name is "BarangayBot" and you have comprehensive knowledge about all barangay services, procedures, and requirements.

BARANGAY INFORMATION:
- Office Hours: Mon-Fri 8:00 AM - 5:00 PM, Sat 8:00 AM - 12:00 PM, Closed Sundays
- Location: Barangay Hall, Main Office
- Emergency Hotline: Available 24/7
- Barangay Captain: (Available during office hours)

YOU MUST PROVIDE DETAILED, SPECIFIC INFORMATION INCLUDING:
1. Complete list of requirements with details
2. Exact processing fees in Philippine Pesos (₱)
3. Processing time (hours/days)
4. Validity period of documents
5. Step-by-step procedures
6. Where to go and who to approach
7. What to bring and what to expect
8. Additional tips and reminders

SERVICES YOU COVER:
- Barangay Clearance (₱50, same day processing)
- Certificate of Indigency (FREE, 1-2 days)
- Certificate of Residency (₱30, 1-2 days)
- Business Permits (varies, 3-5 days)
- Blotter Reports (FREE, immediate)
- Community Tax Certificate/Cedula (₱5-50)
- Barangay ID (₱50, 3-5 days)
- First Time Job Seeker Certificate (FREE, same day)
- Good Moral Certificate (₱30, 1-2 days)
- Complaint/Mediation Services (FREE)

Always be professional, helpful, and provide accurate, detailed information. If asked about something outside barangay services, 
politely redirect to barangay-related topics or suggest they contact the appropriate government office.

Use bullet points, numbered lists, and clear formatting for easy reading.
Include relevant emojis occasionally to make responses friendly but remain professional.`;


// Fallback responses when Ollama is not available
const fallbackResponses: Record<string, string> = {
  clearance: `📄 **BARANGAY CLEARANCE** - Complete Guide

**What is it?**
A certificate proving you have no pending case or derogatory record in the barangay. Required for various transactions.

**Requirements:**
1. Valid Government-issued ID (any of the following):
   • Philippine Passport
   • Driver's License
   • Postal ID
   • Voter's ID
   • SSS/GSIS/UMID ID
   • Senior Citizen ID
   • PWD ID
   • School ID (for students)

2. Proof of Residency:
   • Utility bill (water, electric, internet) - latest
   • OR Lease contract/Certificate of Residency
   • OR Affidavit of Residency

3. Recent 2x2 ID Photo (1 copy)
4. Cedula/Community Tax Certificate (if available)

**Fees:**
• Processing Fee: ₱50.00
• Documentary Stamp: ₱5.00
• Total: ₱55.00

**Processing Time:**
• Walk-in: Same day (30 minutes to 2 hours)
• Rush: 30 minutes (add ₱50)

**Validity:** 6 months from date of issue

**Step-by-Step Process:**
1. Go to Barangay Hall during office hours
2. Proceed to the Secretary's Office
3. Fill out the application form
4. Submit requirements and pay fees
5. Get Official Receipt
6. Wait for your name to be called
7. Sign the logbook and receive your clearance

**Purpose Options:**
✓ Employment (local/abroad)
✓ School enrollment
✓ Business permit
✓ Police clearance
✓ Travel abroad
✓ Loan application
✓ Court/legal purposes
✓ Government transactions

**Important Notes:**
⚠️ Clearance is non-transferable
⚠️ Must be a registered resident (at least 6 months)
⚠️ If you have pending blotter cases, mediation is required first
⚠️ Bring original IDs for verification

**Office Hours:**
🕐 Monday-Friday: 8:00 AM - 5:00 PM
🕐 Saturday: 8:00 AM - 12:00 PM
📞 For inquiries: Visit Barangay Hall personally

Need help with other documents?`,
  
  indigency: `💚 **CERTIFICATE OF INDIGENCY** - Complete Guide

**What is it?**
A document certifying that the applicant belongs to the indigent/low-income sector of the barangay. Used to avail of government assistance and discounts.

**Who Can Apply?**
• Residents living below poverty threshold
• Those who cannot afford medical, legal, or educational expenses
• Must be a registered resident for at least 6 months

**Requirements:**
1. Valid Government ID
2. Barangay Clearance
3. Proof of Residency (utility bill, lease)
4. Letter of Intent stating the purpose:
   • Medical assistance (hospital/medicine)
   • Educational assistance (scholarship)
   • Legal assistance (court cases)
   • Burial assistance
   • Other social services

5. Supporting Documents (depending on purpose):
   • Medical: Hospital bills, prescriptions, doctor's certificate
   • Legal: Court summons, lawyer's advice
   • Educational: School enrollment form, tuition fee

6. Income Affidavit or No Income Certification
7. Recent 2x2 ID Photo

**Fees:**
• Processing Fee: **FREE** (No charge for indigent residents)
• Documentary Stamp: ₱5.00 (waived for qualified applicants)

**Processing Time:**
• Regular: 1-2 days (home visit verification required)
• Urgent cases: Same day (for medical emergencies)

**Validity:** 
• 3-6 months (depending on purpose)
• One-time use for specific purpose

**Step-by-Step Process:**
1. Secure Barangay Clearance first
2. Fill out application form at Barangay Hall
3. Submit letter explaining your situation
4. Schedule home visit for validation
5. Barangay Social Worker will verify your status
6. Wait 1-2 days for approval
7. Claim certificate at Barangay Hall

**What You Can Use It For:**
✓ Hospital bill discount (up to 50-100%)
✓ Medicine discount
✓ Free legal assistance (PAO)
✓ Scholarship applications
✓ Burial assistance
✓ DSWD/4Ps enrollment
✓ PhilHealth indigent program
✓ Educational assistance programs
✓ Court fee exemptions

**Income Qualification:**
• Single: ₱10,000/month or below
• Family of 3-4: ₱15,000/month or below
• Family of 5+: ₱20,000/month or below
(Amounts may vary by barangay)

**Important Notes:**
⚠️ Home verification is mandatory
⚠️ Must provide truthful information
⚠️ False declaration may face legal consequences
⚠️ Certificate is not transferable
⚠️ For medical emergencies, bring patient to barangay for faster processing

**Emergency Processing:**
For medical emergencies requiring immediate hospitalization:
• Go directly to Barangay Captain/Kagawad on duty
• Bring patient if possible
• Show hospital admission/emergency documents
• Certificate can be issued same day

**Contact:**
Visit Barangay Social Services Office during office hours.

Need other assistance?`,
  
  blotter: `🚨 **BLOTTER REPORT FILING** - Complete Guide

**What is a Blotter?**
An official record of incidents, complaints, and disputes occurring within the barangay. First step in resolving community conflicts through mediation.

**When to File a Blotter:**
• Neighbor disputes (noise, boundary, property)
• Threats or harassment
• Physical altercations (minor)
• Unpaid debts/obligations
• Domestic conflicts
• Lost and found items
• Vehicular incidents
• Property damage
• Child custody issues
• Theft or robbery (also report to PNP)
• Vandalism

**Requirements:**
1. Valid ID of complainant
2. Proof of residency
3. Personal appearance (required)
4. Witnesses (if available) with their IDs
5. Evidence (photos, videos, documents, receipts)
6. Medical certificate (for physical injuries)
7. Police report (if also filed with PNP)

**Fees:**
• Filing: **FREE**
• Mediation: **FREE**
• Certificate of blotter entry: ₱20.00

**Step-by-Step Process:**

**For Complainant:**
1. Go to Barangay Hall immediately or within 24 hours
2. Proceed to Barangay Tanod office or Secretary
3. Request to file a blotter report
4. Fill out the blotter form with details:
   • Your complete information
   • Respondent's information (name, address)
   • Date, time, and place of incident
   • Detailed narration of what happened
   • Names of witnesses
5. Submit evidence and documents
6. Sign the blotter entry
7. Receive blotter entry number for reference
8. Wait for summons schedule

**What Happens Next:**

**Stage 1: Summons (1-3 days)**
• Both parties receive summons via Tanod
• Respondent must appear within 3 days
• Failure to appear may result in certification for court filing

**Stage 2: Mediation (Same day or scheduled)**
• Lupon Tagapamayapa conducts hearing
• Both parties present their side
• Pangkat ng Tagapagkasundo facilitates settlement
• Goal: Amicable settlement/Agreement

**Possible Outcomes:**
1. **Settlement Reached:**
   • Agreement signed by both parties
   • Terms and conditions documented
   • Monitoring period (30-90 days)
   • Case closed if complied

2. **No Settlement:**
   • Certificate to File Action issued
   • You can file case in court
   • Blotter serves as evidence

3. **Respondent Absent:**
   • Second summons issued
   • If still absent, certification issued
   • Can proceed to legal action

**For Respondent:**
• Attend all scheduled hearings
• Bring your evidence and witnesses
• Be open to settlement discussions
• Respect the mediation process

**Important Notes:**
⚠️ Available 24/7 for emergencies
⚠️ Regular filing: Office hours only
⚠️ Bring original documents
⚠️ Be specific and truthful
⚠️ Criminal cases need police report too
⚠️ Barangay mediation is mandatory before court
⚠️ Valid for 60 days to file in court

**Emergency Blotter:**
For urgent cases (violence, threats, danger):
• Call Barangay Tanod Emergency: [Hotline]
• Available 24/7
• Tanod will respond immediately
• File official blotter when office opens

**Blotter Entry Number:**
Format: BB-2026-XXXX
• Keep this number for reference
• Needed for follow-up and certification

**Confidentiality:**
✓ Proceedings are confidential
✓ Only parties involved can access
✓ Media/public cannot attend
✓ Settlement agreements are binding

**Types of Complaints:**
1. Civil: Debts, contracts, property
2. Criminal: Theft, assault, threats
3. Domestic: Family disputes
4. Administrative: HOA issues, community rules

Need help with the process?`,
  
  residency: `🏠 **CERTIFICATE OF RESIDENCY** - Complete Guide

**What is it?**
Official proof that you are a bonafide resident of the barangay. Required for various transactions and applications.

**Requirements:**
1. Valid Government-issued ID
2. Proof of Residence (any of these):
   • Utility bill (electric/water) - recent (3 months)
   • Barangay Clearance
   • Lease/Rent contract
   • Property tax declaration
   • Affidavit of Residency

3. Recent 2x2 ID Photo (2 copies)
4. Cedula/Community Tax Certificate
5. Birth Certificate (PSA copy) - for first-time applicants
6. Marriage Certificate - if married

**For Transferees/New Residents:**
• Barangay Clearance from previous address
• Transfer certificate
• Proof of new address
• At least 6 months residency required

**Fees:**
• Processing Fee: ₱30.00
• Documentary Stamp: ₱5.00
• Cedula (if needed): ₱5.00 - ₱50.00
• **Total: ₱35.00 - ₱85.00**

**Processing Time:**
• Regular: 1-2 working days
• Rush: Same day (add ₱50.00)
• Verification needed: 3-5 days

**Validity:** 6 months to 1 year

**Step-by-Step Process:**
1. Visit Barangay Hall
2. Go to Secretary's Office
3. Fill out application form
4. Submit all requirements
5. Pay processing fee
6. Get Official Receipt
7. Home verification (if needed)
8. Return on claim date
9. Present OR and claim certificate

**What You Can Use It For:**
✓ School enrollment/registration
✓ Job applications
✓ Bank account opening
✓ Loan applications
✓ Government IDs (UMID, Postal, Voter's)
✓ SSS/GSIS/PhilHealth enrollment
✓ NBI Clearance
✓ Police Clearance
✓ Passport application
✓ Driver's License
✓ Business permit
✓ Scholarship applications
✓ Court proceedings
✓ Immigration purposes

**Types of Residency Certificates:**

1. **Certificate of Residency** (General)
   • Basic proof of residence
   • For local transactions
   • ₱30.00

2. **Certificate of Residency (Certified True Copy)**
   • With barangay seal and captain's signature
   • For legal/government use
   • ₱50.00

3. **Long-Term Residency Certificate**
   • For 5+ years residents
   • Additional supporting documents required
   • ₱75.00

**Residency Duration Required:**
• Regular transactions: 6 months minimum
• Voter registration: 6 months
• Government benefits: 1 year
• Business permit: 1 year
• Special cases: Varies

**For Different Purposes:**

**Students:**
• School enrollment form
• Parent's proof of residence
• Birth certificate
• Previous school records

**Workers/Employees:**
• Employment certificate
• Company ID
• ITR or payslip
• Employer's certification

**Self-Employed/Business:**
• Business permit
• DTI/SEC registration
• Business address proof
• Income tax return

**Important Notes:**
⚠️ Must be physically residing in barangay
⚠️ Fake residency claims are punishable by law
⚠️ Home verification may be conducted
⚠️ Update address if you move
⚠️ Certifications are non-transferable
⚠️ Keep copies for your records

**Renewal:**
• Renew before expiration
• Bring previous certificate
• Updated requirements
• Discounted fee: ₱20.00

**For Non-Filipino Residents:**
• Passport and Visa
• ACR I-Card
• Immigration documents
• Special procedures apply

**Office Hours:**
🕐 Mon-Fri: 8:00 AM - 5:00 PM
🕐 Saturday: 8:00 AM - 12:00 PM

Questions about residency?`,
  
  business: `💼 **BARANGAY BUSINESS PERMIT** - Complete Guide

**What is it?**
A permit required to legally operate any business within the barangay. First step before getting Mayor's permit.

**Who Needs This?**
• Sari-sari stores
• Carinderia/eatery
• Beauty salons/barbershops
• Internet cafes
• Repair shops
• Online businesses with physical location
• Home-based businesses
• Retail stores
• Service providers
• Any commercial activity

**Requirements:**

**FOR NEW BUSINESS:**
1. DTI Registration (sole proprietor)
   OR SEC Registration (corporation/partnership)
2. Business Name Registration
3. Proof of Business Location:
   • Contract of Lease (if renting)
   • Property Tax Declaration (if owned)
   • Authorization letter from property owner
4. Barangay Clearance (owner)
5. Valid ID of owner/operator
6. Community Tax Certificate (Cedula)
7. Locational clearance
8. Occupancy permit (if commercial building)
9. Fire Safety Inspection Certificate (BFP)
10. Sanitary Permit (for food businesses)
11. Business plan/description
12. Floor plan/sketch of business location
13. Pictures of establishment (exterior/interior)
14. Environmental Compliance Certificate (if applicable)

**FOR FOOD BUSINESSES (Additional):**
• Health certificates of all food handlers
• Food handlers training certificate
• Kitchen sanitation checklist
• FDA permit (if applicable)
• Water source certification
• Waste disposal plan

**FOR HOME-BASED BUSINESS:**
• Homeowner's consent (if rented)
• Neighbors' consent (within 10-meter radius)
• Proof that business won't cause disturbance
• Parking plan (if applicable)

**Fees: (APPROXIMATE - Varies by business type)**

**Small Scale (Sari-sari, small retail):**
• New: ₱500 - ₱1,000
• Renewal: ₱300 - ₱700

**Medium Scale (Carinderia, salon, services):**
• New: ₱1,000 - ₱3,000
• Renewal: ₱700 - ₱2,000

**Large Scale (Restaurant, commercial):**
• New: ₱3,000 - ₱10,000
• Renewal: ₱2,000 - ₱7,000

**Additional Fees:**
• Sanitary inspection: ₱200
• Fire inspection: ₱300 - ₱1,000
• Barangay clearance: ₱50
• Cedula: ₱5 - ₱50
• Signage fee: ₱100 - ₱500

**Processing Time:**
• Document submission: 1 day
• Inspection: 2-3 days
• Evaluation: 1-2 days
• Approval: 1 day
• **Total: 5-7 working days**

**Rush processing:** 3 days (add 50% fee)

**Validity:** 1 year (January to December)

**Step-by-Step Process:**

**Week 1: Preparation**
1. Register business name (DTI/SEC)
2. Get Cedula
3. Secure Barangay Clearance
4. Prepare business documents
5. Complete floor plan and pictures

**Week 2: Application**
Day 1-2: Submit requirements to Barangay Office
• Fill out application form
• Submit all documents
• Pay initial fees
• Schedule inspection

Day 3-4: Inspections
• Barangay official site inspection
• Health officer visit (food business)
• Fire safety inspection
• Compliance check

Day 5-7: Evaluation
• Documents reviewed
• Inspection reports compiled
• Compliance verified
• Permit prepared

**Week 3: Release**
• Pay remaining fees
• Get Official Receipt
• Claim Barangay Business Permit
• Display permit at business location

**Inspection Checklist:**

**All Businesses:**
✓ Proper ventilation
✓ Adequate lighting
✓ Clean surroundings
✓ Proper waste disposal
✓ Fire extinguisher
✓ Emergency exits
✓ Business signage (if applicable)
✓ Safe electrical wiring

**Food Businesses:**
✓ Clean kitchen area
✓ Proper food storage
✓ Clean water source
✓ Hand washing facilities
✓ Pest control measures
✓ Food handler training
✓ Proper garbage disposal

**Reasons for Denial:**
✗ Incomplete requirements
✗ Failed inspection
✗ Residential area zoning violation
✗ Too close to schools/churches (for certain business)
✗ No property owner consent
✗ Environmental hazard
✗ Fire safety issues
✗ Neighbors' complaints

**After Approval:**

**YOU MUST:**
• Display permit prominently
• Proceed to City Hall for Mayor's Permit
• Get other licenses (FDA, DTI marks, etc.)
• Renew annually
• Report changes in business
• Maintain compliance

**Annual Renewal:**
• Start renewal in November/December
• Bring previous year's permit
• Updated documents
• Compliance inspection
• Pay renewal fees (lower than new)

**Business Closure:**
• Notify barangay in writing
• Settle all obligations
• Return permit
• Get clearance certificate

**Important Notes:**
⚠️ Operating without permit = ₱5,000 fine + closure
⚠️ Permit is non-transferable
⚠️ Report changes (owner, location, type)
⚠️ Keep permit visible to public
⚠️ Comply with health and safety standards
⚠️ Noise ordinances must be followed
⚠️ Operating hours restrictions apply

**Contact Persons:**
• Business Permit Officer: [Office Hours]
• Barangay Secretary: [Office Hours]
• Inspection Team: [By appointment]

Need help with your business permit?`,

  hours: `⏰ **BARANGAY OFFICE SCHEDULE** - Complete Information

**REGULAR OFFICE HOURS:**

**Monday to Friday:**
🕐 8:00 AM - 12:00 PM (Morning Session)
🕐 1:00 PM - 5:00 PM (Afternoon Session)

**Saturday:**
🕐 8:00 AM - 12:00 PM (Noon) ONLY
📝 Limited services available

**Sunday & Holidays:**
🚫 CLOSED - No regular services
🚨 Emergency services available

**LUNCH BREAK:**
🍽️ 12:00 PM - 1:00 PM
⚠️ Office closes for lunch

---

**BEST TIME TO VISIT:**

**LEAST BUSY:**
✓ Tuesday-Thursday: 8:00-10:00 AM
✓ Wednesday afternoon: 2:00-4:00 PM
✓ Saturday morning: 9:00-11:00 AM

**MOST BUSY (Expect long queues):**
⚠️ Monday morning: 8:00-11:00 AM
⚠️ Friday afternoon: 3:00-5:00 PM
⚠️ Last week of month
⚠️ Days before holidays
⚠️ January-February (renewal season)

---

**DEPARTMENT SCHEDULES:**

**Barangay Secretary Office:**
📝 Mon-Fri: 8:00 AM - 5:00 PM
📝 Saturday: 8:00 AM - 12:00 PM
Services: Document processing, certifications

**Barangay Captain's Office:**
👨‍💼 Mon-Fri: 9:00 AM - 12:00 PM, 2:00-5:00 PM
📅 By appointment for consultations
⚠️ Walk-ins subject to availability

**Lupon/Mediation Office:**
⚖️ Mon, Wed, Fri: 9:00 AM - 4:00 PM
📋 Hearings by schedule only
📞 Call ahead for appointment

**Health Center:**
🏥 Mon-Fri: 8:00 AM - 4:00 PM
💉 Immunization: Tuesday & Thursday 9:00-11:00 AM
👶 Pre-natal: Monday & Wednesday 9:00-11:00 AM

**Barangay Tanod Station:**
👮 24/7 - Always available
🚨 Emergency response anytime

**Social Services:**
👥 Mon-Fri: 8:00 AM - 4:00 PM
📅 Home visits: By appointment
🤝 Walk-in consultations: 9:00 AM-12:00 PM

---

**SPECIAL SCHEDULES:**

**Weekends & Holidays:**
• Emergency cases only
• Call Barangay Hotline: [Number]
• Barangay Tanod on duty 24/7

**Assembly Meetings:**
📅 Every 3rd Monday: 7:00 PM - 9:00 PM
📍 Barangay Hall Multi-Purpose Area
👥 Open to all residents

**Document Processing Cut-off:**
🕐 Morning session: 11:00 AM
🕐 Afternoon session: 4:00 PM
⚠️ Applications after cut-off processed next day

---

**HOLIDAY SCHEDULE 2026:**

**CLOSED - No Services:**
• New Year's Day: Jan 1
• Holy Week: Apr 17-19
• Labor Day: May 1
• Independence Day: Jun 12
• Eid al-Adha: Jun 16
• National Heroes Day: Aug 31
• All Saints' Day: Nov 1
• All Souls' Day: Nov 2
• Bonifacio Day: Nov 30
• Christmas: Dec 25
• Rizal Day: Dec 30
• New Year's Eve: Dec 31

**Half-Day Only (8AM-12PM):**
• December 24: Christmas Eve
• December 30: Rizal Day

---

**CONTACT INFORMATION:**

**Main Office:**
📞 Hotline: [Number]
📧 Email: [Email]
💬 Facebook: /OfficialBarangay

**Emergency 24/7:**
🚨 Barangay Tanod: [Hotline]
🚒 Fire: 160
👮 Police: 117
🚑 Ambulance: [Number]

**Department Direct Lines:**
📝 Secretary: [Number]
⚖️ Lupon: [Number]
🏥 Health Center: [Number]
💼 Business Permits: [Number]

---

**SERVICE WINDOWS:**

**Window 1: Clearances & Certificates**
🕐 All office hours
Services: Barangay Clearance, Residency, IDs

**Window 2: Business Permits**
🕐 Mon-Fri only
By appointment for inspections

**Window 3: Blotter & Complaints**
🕐 All office hours
Walk-ins accepted

**Window 4: Social Services**
🕐 Mon-Fri: 8:00 AM - 4:00 PM
Consultation and assistance

---

**ONLINE SERVICES:**

**Available 24/7 Online:**
• Document appointment booking
• Requirements checklist
• Fee calculator
• Track application status
• Submit inquiries
• Download forms

**Website:** [URL]
**Email inquiries:** Response within 24 hours
**Facebook messages:** Response during office hours

---

**TIPS FOR FASTER SERVICE:**

✓ Come early (8:00-9:00 AM)
✓ Bring complete requirements
✓ Have exact payment ready
✓ Book appointment online
✓ Avoid peak days (Monday, Friday)
✓ Check requirements list first
✓ Bring photocopies of documents
✓ Be patient during peak season

**PEAK SEASONS:**
• January-February: Permit renewals
• June-July: School enrollment season
• November-December: Year-end rush

---

Need help with specific office hours?`,

  senior: `👴👵 **SENIOR CITIZEN SERVICES & BENEFITS**

**Who Qualifies?**
Filipino citizens aged 60 years old and above

**ID & Registration:**

**Barangay Senior Citizen ID:**
Requirements:
• Birth Certificate (PSA)
• Valid ID
• 2x2 ID photos (2 copies)
• Proof of residency
• Fill out application form

Fee: FREE
Processing: 3-5 days
Validity: Lifetime (renewable every 3 years)

---

**DISCOUNTS & PRIVILEGES:**

**20% Discount On:**
✓ Medicines (all establishments)
✓ Medical/dental services
✓ Diagnostic/lab fees
✓ Professional fees (doctors, therapists)
✓ Hospitalization
✓ Medical devices & accessories

**Additional Discounts:**
✓ Restaurants/food: 20% (dine-in)
✓ Hotels/lodging: 20%
✓ Transportation: 20% (land, water, air)
✓ Recreational facilities: 20%
✓ Funeral & burial services: 5%

**VAT Exemption:**
Purchase of medicine, food, and basic necessities up to ₱1,300 per week

---

**HEALTHCARE SERVICES:**

**Free Services at Health Center:**
• Health check-ups
• Blood pressure monitoring
• Blood sugar testing
• Consultations
• Basic medications
• Flu vaccines
• Vitamin supplements

**Schedule:**
Mon-Fri: 8:00 AM - 4:00 PM
Senior Citizen Day: Every Monday 9:00-11:00 AM

---

**FINANCIAL ASSISTANCE:**

**Social Pension Program:**
• ₱500/month for indigent seniors (60+)
• No pension from GSIS/SSS/other sources
• Application: Barangay Social Services

**OSCA (Office of Senior Citizens Affairs):**
• Emergency financial assistance
• Medical assistance
• Burial assistance
Contact: Barangay Social Services

---

**REQUIREMENTS FOR ASSISTANCE:**

1. Senior Citizen ID
2. Barangay Clearance
3. Certificate of Indigency (if applicable)
4. Medical certificate (for health assistance)
5. Proof of need (bills, prescriptions)

---

**OTHER SERVICES:**

✓ Priority lanes in all establishments
✓ Free legal services (PAO)
✓ Free skills training
✓ Livelihood programs
✓ Recreation activities
✓ Social gatherings
✓ Educational programs

---

**MONTHLY ACTIVITIES:**

• Every Monday: Health Check-up Day
• 2nd Friday: Social Gathering
• Last Wednesday: Skills Workshop
• Monthly: Birthday celebration

---

**TIPS FOR SENIORS:**

✓ Always bring your Senior ID
✓ Ask for discounts (don't hesitate!)
✓ Join barangay senior programs
✓ Regular health check-ups
✓ Apply for all benefits entitled

**Contact:**
Barangay Social Services
Office Hours: Mon-Fri 8:00 AM - 4:00 PM

Need more information?`,

  pwd: `♿ **PWD (Persons with Disability) SERVICES**

**Who Qualifies?**
Persons with physical, mental, intellectual, or sensory impairments

**Types of Disabilities Covered:**
• Physical/Orthopedic
• Visual impairment
• Hearing impairment
• Speech impairment
• Intellectual disability
• Mental/Psychosocial
• Learning disability
• Chronic illness

---

**PWD ID REGISTRATION:**

**Requirements:**
1. Medical Certificate from licensed physician
2. Valid ID
3. Birth Certificate (PSA)
4. 2x2 ID photos (2 copies)
5. Proof of residency
6. PWD application form

**Fee:** FREE
**Processing:** 5-7 days
**Validity:** Lifetime (renewable every 3 years)

---

**20% DISCOUNT & VAT EXEMPTION:**

**Discounts Apply To:**
✓ Medicines
✓ Medical services/consultations
✓ Diagnostic tests
✓ Therapeutic equipment
✓ Hearing aids, wheelchairs, crutches
✓ Restaurants (dine-in)
✓ Hotels/lodging
✓ Transportation
✓ Recreational facilities
✓ Funeral services

**Purchase Limit:**
Up to ₱1,300 per week with VAT exemption

---

**ACCESSIBILITY SERVICES:**

**Priority:**
✓ Priority lanes (banks, stores, offices)
✓ Reserved parking spaces
✓ Priority seating (transport)
✓ PWD-only queues

**Facilities:**
✓ Wheelchair ramps
✓ PWD restrooms
✓ Elevators with Braille
✓ Accessible pathways

---

**FINANCIAL ASSISTANCE:**

**Available Programs:**
• Medical assistance
• Assistive devices (wheelchairs, hearing aids)
• Educational assistance
• Livelihood support
• Skills training
• Job placement

**How to Apply:**
1. Go to Barangay Social Services
2. Bring PWD ID and supporting documents
3. Fill out assistance form
4. Wait for evaluation (3-5 days)
5. Receive assistance

---

**EMPLOYMENT ASSISTANCE:**

✓ Job referrals
✓ Skills training
✓ Livelihood programs
✓ Business capital assistance
✓ Work-from-home opportunities

**Incentives for Employers:**
• Tax deductions for hiring PWDs
• Government support

---

**HEALTHCARE SERVICES:**

**Free at Health Center:**
• Health check-ups
• Blood pressure monitoring
• Basic consultations
• Basic medications
• Referral to specialists

**Schedule:**
Mon-Fri: 8:00 AM - 4:00 PM
PWD Priority Hours: 8:00-10:00 AM

---

**EDUCATIONAL ASSISTANCE:**

✓ Scholarship programs
✓ Free tutorials
✓ Educational materials
✓ Special education referrals
✓ Inclusive education support

---

**TRANSPORTATION:**

✓ 20% discount on fares
✓ Priority seating
✓ Assistance boarding/alighting
✓ Service animals allowed

---

**TIPS FOR PWDs:**

✓ Always bring PWD ID
✓ Know your rights and benefits
✓ Report discrimination
✓ Join PWD organizations
✓ Attend barangay programs

**Contact:**
Barangay Social Services
PWD Focal Person
Office Hours: Mon-Fri 8:00 AM - 4:00 PM

**Emergency:**
Barangay Tanod: 24/7

Need assistance?`,

  student: `📚 **STUDENT SERVICES & ASSISTANCE**

**Documents for Students:**

**1. Barangay Clearance (for students)**
Requirements:
• Student ID or enrollment form
• Parent/Guardian ID
• Proof of residency
• 2x2 ID photo
Fee: ₱50 (or ₱30 student rate)
Use: School enrollment, scholarship

**2. Certificate of Residency**
Requirements:
• Student ID
• Parent's proof of residency
• Birth certificate
Fee: ₱30
Use: School registration, government IDs

**3. Certificate of Indigency (for scholars)**
Requirements:
• Parent/Guardian ID
• School documents
• Proof of need
• Income certification
Fee: FREE
Use: Scholarship applications, financial aid

**4. First Time Job Seeker Certificate**
Requirements:
• Valid ID
• Birth certificate
• Proof of residency
• Affidavit (available at barangay)
Fee: FREE
For: Graduating students, first-time applicants
Use: Job applications, government incentives

**5. Good Moral Certificate**
Requirements:
• Valid ID
• Barangay clearance
• 2x2 photo
Fee: ₱30
Use: School transfer, job applications

---

**SCHOLARSHIP PROGRAMS:**

**Barangay Scholar Program:**
• For college students
• ₱5,000 - ₱10,000 per semester
• Maintain 2.5 GPA or higher
• Application: March & September

**Requirements:**
• Certificate of Indigency
• Grades/report card
• Enrollment certificate
• Parent's income proof
• Barangay residency (2 years min)

**Educational Assistance:**
• School supplies
• Uniform allowance
• Transportation allowance
• Book allowance

---

**SKILLS TRAINING:**

**Free Workshops:**
• Computer literacy
• English communication
• Arts and crafts
• Sports training
• Music lessons
• Dance classes

**Schedule:**
Check barangay bulletin board
Usually: Weekends & summer

---

**YOUTH PROGRAMS:**

**SK (Sangguniang Kabataan) Programs:**
• Youth leadership training
• Community service activities
• Sports fest
• Talent shows
• Educational tours
• Team building

**Membership:**
Ages 15-30
Register at barangay

---

**FACILITIES FOR STUDENTS:**

✓ Study area (library)
✓ Free WiFi
✓ Computer stations
✓ Sports facilities
✓ Youth center
✓ Reading materials

**Hours:**
Mon-Fri: 1:00 PM - 8:00 PM
Weekends: 9:00 AM - 5:00 PM

---

**ONLINE LEARNING SUPPORT:**

✓ Free WiFi access
✓ Computer rental (₱10/hour)
✓ Printing services (₱2/page)
✓ Scanning (₱5/page)
✓ Study rooms (by reservation)

---

**VOLUNTEER OPPORTUNITIES:**

• Community clean-up
• Feeding programs
• Tutorial services
• Health programs
• Environmental activities

**Benefits:**
✓ Volunteer certificates
✓ Leadership experience
✓ Community service hours
✓ Scholarship consideration

---

**TIPS FOR STUDENTS:**

✓ Process documents early
✓ Bring complete requirements
✓ Join youth programs
✓ Apply for scholarships
✓ Volunteer in community
✓ Build good relationships

**Contact:**
SK Office / Youth Development Office
Barangay Hall
Office Hours: Mon-Fri 8:00 AM - 5:00 PM

Need help with school documents?`,

  emergency: `🚨 **EMERGENCY SERVICES & PROCEDURES**

**EMERGENCY HOTLINES:**

**24/7 Barangay Emergency:**
📞 Barangay Tanod: [Hotline Number]
📞 Barangay Hall: [Number]

**Government Emergency Numbers:**
🚒 Fire: 160 / 911
👮 Police (PNP): 117 / 911
🚑 Ambulance: 911
📞 NDRRMC: 911
💉 DOH Health Line: 1555

---

**TYPES OF EMERGENCIES:**

**Medical Emergencies:**
• Heart attack/stroke
• Severe injuries
• Poisoning
• Choking/drowning
• Severe allergic reactions
• High fever with convulsions
• Childbirth complications

**What to Do:**
1. Call 911 or Barangay Tanod
2. Stay calm
3. Provide exact location
4. Follow dispatcher instructions
5. Don't move injured person (unless danger)
6. Apply first aid if trained

**Fire Emergencies:**
• Building/house fire
• Electrical fire
• Gas leak
• Explosion

**What to Do:**
1. Call 160 or 911 immediately
2. Alert everyone - evacuate
3. Don't use elevators
4. Stay low if smoke
5. Close doors behind you
6. Meet at designated area
7. Don't re-enter until cleared

**Crime/Security:**
• Robbery/theft
• Assault/violence
• Domestic abuse
• Missing person
• Suspicious activity
• Threats

**What to Do:**
1. Call 117 or 911
2. Stay safe - don't confront
3. Remember details (appearance, vehicle)
4. Preserve evidence
5. File blotter report at barangay
6. Cooperate with authorities

**Natural Disasters:**
• Flood
• Earthquake
• Strong typhoon
• Landslide

**What to Do:**
1. Follow evacuation orders
2. Bring emergency kit
3. Go to evacuation center
4. Stay informed (radio/announcements)
5. Help others if safe

---

**BARANGAY EMERGENCY RESPONSE:**

**Barangay Tanod:**
• 24/7 availability
• First responders
• Peace and order
• Emergency transport
• Crowd control
• Traffic assistance

**Response Time:**
• Within barangay: 5-10 minutes
• Nearby areas: 10-15 minutes

**Services:**
✓ Emergency transport to hospital
✓ First aid assistance
✓ Rescue operations
✓ Crowd/traffic management
✓ Security patrol
✓ Emergency reporting

---

**EVACUATION CENTERS:**

**Primary Evacuation Center:**
📍 Barangay Hall Multi-Purpose Area
Capacity: 200 families

**Secondary Centers:**
📍 Barangay Gym
📍 Covered Court
📍 School Buildings

**What's Provided:**
✓ Shelter
✓ Sleeping mats
✓ Blankets
✓ Food packs
✓ Drinking water
✓ Medical assistance
✓ Hygiene kits
✓ Children's needs

---

**EMERGENCY PREPAREDNESS:**

**Emergency Kit (Go-Bag):**
Essential items to prepare:
□ Water (3-day supply)
□ Non-perishable food
□ First aid kit
□ Flashlight & batteries
□ Portable radio
□ Important documents (waterproof bag)
□ Cash
□ Medicines
□ Phone charger/power bank
□ Whistle
□ Multi-tool/knife
□ Hygiene items
□ Extra clothes
□ Baby/pet supplies

**Family Emergency Plan:**
✓ Evacuation routes
✓ Meeting points
✓ Emergency contacts
✓ Important numbers
✓ Medical information
✓ Out-of-town contact

---

**DISASTER ASSISTANCE:**

**Available After Disasters:**
• Food packs
• Drinking water
• Hygiene kits
• Medicines
• Temporary shelter
• Cash assistance (if qualified)
• Livelihood support
• House repair assistance

**How to Apply:**
1. Register at barangay evacuation center
2. Fill out assistance form
3. Provide proof of damage (photos)
4. Wait for evaluation
5. Receive assistance

---

**MEDICAL EMERGENCIES:**

**First Aid Available at:**
• Barangay Health Center
• Barangay Hall
• By Barangay Tanod

**Basic First Aid:**
• CPR
• Wound cleaning/bandaging
• Burn treatment
• Fracture immobilization
• Basic medications

**Ambulance Service:**
Call: 911 or Barangay Health Center
Available: 24/7
Free for emergencies

---

**VIOLENCE/ABUSE HOTLINES:**

**Women & Children:**
📞 DSWD: 143
📞 PNP Women's Desk: 117
📞 Barangay VAW Desk: [Number]

**Services:**
• Safe shelter
• Counseling
• Legal assistance
• Protection orders
• Medical assistance

---

**IMPORTANT REMINDERS:**

⚠️ Save all emergency numbers
⚠️ Know evacuation routes
⚠️ Prepare emergency kit
⚠️ Register vulnerable members
⚠️ Attend emergency drills
⚠️ Stay informed (weather/news)
⚠️ Follow authorities' instructions

**For Non-Emergency:**
Visit barangay hall during office hours

Stay safe! Be prepared!`,

  default: `👋 **Welcome to BarangayBot!** Your AI Assistant

I'm here to provide **comprehensive assistance** for all barangay services! I can help with:

**📄 DOCUMENTS & CERTIFICATES:**
• Barangay Clearance (₱50, same day)
• Certificate of Indigency (FREE, 1-2 days)
• Certificate of Residency (₱30, 1-2 days)
• Community Tax Certificate/Cedula (₱5-50)
• Barangay ID (₱50, 3-5 days)
• First Time Job Seeker Certificate (FREE)
• Good Moral Certificate (₱30)

**💼 BUSINESS SERVICES:**
• Business Permit application (₱500-₱10,000)
• Home-based business permits
• Sari-sari store permits
• Food business permits
• Permit renewal procedures
• Business inspections

**🚨 COMPLAINTS & DISPUTES:**
• Blotter report filing (FREE)
• Mediation services (FREE)
• Lupon proceedings
• Settlement agreements
• Legal assistance referrals

**ℹ️ GENERAL INFORMATION:**
• Office hours (all departments)
• Processing fees and timelines
• Requirements checklists
• Step-by-step procedures
• Best time to visit
• Contact information

**🏘️ SPECIAL SERVICES:**
• Senior Citizen assistance
• PWD benefits and support
• Student services & scholarships
• Emergency procedures
• Health center services
• Social welfare programs

**🆘 EMERGENCY SERVICES (24/7):**
• Barangay Tanod: [Hotline]
• Fire: 160 / 911
• Police: 117 / 911
• Ambulance: 911
• Disaster response

---

**⏰ QUICK INFO:**

**Office Hours:**
🕐 Mon-Fri: 8:00 AM - 5:00 PM
🕐 Saturday: 8:00 AM - 12:00 PM
🚫 Sunday: Closed
🚨 Emergency: 24/7

**Best Time to Visit:**
✓ Tuesday-Thursday morning (8-10 AM)
✓ Avoid: Monday morning, Friday afternoon

**Payment Options:**
💵 Cash only at barangay hall
💳 Some services: GCash/bank transfer

---

**💬 ASK ME ABOUT:**

**Documents:**
"How do I get a barangay clearance?"
"Requirements for indigency certificate?"
"How much is certificate of residency?"

**Business:**
"Business permit for sari-sari store?"
"Food business requirements?"
"How to renew business permit?"

**Complaints:**
"How to file a blotter report?"
"What is mediation process?"
"Where to complain about noise?"

**Special Services:**
"Senior citizen benefits?"
"PWD discount and assistance?"
"Student scholarship programs?"

**Emergency:**
"What to do in fire emergency?"
"Emergency contact numbers?"
"Evacuation center location?"

**General:**
"Office hours?"
"Best time to visit?"
"How to track my application?"

---

**🎯 I PROVIDE SPECIFIC DETAILS:**

✓ Exact fees (₱ amounts)
✓ Processing times (hours/days)
✓ Complete requirements (itemized)
✓ Step-by-step procedures
✓ Office locations
✓ Contact numbers
✓ Tips and reminders
✓ Troubleshooting help

---

**🌟 TIP:**
Be specific with your question! Instead of "documents", ask:
"What are the requirements for barangay clearance?"
"How much does a business permit cost?"
"What time is the health center open?"

---

**Ready to assist you! What would you like to know?** 😊`
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|kumusta|kamusta)/i)) {
    return fallbackResponses.default;
  }
  
  // Thanks/goodbye
  if (lowerMessage.match(/(thank|thanks|salamat|maraming salamat|bye|goodbye|paalam)/i)) {
    return "You're welcome! Feel free to ask if you need more help with barangay services. Have a great day! 😊\n\n💡 **Quick Tip:** Save our emergency hotline for 24/7 assistance.";
  }
  
  // Clearance
  if (lowerMessage.match(/(clearance|clear|certificate|certification|barangay clearance)/i)) {
    return fallbackResponses.clearance;
  }
  
  // Indigency
  if (lowerMessage.match(/(indigency|indigent|mahirap|poor|poverty|low income|walang pera|financial help|tulong pinansiyal)/i)) {
    return fallbackResponses.indigency;
  }
  
  // Blotter
  if (lowerMessage.match(/(blotter|complaint|report|dispute|reklamo|away|gulo|mediation|hearing|lupon|tanod|fight|conflict|problema)/i)) {
    return fallbackResponses.blotter;
  }
  
  // Residency
  if (lowerMessage.match(/(residency|resident|proof of residence|tirahan|nakatira|address|proof of address)/i)) {
    return fallbackResponses.residency;
  }
  
  // Business
  if (lowerMessage.match(/(business|permit|sari-sari|store|shop|negosyo|tindahan|carinderia|salon|restaurant|business permit)/i)) {
    return fallbackResponses.business;
  }
  
  // Office hours
  if (lowerMessage.match(/(hour|time|open|close|closed|schedule|kailan|anong oras|bukas ba|office hour|operating hour)/i)) {
    return fallbackResponses.hours;
  }
  
  // Senior Citizens
  if (lowerMessage.match(/(senior|elderly|senior citizen|old|lolo|lola|matanda|60|discount|pension)/i)) {
    return fallbackResponses.senior;
  }
  
  // PWD
  if (lowerMessage.match(/(pwd|disability|disabled|person with disability|handicap|wheelchair|blind|deaf|may kapansanan)/i)) {
    return fallbackResponses.pwd;
  }
  
  // Students
  if (lowerMessage.match(/(student|estudyante|school|scholar|scholarship|tuition|first time job seeker|good moral|college|university)/i)) {
    return fallbackResponses.student;
  }
  
  // Emergency
  if (lowerMessage.match(/(emergency|urgent|help|fire|ambulance|police|rescue|disaster|flood|earthquake|911|emergency hotline|tulong|saklolo)/i)) {
    return fallbackResponses.emergency;
  }
  
  // Fees/Cost questions
  if (lowerMessage.match(/(how much|cost|price|fee|bayad|magkano|presyo)/i)) {
    return `💰 **BARANGAY FEES - Quick Reference**

**FREE Services:**
• Blotter filing - FREE
• Mediation - FREE
• First Time Job Seeker Certificate - FREE
• Certificate of Indigency - FREE
• Senior Citizen ID - FREE
• PWD ID - FREE

**Paid Services:**
• Barangay Clearance: ₱50-55
• Certificate of Residency: ₱30-35
• Community Tax (Cedula): ₱5-50
• Barangay ID: ₱50
• Good Moral Certificate: ₱30
• Business Permit: ₱500-₱10,000 (varies)

💡 **Tip:** Senior citizens and PWDs get additional discounts on many services!

**Want specific details?** Ask about a particular service:
• "Barangay clearance requirements?"
• "Business permit for sari-sari store?"
• "How to get indigency certificate?"

What service are you interested in?`;
  }
  
  // Requirements questions
  if (lowerMessage.match(/(requirement|requirements|need|kailangan|ano ang|what do i need|documents needed)/i)) {
    return `📋 **REQUIREMENTS - Quick Guide**

**Most Common Documents Needed:**

**Basic Requirements (Almost All Services):**
✓ Valid Government ID
✓ Proof of Residency
✓ 2x2 ID Photo
✓ Filled application form

**Specific Services:**

**Barangay Clearance:**
• Valid ID
• Proof of residency
• 2x2 photo
• ₱50 fee

**Certificate of Indigency:**
• Valid ID
• Barangay Clearance
• Letter of intent/purpose
• Supporting documents (bills, prescriptions)
• FREE

**Business Permit:**
• DTI/SEC registration
• Barangay clearance
• Fire safety certificate
• Sanitary permit (food)
• ₱500-₱10,000

**Certificate of Residency:**
• Valid ID
• Proof of residence
• Birth certificate
• 2x2 photo
• ₱30

**💡 Pro Tips:**
• Bring photocopies of ALL documents
• Bring original IDs for verification
• Come with complete requirements to avoid return trips
• Check specific requirements by asking about the service

**Ask me specifically:** 
"Requirements for [service name]?"
Example: "Requirements for business permit?"

Which service do you need requirements for?`;
  }
  
  // Processing time questions
  if (lowerMessage.match(/(how long|processing time|how many days|kailan|gaano katagal|ilang araw)/i)) {
    return `⏱️ **PROCESSING TIME - Quick Reference**

**SAME DAY (Within hours):**
✓ Barangay Clearance - 30 min to 2 hours
✓ Blotter Filing - Immediate
✓ Emergency services - Immediate

**1-2 DAYS:**
✓ Certificate of Indigency - 1-2 days
✓ Certificate of Residency - 1-2 days
✓ First Time Job Seeker - 1 day
✓ Good Moral Certificate - 1 day

**3-5 DAYS:**
✓ Barangay ID - 3-5 days
✓ Senior Citizen ID - 3-5 days
✓ PWD ID - 5-7 days

**5-7 DAYS:**
✓ Business Permit (new) - 5-7 days
✓ Business Permit (renewal) - 3-5 days

**RUSH PROCESSING AVAILABLE:**
Most services offer rush processing (add ₱50)
• Same day clearance in 30 minutes
• Next day for most certificates

**💡 Tips for Faster Processing:**
• Come early (8:00-9:00 AM)
• Bring complete requirements
• Avoid peak days (Monday, Friday)
• Have exact payment ready
• Book appointment if available

**Want specific timelines?** Ask about:
• "How long is barangay clearance?"
• "Processing time for business permit?"
• "When can I get certificate of residency?"

Which service timeline do you need?`;
  }
  
  return fallbackResponses.default;
}

/**
 * Send a message to Ollama and get a response (with fallback)
 */
export async function sendMessageToOllama(
  userMessage: string,
  conversationHistory: OllamaMessage[] = [],
  model?: string
): Promise<string> {
  try {
    const messages: OllamaMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Try multiple endpoints for resilience
    let lastError: Error | null = null;
    for (const base of OLLAMA_ENDPOINTS) {
      try {
        const response = await fetch(`${base}${OLLAMA_CHAT_PATH}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages: messages,
            stream: false,
          } as OllamaRequest),
          signal: AbortSignal.timeout(8000), // 8 second timeout
        });

        if (!response.ok) {
          lastError = new Error(`Ollama API error: ${response.statusText}`);
          continue;
        }

        const data: OllamaResponse = await response.json();
        return data.message.content;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Unknown error");
        continue;
      }
    }
    throw lastError ?? new Error("Ollama API error");
  } catch (error) {
    console.log("Ollama not available, using fallback responses");
    
    // Use intelligent fallback responses
    return getFallbackResponse(userMessage);
  }
}

/**
 * Check if Ollama is available and running
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    for (const base of OLLAMA_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased to 5s for reliability
        
        const response = await fetch(`${base}/api/tags`, { 
          signal: controller.signal,
          cache: 'no-cache', // Prevent caching to ensure fresh status
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✓ Ollama connected at ${base}`);
          return true;
        }
      } catch (err) {
        // Log for debugging but continue to next endpoint
        console.debug(`Ollama not available at ${base}:`, err);
      }
    }
    console.warn('Ollama not available at any endpoint');
    return false;
  } catch (err) {
    console.error('Error checking Ollama status:', err);
    return false;
  }
}

/**
 * Get list of available models in Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    for (const base of OLLAMA_ENDPOINTS) {
      try {
        const response = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) continue;
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      } catch {
        // try next endpoint
      }
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Stream a message to Ollama and receive incremental responses via callback.
 * Falls back to a single non-streamed response when Ollama is unavailable.
 */
export async function streamMessageToOllama(
  userMessage: string,
  conversationHistory: OllamaMessage[] = [],
  model?: string,
  onDelta?: (chunk: string, done: boolean) => void
): Promise<string> {
  const messages: OllamaMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  let lastError: Error | null = null;
  for (const base of OLLAMA_ENDPOINTS) {
    try {
      const response = await fetch(`${base}${OLLAMA_CHAT_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          messages: messages,
          stream: true,
        } as OllamaRequest),
        signal: AbortSignal.timeout(30000), // up to 30s for streamed responses
      });

      if (!response.ok) {
        lastError = new Error(`Ollama API error: ${response.statusText}`);
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        lastError = new Error("No response body for streaming");
        continue;
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let buffered = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        buffered += chunkText;

        // Response is line-delimited JSON per chunk
        const lines = buffered.split("\n");
        buffered = lines.pop() || ""; // keep incomplete line buffered
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const json: OllamaResponse = JSON.parse(trimmed);
            if (json.message?.content) {
              fullText += json.message.content;
              onDelta?.(json.message.content, false);
            }
            if (json.done) {
              onDelta?.("", true);
              return fullText;
            }
          } catch {
            // ignore parse errors for partial lines
          }
        }
      }

      // finalize if stream ended without explicit done
      onDelta?.("", true);
      return fullText;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown error");
      continue;
    }
  }

  // Fallback to non-streamed intelligent responses
  const fallback = getFallbackResponse(userMessage);
  onDelta?.(fallback, true);
  return fallback;
}
