# Hospital Discovery Platform

## Sign-In, Authentication & User Account Specification

**Document Type:** Product & Technical Specification
**Version:** 1.0
**Status:** MVP Specification

---

# 1. Purpose

The Hospital Discovery Platform will provide an optional account system that allows users to save their hospital-search context, preferences, comparisons, conversations, and other personalized information.

The platform will follow a **Guest-First, Account-Enhanced** model.

Users should be able to discover hospitals and use core search functionality without creating an account. Authentication becomes valuable when users want to save information, maintain personalization across sessions, or access account-specific features.

The authentication system will also provide role-based access for hospital administrators, data verifiers, and platform administrators.

---

# 2. Authentication Philosophy

The platform should follow these principles:

### 2.1 No mandatory login for basic discovery

Users should be able to:

* Search hospitals
* Search by disease
* Search by treatment
* Filter by speciality
* Filter by location
* Filter by budget
* Compare hospitals
* View hospital information
* View disease-specific treatment information
* Use the AI assistant
* Explore government healthcare schemes

without creating an account.

### 2.2 Login provides persistence

Authentication should become necessary when the user wants to preserve information between sessions.

Examples:

> Save this hospital

> Save this comparison

> Continue this conversation later

> Remember my preferred location

> Save my treatment search

---

# 3. Why Sign-In Is Significant

The account system provides several important functions.

## 3.1 Personalization

The platform can remember explicitly provided preferences such as:

* Preferred city
* Maximum travel distance
* Budget range
* Preferred speciality
* Preferred hospital type
* Treatment priorities
* Cost sensitivity
* Disease-specific outcome preference

Example:

A user previously specified:

> "I care more about disease-specific treatment outcomes than distance."

The system can remember this preference if the user chooses to save it.

---

## 3.2 Saved Hospitals

Users can bookmark hospitals they are interested in.

Example:

```text
My Hospitals

♥ Fortis Hospital
♥ PGIMER
♥ Government Medical College
```

Each saved hospital can contain:

* Hospital name
* Location
* Relevant speciality
* Disease/treatment searched
* Date saved
* User notes

---

## 3.3 Saved Comparisons

Hospital comparison can require substantial user effort.

A logged-in user can save:

```text
Kidney Stone Treatment Comparison

Hospital A
Hospital B
Hospital C

Saved: September 2026
```

The user can return to the comparison later without repeating the search.

---

## 3.4 Persistent Chatbot Context

Guest users can have temporary conversation context.

Logged-in users can optionally retain conversations.

Example:

```text
Previous Conversation

"Find hospitals for kidney stone treatment
near Chandigarh under ₹80,000."

→ 6 hospitals found
→ 3 hospitals compared
```

The user can continue the conversation later.

---

## 3.5 Preference Persistence

The chatbot can learn **explicitly provided search preferences**, rather than learning medical facts.

Example:

```text
User:
"I don't mind travelling 30 km if the hospital
has treated many patients with this disease."

Preference Profile:

Maximum distance: 30 km
Priority 1: Disease-specific treatment volume
Priority 2: Disease-specific outcomes
Priority 3: Cost
Priority 4: Distance
```

These preferences can be reused in future searches.

---

# 4. Guest vs Registered User

| Feature                |         Guest | Registered User |
| ---------------------- | ------------: | --------------: |
| Hospital search        |             ✓ |               ✓ |
| Disease search         |             ✓ |               ✓ |
| Treatment search       |             ✓ |               ✓ |
| Location filtering     |             ✓ |               ✓ |
| Budget filtering       |             ✓ |               ✓ |
| Hospital comparison    |             ✓ |               ✓ |
| AI chatbot             |             ✓ |               ✓ |
| View hospital details  |             ✓ |               ✓ |
| View outcome data      |             ✓ |               ✓ |
| View cost information  |             ✓ |               ✓ |
| Save hospitals         |             — |               ✓ |
| Save comparisons       |             — |               ✓ |
| Save searches          |             — |               ✓ |
| Persistent preferences |             — |               ✓ |
| Conversation history   |     Temporary |               ✓ |
| Cross-device access    |             — |               ✓ |
| Personalized search    | Session-based |               ✓ |
| Account settings       |             — |               ✓ |

---

# 5. Sign-Up Requirements

The registration process should collect only information necessary for account functionality.

## Required fields

```text
Name
Email
Password
```

Optional:

```text
Phone number
Preferred city
Preferred language
```

The platform should avoid collecting unnecessary medical information during registration.

---

# 6. Sign-In Methods

The MVP can support:

### Primary

**Email + Password**

```text
Email
Password
[ Sign In ]
```

### Optional

**Google Sign-In**

```text
[ Continue with Google ]
```

Phone OTP can be added later if there is a demonstrated product requirement.

---

# 7. Authentication Flow

## New User

```text
Landing Page
      ↓
Explore Platform
      ↓
User chooses "Save"
      ↓
Login / Sign Up
      ↓
Create Account
      ↓
Email Verification
      ↓
Account Created
      ↓
Saved Item
```

## Existing User

```text
Login
  ↓
Credentials Verification
  ↓
Authentication
  ↓
Session / Access Token
  ↓
Dashboard / Previous Context
```

---

# 8. Sign-Up UX

### Screen

```text
------------------------------------
       Create Your Account

 Name
 [________________________]

 Email
 [________________________]

 Password
 [________________________]

 Confirm Password
 [________________________]

 [ ] I agree to the Terms & Privacy Policy

        [ Create Account ]

       Continue with Google

 Already have an account?
             Sign In
------------------------------------
```

The interface should clearly communicate that account creation is optional for basic hospital discovery.

---

# 9. Sign-In UX

```text
------------------------------------
          Welcome Back

 Email
 [________________________]

 Password
 [________________________]

 [ ] Remember me

        [ Sign In ]

      Forgot Password?

 ─────────── OR ───────────

     [ Continue with Google ]

 Don't have an account?
          Create Account
------------------------------------
```

---

# 10. Password Requirements

Minimum requirements:

* At least 8 characters
* Password confirmation during registration

Recommended:

* Uppercase character
* Lowercase character
* Number
* Special character

Passwords must never be stored in plaintext.

The backend should use a modern password hashing algorithm such as:

```text
Argon2id
```

or:

```text
bcrypt
```

---

# 11. Email Verification

After registration:

```text
Account Created
      ↓
Verification Email
      ↓
User clicks verification link
      ↓
Email verified
      ↓
Account activated
```

Unverified accounts may have restricted functionality depending on the implementation.

---

# 12. Forgot Password

Flow:

```text
Forgot Password
      ↓
Enter Email
      ↓
Send Reset Link
      ↓
User Opens Link
      ↓
Create New Password
      ↓
Password Updated
      ↓
Login
```

The reset token should:

* Be cryptographically random
* Have a short expiration period
* Be single-use
* Be invalidated after successful password reset

---

# 13. Session Management

After successful authentication, the backend creates an authenticated session.

For an API-based architecture:

```text
Frontend
   ↓
Login API
   ↓
Authentication Service
   ↓
Access Token
   ↓
Authenticated API Requests
```

Recommended architecture:

```text
Short-lived access token
+
Secure refresh mechanism
```

Tokens should not contain sensitive medical information.

---

# 14. User Roles

The platform should support role-based access control.

## Role 1 — Guest

Unauthenticated visitor.

Permissions:

```text
Search
View
Compare
Chat
Filter
```

---

## Role 2 — Patient/User

Normal registered account.

Permissions:

```text
Everything available to Guest

+

Save hospitals
Save comparisons
Save searches
Save preferences
View history
Manage profile
Manage conversations
```

---

## Role 3 — Hospital Administrator

Used by authorized hospital representatives.

Possible permissions:

```text
Manage hospital profile
Submit hospital information
Submit supporting documents
Submit pricing information
Submit facility information
Respond to verification requests
```

Hospital administrators should **not** be allowed to directly modify verified disease-outcome statistics.

---

## Role 4 — Data Verifier

Responsible for reviewing submitted evidence.

Permissions:

```text
Review evidence
Verify sources
Approve data
Reject data
Request clarification
Flag conflicts
Review historical changes
```

---

## Role 5 — Platform Administrator

Highest operational role.

Permissions:

```text
Manage users
Manage hospitals
Manage diseases
Manage treatments
Manage verification
Manage roles
Manage system configuration
View audit logs
Suspend accounts
```

---

# 15. User Profile

Example:

```json
{
  "_id": "user_123",
  "name": "User Name",
  "email": "user@example.com",
  "phone": null,
  "role": "user",
  "emailVerified": true,
  "preferences": {
    "preferredLocation": "Chandigarh",
    "maxDistanceKm": 30,
    "budgetMax": 100000,
    "priorities": [
      "diseaseOutcome",
      "treatmentVolume",
      "cost"
    ]
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# 16. User Preference System

The preference system is important for the adaptive chatbot.

It should store only information that the user has explicitly provided or explicitly chosen to save.

Example:

```json
{
  "location": {
    "value": "Chandigarh",
    "source": "user_explicit"
  },
  "budget": {
    "max": 100000,
    "currency": "INR",
    "source": "user_explicit"
  },
  "maxDistance": {
    "value": 30,
    "unit": "km",
    "source": "user_explicit"
  },
  "priorities": [
    {
      "field": "diseaseSpecificOutcome",
      "priority": 1
    },
    {
      "field": "treatmentVolume",
      "priority": 2
    },
    {
      "field": "cost",
      "priority": 3
    },
    {
      "field": "distance",
      "priority": 4
    }
  ]
}
```

---

# 17. Important Privacy Rule

The preference engine must distinguish:

### Explicit information

User says:

> "My budget is ₹1 lakh."

Store:

```text
budget = ₹1,00,000
source = explicit
```

### Inferred information

User searches for:

> Cancer treatment

The system must **not automatically assume**:

```text
User has cancer
```

A search query does not establish a diagnosis.

---

# 18. Medical Data Boundary

The account system should not automatically become a medical-record system.

For MVP, avoid storing:

* Medical records
* Diagnoses
* Prescriptions
* Lab reports
* Detailed medical history
* Insurance documents

unless a future feature explicitly requires them and the appropriate privacy/security architecture is implemented.

---

# 19. Saved Hospital Schema

Example:

```json
{
  "_id": "saved_123",
  "userId": "user_123",
  "hospitalId": "hospital_456",
  "context": {
    "diseaseId": "disease_001",
    "treatmentId": "treatment_001"
  },
  "notes": "Compare cost with PGIMER",
  "createdAt": "..."
}
```

---

# 20. Saved Comparison Schema

```json
{
  "_id": "comparison_123",
  "userId": "user_123",
  "diseaseId": "disease_001",
  "treatmentId": "treatment_001",
  "hospitalIds": [
    "hospital_001",
    "hospital_002",
    "hospital_003"
  ],
  "filters": {
    "budgetMax": 100000,
    "location": "Chandigarh"
  },
  "createdAt": "..."
}
```

---

# 21. Chat History

For authenticated users:

```text
My Conversations

1. Kidney stone hospitals — Chandigarh
2. Cardiac treatment — Delhi
3. Government scheme search
4. Compare three hospitals
```

Each conversation can contain:

```text
User messages
Assistant responses
Extracted filters
Tool calls
Sources
Hospital IDs
Comparison state
Safety flags
```

---

# 22. Chatbot + Login Integration

The chatbot should work for both guest and authenticated users.

### Guest

```text
User
 ↓
Temporary Session
 ↓
Context Manager
 ↓
Search / Compare
```

### Logged-in user

```text
User
 ↓
Authenticated Session
 ↓
User Profile
 ↓
Saved Preferences
 ↓
Current Conversation Context
 ↓
Context Manager
 ↓
Search / Compare
```

The chatbot should combine:

```text
Current conversation
+
Saved user preferences
+
Current search requirements
```

However, **current explicit instructions override older saved preferences**.

Example:

Saved preference:

```text
Maximum budget = ₹80,000
```

Current message:

> "For this treatment, I can spend up to ₹1.5 lakh."

Current requirement:

```text
₹1.5 lakh
```

The system should not continue using ₹80,000.

---

# 23. Account Dashboard

Recommended dashboard:

```text
              MY ACCOUNT

Hello, User

--------------------------------
Saved Hospitals
       6
--------------------------------

Saved Comparisons
       4
--------------------------------

Recent Searches
       12
--------------------------------

AI Conversations
       8
--------------------------------

Preferences
Location: Chandigarh
Budget: ₹1,00,000
Distance: 30 km
--------------------------------
```

---

# 24. Account Settings

Users should be able to manage:

### Profile

* Name
* Email
* Phone

### Preferences

* Location
* Budget
* Distance
* Search priorities

### Security

* Change password
* Active sessions
* Sign out of all devices

### Privacy

* Conversation history
* Saved searches
* Account data

### Account

* Delete account
* Export personal account data

---

# 25. Logout

Logout should:

1. Invalidate the current authenticated session.
2. Clear authentication state from the client.
3. Prevent access to protected endpoints.
4. Preserve server-side account data unless the user deletes it.

UI:

```text
Profile
   ↓
Settings
   ↓
[ Log Out ]
```

---

# 26. Account Deletion

The user should have an option to permanently delete their account.

Flow:

```text
Settings
   ↓
Delete Account
   ↓
Confirmation
   ↓
Authentication Confirmation
   ↓
Account Deletion
```

The platform should clearly distinguish between:

```text
Delete account
```

and:

```text
Delete conversation history
```

because they are different operations.

Certain audit records may need to be retained where required for security, compliance, or operational integrity, with personal information minimized where appropriate.

---

# 27. Security Requirements

The authentication system must implement:

### Transport Security

```text
HTTPS/TLS
```

### Password Security

```text
Argon2id / bcrypt
```

### Authentication Security

```text
Short-lived access tokens
Secure refresh tokens
Token rotation
Session invalidation
```

### API Security

```text
Rate limiting
Input validation
Authorization middleware
RBAC
CORS configuration
CSRF protection where applicable
```

### Database Security

```text
Encrypted connections
Least-privilege database credentials
Sensitive-field protection
Audit logging
```

---

# 28. Authentication API

Suggested endpoints:

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

POST /api/auth/refresh

POST /api/auth/verify-email

POST /api/auth/forgot-password
POST /api/auth/reset-password

GET  /api/auth/me

PATCH /api/users/profile
PATCH /api/users/preferences

DELETE /api/users/account
```

---

# 29. Protected APIs

The following endpoints should require authentication:

```http
POST /api/saved-hospitals
GET  /api/saved-hospitals
DELETE /api/saved-hospitals/:id

POST /api/comparisons/save
GET  /api/comparisons/saved
DELETE /api/comparisons/:id

GET /api/chat/history
GET /api/chat/:sessionId
```

Public endpoints can remain available for:

```http
GET /api/hospitals
GET /api/hospitals/:id
GET /api/diseases
GET /api/treatments
POST /api/search
POST /api/compare
POST /api/chat
```

The exact authorization model should be finalized during implementation.

---

# 30. Authentication Data Model

Core collections:

```text
User
Session
SavedHospital
SavedComparison
UserPreference
ChatSession
ChatMessage
AuditLog
```

Relationship:

```text
User
 │
 ├── Sessions
 │
 ├── Preferences
 │
 ├── SavedHospitals
 │
 ├── SavedComparisons
 │
 └── ChatSessions
        │
        └── ChatMessages
```

---

# 31. What Login Should NOT Control

Authentication should not be required for access to factual hospital information.

The following should remain publicly discoverable:

```text
Hospital name
Hospital location
Specialities
Treatments
Facilities
Disease-specific statistics
Cost information
Accreditation
Sources
Verification status
Last verified date
```

This is important because the platform's core purpose is **public hospital discovery and transparency**.

---

# 32. Authentication and Trust

The account system must never be presented as proof of medical eligibility.

For example:

Incorrect:

> "Your account shows that you are eligible for this government scheme."

Correct:

> "Based on the information you provided, this scheme may be relevant. Eligibility must be confirmed using the official scheme criteria."

Similarly, the chatbot should not say:

> "This hospital is the best for you."

Instead:

> "This hospital matches your selected disease, treatment, budget, and search priorities. Here is the supporting evidence."

---

# 33. Recommended MVP Scope

### Implement now

```text
✓ Guest browsing
✓ Email/password registration
✓ Login
✓ Logout
✓ Forgot password
✓ Email verification
✓ User profile
✓ Saved hospitals
✓ Saved comparisons
✓ Search history
✓ Chat history
✓ Explicit preferences
✓ Role-based access
✓ Admin authentication
✓ Secure password hashing
✓ Session management
✓ Account deletion
```

### Later

```text
○ Google OAuth
○ Phone OTP
○ Multi-factor authentication
○ Advanced notification preferences
○ Cross-device preference synchronization
○ Insurance profile
○ Medical document management
○ Appointment management
○ Patient health records
```

---

# 34. Recommended User Journey

The intended journey is:

```text
                 LANDING PAGE
                       │
                       ↓
                Search Hospital
                       │
                       ↓
              Explore Results
                       │
            ┌──────────┴──────────┐
            ↓                     ↓
       Continue Guest         Create Account
            │                     │
            ↓                     ↓
       Compare Hospitals    Personalized Profile
            │                     │
            ↓                     ↓
       Use AI Assistant      Save Preferences
            │                     │
            └──────────┬──────────┘
                       ↓
                Save Hospital
                       ↓
              Save Comparison
                       ↓
              Continue Later
```

---

# 35. Final Product Principle

The login system should **enhance the hospital-discovery experience rather than gate it**.

The platform should follow:

**Discover without login → Personalize with login → Save information → Continue later**

The account system therefore has four primary purposes:

1. **Identity** — securely identify the user.
2. **Persistence** — retain searches, comparisons, hospitals, and conversations.
3. **Personalization** — remember explicitly provided preferences.
4. **Authorization** — control access to user, hospital-admin, verifier, and platform-admin functionality.

The authentication system must remain separate from the platform's medical evidence system.

**Login data should influence the user's experience, not modify the underlying hospital facts, disease statistics, treatment outcomes, costs, or verification records.**
