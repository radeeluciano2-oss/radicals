import assert from "node:assert/strict";

const base = process.env.APP_URL || "http://localhost:8787";

const health = await fetch(`${base}/api/health`);
assert.equal(health.status, 200);
const healthJson = await health.json();
assert.equal(healthJson.ok, true);

const config = await fetch(`${base}/api/config`);
assert.equal(config.status, 200);
const configJson = await config.json();
assert.equal(typeof configJson.ttsConfigured, "boolean");

console.log("Smoke checks passed.");
