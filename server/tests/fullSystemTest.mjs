import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("=== Starting MedScout Full System Integration Audit ===\n");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test("GET /health returns 200 and healthy status", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "healthy");
    assert.equal(data.platform, "MedScout Clinical Evidence Engine");
  });

  // 2. Diseases endpoint
  await test("GET /api/diseases returns list of diseases", async () => {
    const res = await fetch(`${BASE_URL}/api/diseases`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const list = json.data?.diseases || (Array.isArray(json.data) ? json.data : []);
    assert.ok(Array.isArray(list) && list.length > 0);
    assert.ok(list.some(d => d.id === "dis_cabg"));
  });

  // 3. Schemes endpoint
  await test("GET /api/schemes returns government healthcare schemes", async () => {
    const res = await fetch(`${BASE_URL}/api/schemes`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.length > 0);
    assert.ok(json.data.some(s => s.name.includes("Ayushman") || s.name.includes("PM-JAY")));
  });

  // 4. Hospitals endpoint with queries
  await test("GET /api/hospitals returns hospital list and respects filters", async () => {
    const res = await fetch(`${BASE_URL}/api/hospitals?condition=dis_cabg&sortBy=successRate`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.length > 0);
    assert.ok(json.data[0].canonicalName);
  });

  // 5. Hospital single profile
  await test("GET /api/hospitals/:id returns profile or 404", async () => {
    const res = await fetch(`${BASE_URL}/api/hospitals/demo-aiims-delhi`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.match(json.data.canonicalName, /AIIMS/i);

    const res404 = await fetch(`${BASE_URL}/api/hospitals/non-existent-hospital-xyz`);
    assert.equal(res404.status, 404);
  });

  // 6. Hospital comparison endpoint
  await test("GET /api/compare compares multiple hospitals", async () => {
    const res = await fetch(`${BASE_URL}/api/compare?ids=demo-aiims-delhi,demo-apollo-delhi&disease=dis_cabg`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.length >= 2);
  });

  // 7. Sources endpoint
  await test("GET /api/sources returns statutory provenance documents", async () => {
    const res = await fetch(`${BASE_URL}/api/sources`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.length > 0);
    assert.ok(json.data[0].documentHash);
  });

  // 8. Auth: Login & Profile
  let token = null;
  let refreshToken = null;
  await test("POST /api/auth/login succeeds for valid demo user and rejects bad passwords", async () => {
    const badRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient@demo.com", password: "wrongpassword" })
    });
    assert.equal(badRes.status, 401);

    const goodRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient@demo.com", password: "Demo@1234" })
    });
    assert.equal(goodRes.status, 200);
    const goodJson = await goodRes.json();
    assert.equal(goodJson.success, true);
    assert.ok(goodJson.data.accessToken);
    assert.ok(goodJson.data.refreshToken);
    token = goodJson.data.accessToken;
    refreshToken = goodJson.data.refreshToken;
  });

  // 9. Auth: Authenticated profile check
  await test("GET /api/user/profile retrieves user profile with JWT", async () => {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.email, "patient@demo.com");
  });

  // 10. Saved Hospitals (Bookmarks)
  await test("POST & GET & DELETE /api/user/saved-hospitals manages bookmarks", async () => {
    const addRes = await fetch(`${BASE_URL}/api/user/saved-hospitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ hospitalId: "demo-max-saket" })
    });
    assert.ok(addRes.status === 200 || addRes.status === 201);

    const listRes = await fetch(`${BASE_URL}/api/user/saved-hospitals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listJson = await listRes.json();
    assert.ok(listJson.data.some(item => (item.hospitalId || item) === "demo-max-saket"));

    // Remove hospital
    const delRes = await fetch(`${BASE_URL}/api/user/saved-hospitals/demo-max-saket`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    assert.equal(delRes.status, 200);
  });

  // 11. User Reports CRUD
  let createdReportId = null;
  await test("POST, GET, DELETE /api/user/reports manages medical records", async () => {
    const createRes = await fetch(`${BASE_URL}/api/user/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Test Echocardiogram Report",
        type: "cardiology",
        facility: "AIIMS Delhi",
        doctor: "Dr. K. Sharma",
        fileSize: "2.4 MB"
      })
    });
    assert.equal(createRes.status, 201);
    const createJson = await createRes.json();
    assert.equal(createJson.success, true);
    createdReportId = createJson.data.id;
    assert.ok(createdReportId);

    const getRes = await fetch(`${BASE_URL}/api/user/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getJson = await getRes.json();
    assert.ok(getJson.data.some(r => r.id === createdReportId));

    const delRes = await fetch(`${BASE_URL}/api/user/reports/${createdReportId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(delRes.status, 200);
  });

  // 12. User Access Grants (Consent Manager)
  let grantId = null;
  await test("POST, GET, DELETE /api/user/access-grants manages hospital consent", async () => {
    const createRes = await fetch(`${BASE_URL}/api/user/access-grants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        hospitalId: "demo-aiims-delhi",
        hospitalName: "AIIMS New Delhi",
        grantedTo: "Emergency Care Unit",
        scope: ["reports", "emergency_info"],
        expiresInDays: 30
      })
    });
    assert.equal(createRes.status, 201);
    const createJson = await createRes.json();
    grantId = createJson.data.id;
    assert.ok(grantId);

    const getRes = await fetch(`${BASE_URL}/api/user/access-grants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getJson = await getRes.json();
    assert.ok(getJson.data.some(g => g.id === grantId));

    const delRes = await fetch(`${BASE_URL}/api/user/access-grants/${grantId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(delRes.status, 200);
  });

  // 13. Chatbot: Scope limitation error on out-of-scope query
  await test("POST /api/chat flags out-of-scope non-medical messages with error", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is the capital of France?" })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.isError, true);
    assert.match(json.data.content, /Medical Scope Limitation/i);
    assert.equal(json.data.resultCards.length, 0);
  });

  // 14. Chatbot: Inquires for details regarding disease and person
  await test("POST /api/chat inquires for disease and person details", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I need heart surgery" })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.isError, undefined);
    assert.match(json.data.content, /Person/i);
    assert.match(json.data.content, /Disease/i);
    assert.equal(json.data.resultCards.length, 0);
  });

  // 15. Chatbot: Full hospital search with rich patient context
  await test("POST /api/chat returns tailored hospitals with profile summary", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Bypass surgery for my 68-year-old father with diabetes in Delhi, planned treatment, budget 5 lakh"
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.resultCards.length > 0);
    assert.match(json.data.content, /Clinical & Patient Profile/i);
    assert.match(json.data.content, /Father/i);
    assert.match(json.data.content, /68/i);
    assert.match(json.data.content, /Diabetes/i);
    assert.ok(json.data.resultCards.every(c => c.significance));
  });

  // 16. Chatbot: Statutory audit text
  await test("POST /api/chat handles statutory audit queries", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "run audit text" })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.match(json.data.content, /Statutory Clinical Audit Report/i);
    assert.ok(json.data.sources.length > 0);
  });

  // 17. Chatbot: Subsidy comparison
  await test("POST /api/chat handles subsidy comparison queries", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "is subsidy available for heart bypass surgery" })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.match(json.data.content, /subsidy/i);
  });

  // 18. Chatbot: Emergency trigger
  await test("POST /api/chat triggers clinical safety alert on emergency keywords", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Severe chest pain and difficulty breathing" })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.isEmergency, true);
    assert.match(json.data.content, /108|112/);
  });

  console.log(`\n========================================`);
  console.log(`Audit Completed: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
