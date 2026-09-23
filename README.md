# MedScout

MedScout is a healthcare discovery platform for finding, filtering, and comparing hospitals in India.

Users can search by condition, treatment, location, budget, speciality, distance, government scheme, cost, success rate, and treatment experience. The platform also includes a grounded AI assistant, hospital comparison, source information, authentication, admin verification, and a Smart Health Card concept.

> **Important:** The current app uses demo hospital records for development. The displayed outcomes, costs, distances, accreditations, and scheme information must be replaced or verified against current official records before production use. MedScout is not an emergency medical service. In an emergency, call `108` or `112`.

## What MedScout Does

- Finds hospitals by disease, treatment, speciality, city, state, or distance.
- Shows hospital profiles with facilities, estimated costs, outcome-style metrics, accreditation, schemes, and location data.
- Supports all disease categories in the current demo taxonomy.
- Supports demo hospital locations across India.
- Sorts results by success-rate index, cost, distance, or specialist match.
- Changes hospital ordering when a government scheme filter is selected.
- Shows hospital locations on an interactive map view.
- Compares up to four hospitals side by side.
- Highlights major differences in outcomes, experience, cost, ICU support, and government schemes.
- Provides source and provenance information for important claims.
- Offers a conversational AI assistant for hospital discovery and general health information.
- Allows users to save hospitals, comparisons, preferences, conversations, and report summaries after signing in.
- Provides admin workflows for submitting and reviewing evidence records.

## Safety Rules

MedScout is an information and discovery tool, not a doctor or emergency service.

- The AI assistant must not diagnose a user.
- Symptoms are described as possible causes, not confirmed conditions.
- Hospital, cost, outcome, doctor, and facility claims must come from retrieved records.
- Unknown information must remain clearly unknown. It must not be changed to zero or guessed.
- Cost figures are estimates, packages, tariffs, or historical ranges where applicable.
- Clinical outcomes must include their definition and reporting period.
- Emergency symptoms must be directed to urgent professional care first.
- Medical reports should be shared only with explicit, limited, revocable consent.

## Main User Flows

### 1. Search

1. Select a condition or describe the situation in the AI assistant.
2. Select a location or choose `All India`.
3. Optionally choose a speciality, budget, distance, or government scheme.
4. Sort hospitals by the factor that matters most.
5. Open a hospital profile for more details.

### 2. Compare

1. Add hospitals to the comparison tray.
2. Select `Compare Now`.
3. Review costs, volume, recovery-style metrics, complication risk, facilities, schemes, and evidence notes.
4. Use the highlighted major differences to understand trade-offs.

The platform should describe a hospital as the strongest match for the selected criteria, not as the universally “best” hospital.

### 3. AI Assistant

The assistant can help with:

- Hospital search
- Hospital comparison
- Cost questions
- Evidence and source questions
- Speciality discovery
- General health information
- Government scheme discovery
- Methodology questions
- Data-gap explanations

The local chatbot engine is the source of truth for hospital facts. An optional OpenAI integration can rewrite the local response for clarity, but it must not add unsupported claims.

### 4. My Health Card

The Smart Health Card is a personal discovery and consent layer. It is not an ABHA replacement and does not issue a government health ID.

- The card does not store medical PDFs or raw medical records.
- QR codes must contain temporary authorization tokens, not medical information.
- Users choose which report to share, with which hospital, and for how long.
- Access can be revoked immediately.
- ABHA integration is planned as a consent-based readiness flow; MedScout does not store Aadhaar numbers.

## Project Structure

```text
MedScout_/
├── client/                 React + Vite frontend
│   ├── src/App.jsx         Main application shell and demo search state
│   ├── src/components/     Search, cards, maps, chatbot, comparison, auth UI
│   ├── src/pages/          Profile and Smart Health Card pages
│   └── src/data/           All-India demo hospital registry
├── server/                 Node.js + Express backend
│   ├── src/server.js       HTTP server, CORS, rate limits, routes
│   ├── src/routes/         API, authentication, user, and admin routes
│   ├── src/services/       Chatbot engine and optional OpenAI integration
│   ├── src/data/           Seed data and in-memory user store
│   └── tests/               Chatbot audit test
├── md/                     Product, technical, data, chatbot, and feature docs
└── reference/              Design system and visual guidance
```

## Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Three.js
- Leaflet
- Lucide icons

### Backend

- Node.js
- Express
- JWT authentication
- bcrypt password hashing
- CORS
- Express rate limiting
- Optional OpenAI Chat Completions integration

### Planned production services

- MongoDB and Mongoose
- Zod or Joi validation at API boundaries
- S3-compatible source/report storage
- OpenSearch or Elasticsearch for advanced search
- Structured logs and metrics
- Managed deployment with Docker

## Run Locally

Use two terminals from the repository root.

### Start the frontend

```powershell
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Start the backend

```powershell
cd server
npm install
npm start
```

The backend runs at `http://localhost:5000`.

The Vite development proxy sends `/api` requests to port `5000` by default. To use another API port, set `MEDSCOUT_API_URL` in the client environment.

### Check the backend

Open:

```text
http://localhost:5000/health
```

Expected response:

```json
{
	"status": "healthy"
}
```

## Useful Commands

Run these from the relevant directory:

```powershell
# Client production build
cd client
npm run build

# Client lint
npm run lint

# Backend chatbot audit
cd ..\server
npm run audit:chat
```

## Demo Accounts

These accounts are for local development only:

| Account | Password | Role |
|---|---|---|
| `patient@demo.com` | `Demo@1234` | Patient/user |
| `hospital@demo.com` | `Demo@1234` | Hospital admin |
| `verifier@demo.com` | `Demo@1234` | Data verifier |
| `admin@demo.com` | `Demo@1234` | Platform admin |

Do not use these credentials in a deployed environment.

## Environment Variables

The backend supports these values:

```text
PORT=5000
ALLOWED_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
REFRESH_SECRET=replace-with-a-different-long-random-secret
OPENAI_API_KEY=optional
OPENAI_MODEL=gpt-4o-mini
```

For production, `JWT_SECRET` and `REFRESH_SECRET` must be set explicitly. Never use development fallback secrets in a deployed environment.

## Backend API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/hospitals` | List and filter hospitals |
| `GET` | `/api/hospitals/:id` | View one hospital |
| `GET` | `/api/diseases` | List diseases and treatments |
| `POST` | `/api/search` | Structured search |
| `POST` | `/api/compare` | Compare hospitals |
| `POST` | `/api/chat` | Process one chatbot message |
| `GET` | `/api/chat/status` | Check AI provider status |
| `GET` | `/api/sources` | List source records |
| `GET` | `/api/schemes` | List government schemes |
| `POST` | `/api/admin/evidence` | Submit evidence |
| `PATCH` | `/api/admin/evidence/:id` | Review evidence |
| `GET` | `/api/admin/audit` | View audit history |

Authenticated user routes include profiles, preferences, saved hospitals, saved comparisons, reports, and report-sharing consent grants.

## Data Model Summary

The planned data model separates hospital identity from claims and evidence:

- `User`: account, role, preferences, saved items
- `Hospital`: canonical identity, address, facilities, specialties
- `Disease`: controlled disease taxonomy
- `Treatment`: controlled treatment taxonomy
- `HospitalTreatment`: hospital capability for a disease and treatment
- `OutcomeRecord`: disease/treatment-specific clinical metrics
- `CostRecord`: package, tariff, estimate, or historical cost evidence
- `SourceDocument`: original source metadata
- `EvidenceRecord`: normalized claim extracted from a source
- `VerificationReview`: human or rule-based review decision
- `Comparison`: saved comparison session
- `ChatSession` and `ChatMessage`: conversation state and tool results
- `AuditLog`: record of administrative changes

High-impact claims must have a source, reporting period, definition, and verification status.

## Ranking Approach

MedScout should use a transparent staged ranking process:

1. Apply hard eligibility and user constraints.
2. Check evidence availability and freshness.
3. Compare disease-specific outcomes and treatment volume when definitions are comparable.
4. Match budget, location, speciality, facilities, and scheme requirements.
5. Apply transparent tie-breakers.

The product should not publish one unexplained clinical-quality score.

## Authentication and Roles

Basic discovery works without an account. Login is needed for persistent features such as saved hospitals, saved comparisons, saved searches, preferences, and conversation history.

Roles:

- `user`: patient or caregiver account
- `hospital_admin`: submits evidence for an associated hospital
- `verifier`: reviews evidence and audit records
- `platform_admin`: full administrative access

JWT access tokens are short-lived and refresh tokens rotate. Production deployments need secure secret management, HTTPS, validation, rate limits, and audit logging.

## Current Limitations

- Demo hospital data is not a live government registry.
- The current user store is in memory and resets when the server restarts.
- The current report flow stores report summaries, not uploaded medical files.
- Real-time beds, rooms, doctors, OT, ICU availability, appointments, payments, insurance claims, and medical-record integration are not implemented.
- Automated clinical outcome auditing is not implemented.
- Some production architecture items, including MongoDB, object storage, and OpenSearch, remain planned.

## Documentation Map

- [Product requirements](md/prd.md)
- [Technical requirements](md/trd.md)
- [Backend data model](md/backend.md)
- [Chatbot specification](md/chatbot.md)
- [Authentication specification](md/login.md)
- [Smart Health Card architecture](md/smartcard.md)
- [Hospital directory notes](md/hospitals.md)
- [Disease categories](md/diseases.md)
- [Product updates and architecture decisions](md/updates.md)
- [Design system](reference/DESIGN.md)
- [Open copy and UX tasks](md/todo.md)

## Data and Research References

The planning documents reference official or domain sources including:

- ABDM Health Facility Registry
- Ministry of Health & Family Welfare Clinical Establishments resources
- National Health Authority PM-JAY package documentation
- NABH hospital standards
- ICMR and Clinical Trials Registry India

These references should be checked again before any data is promoted from demo content to production content.
