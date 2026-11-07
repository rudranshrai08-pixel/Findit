import assert from "node:assert/strict";

const baseUrl = process.env.FINDIT_API_URL || "http://127.0.0.1:5000";

async function getJson(path) {
  const response = await fetch(baseUrl + path);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const { response: healthResponse, body: health } = await getJson("/api/health");
assert.equal(healthResponse.status, 200, "Health route should respond with HTTP 200.");
assert.equal(health.status, "ok", "Express API should report status ok.");
assert.equal(health.database, "connected", "MongoDB should be connected.");

const { response: listingsResponse, body: listingsBody } = await getJson("/api/listings");
assert.equal(listingsResponse.status, 200, "Public listings should respond with HTTP 200.");
assert.ok(Array.isArray(listingsBody.listings), "Public listings response should contain a listings array.");
for (const listing of listingsBody.listings) {
  assert.equal(Object.hasOwn(listing, "privateDetails"), false, "Public listings must not include private claim details.");
}

for (const path of ["/api/auth/matches", "/api/auth/claims"]) {
  const { response } = await getJson(path);
  assert.equal(response.status, 401, path + " should require a signed-in student.");
}

console.log("API smoke check passed: MongoDB health, public listings, private data boundary, and signed-in route guards.");