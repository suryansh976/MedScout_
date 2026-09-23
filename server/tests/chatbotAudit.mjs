import assert from "node:assert/strict";
import { processChatMessage } from "../src/services/chatbotEngine.js";

function turn(message, state = {}) {
  return processChatMessage(message, state);
}

function nextState(response, previous = {}) {
  return {
    ...previous,
    context: {
      ...(previous.context || {}),
      ...(response.extractedContext || {})
    },
    preferences: response.extractedContext?.preferences || previous.preferences || {},
    turnCount: (previous.turnCount || 0) + 1
  };
}

const first = turn("Find a hospital");
assert.match(first.followUpQuestion, /condition|diagnosis|symptom/i);
assert.equal(first.resultCards.length, 0, "must ask for the clinical need before suggesting hospitals");

let state = nextState(first);
const second = turn("My father has kidney disease", state);
assert.match(second.followUpQuestion, /city|area/i);
assert.equal(second.resultCards.length, 0, "must ask for location before results");

state = nextState(second, state);
const third = turn("Chandigarh", state);
assert.match(third.followUpQuestion, /planned|soon|urgent/i);
assert.equal(third.resultCards.length, 0, "must ask for patient context before results");

state = nextState(third, state);
const fourth = turn("Adult, planned treatment", state);
assert.ok(fourth.resultCards.length > 0, "should suggest hospitals after required context is supplied");
assert.ok(fourth.resultCards.every(card => card.significance), "every hospital result needs a significance explanation");

const comparison = turn("Compare AIIMS and Max for CABG based on cost and outcomes", {
  context: { location: "New Delhi NCR", patientType: "self", ageGroup: "adult", urgency: "planned" }
});
assert.ok(comparison.comparisonCards?.length >= 2, "comparison should return structured hospital data");
assert.match(comparison.content, /trade-off|priority|New Delhi NCR/i);

const emergency = turn("My face is drooping and speech is slurred");
assert.equal(emergency.isEmergency, true);
assert.match(emergency.content, /108|112/);

const auditTurn = turn("run audit text");
assert.equal(auditTurn.role, "assistant");
assert.match(auditTurn.content, /Statutory Clinical Audit Report/i);
assert.ok(auditTurn.sources.length > 0, "audit response should provide verifiable statutory sources");

const subsidyTurn = turn("is subsidy available for heart bypass surgery");
assert.equal(subsidyTurn.role, "assistant");
assert.match(subsidyTurn.content, /subsidy/i);

console.log("Chatbot audit passed: clarification, location, patient context, significance, comparison, emergency, audit text, and subsidy flows.");