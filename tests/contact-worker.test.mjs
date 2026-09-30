import assert from "node:assert/strict";
import test from "node:test";
import worker from "../_worker.js";

function validInquiry(overrides = {}) {
  return {
    name: "Alice Example",
    email: "alice@example.test",
    organization: "City Roads",
    city: "Berlin",
    message: "Please review our intersection.",
    website: "",
    startedAt: String(Date.now() - 5000),
    ...overrides,
  };
}

function contactRequest(body, headers = {}) {
  return new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function setup(t, provider = async () => Response.json({ id: "test-message" })) {
  // Every test replaces fetch before invoking the Worker; no real email is sent.
  const delivery = t.mock.method(globalThis, "fetch", provider);
  const assetResponse = new Response("static asset");
  const assets = t.mock.fn(async () => assetResponse);
  const env = {
    RESEND_API_KEY: "test-api-key",
    CONTACT_FROM_EMAIL: "Website <sender@example.test>",
    CONTACT_TO_EMAIL: "inbox@example.test",
    ASSETS: { fetch: assets },
  };
  return { env, delivery, assets, assetResponse };
}

async function assertError(response, status) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.match(response.headers.get("Content-Type"), /application\/json/);
  const body = await response.json();
  assert.equal(typeof body.error, "string");
  assert.ok(body.error.length > 0);
  assert.notEqual(body.ok, true);
}

test("contact endpoint rejects unsupported methods without sending email", async (t) => {
  const { env, delivery } = setup(t);
  await assertError(await worker.fetch(new Request("https://example.test/api/contact"), env), 405);
  assert.equal(delivery.mock.callCount(), 0);
});

test("missing email configuration returns an unavailable response without sending", async (t) => {
  const { env, delivery } = setup(t);
  delete env.RESEND_API_KEY;
  await assertError(await worker.fetch(contactRequest(validInquiry()), env), 503);
  assert.equal(delivery.mock.callCount(), 0);
});

for (const [description, body] of [
  ["malformed JSON", "{"],
  ["null", "null"],
  ["an array", "[]"],
  ["a string", '"inquiry"'],
  ["a number", "1"],
  ["a boolean", "true"],
]) {
  test(`rejects ${description} without sending email`, async (t) => {
    const { env, delivery } = setup(t);
    await assertError(await worker.fetch(contactRequest(body), env), 400);
    assert.equal(delivery.mock.callCount(), 0);
  });
}

for (const [description, overrides] of [
  ["missing name", { name: "" }],
  ["missing email", { email: "" }],
  ["missing organization", { organization: "" }],
  ["invalid email", { email: "not-an-email" }],
  ["expired timestamp", { startedAt: "1" }],
  ["invalid timestamp", { startedAt: "invalid" }],
]) {
  test(`rejects an inquiry with ${description} without sending email`, async (t) => {
    const { env, delivery } = setup(t);
    await assertError(await worker.fetch(contactRequest(validInquiry(overrides)), env), 400);
    assert.equal(delivery.mock.callCount(), 0);
  });
}

test("rejects a submission made immediately after starting the form", async (t) => {
  const { env, delivery } = setup(t);
  await assertError(await worker.fetch(contactRequest(validInquiry({ startedAt: String(Date.now()) })), env), 400);
  assert.equal(delivery.mock.callCount(), 0);
});

test("rejects a declared oversized request without sending email", async (t) => {
  const { env, delivery } = setup(t);
  await assertError(await worker.fetch(contactRequest(validInquiry(), { "Content-Length": "12001" }), env), 413);
  assert.equal(delivery.mock.callCount(), 0);
});

test("spam-trap submissions appear accepted without sending email", async (t) => {
  const { env, delivery } = setup(t);
  const response = await worker.fetch(contactRequest(validInquiry({ website: "spam.example" })), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(delivery.mock.callCount(), 0);
});

for (const status of [429, 503]) {
  test(`provider HTTP ${status} produces a controlled delivery error`, async (t) => {
    const { env, delivery } = setup(t, async () => new Response("Provider unavailable", { status }));
    await assertError(await worker.fetch(contactRequest(validInquiry()), env), 502);
    assert.equal(delivery.mock.callCount(), 1);
  });
}

test("provider network failure produces a controlled delivery error", async (t) => {
  const { env, delivery } = setup(t, async () => { throw new TypeError("Network unavailable"); });
  await assertError(await worker.fetch(contactRequest(validInquiry()), env), 502);
  assert.equal(delivery.mock.callCount(), 1);
});

test("stalled delivery aborts before the frontend's 20-second deadline", { timeout: 1000 }, async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let notifyStarted;
  const started = new Promise((resolve) => { notifyStarted = resolve; });
  const { env, delivery } = setup(t, (_url, { signal }) => {
    notifyStarted(signal);
    return new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
  });
  const pendingResponse = worker.fetch(contactRequest(validInquiry()), env);
  const signal = await started;
  t.mock.timers.tick(19_000);
  assert.equal(signal.aborted, true);
  await assertError(await pendingResponse, 502);
  assert.equal(delivery.mock.callCount(), 1);
});

test("valid inquiry sends one email with safe HTML and confirms acceptance", async (t) => {
  const { env, delivery } = setup(t);
  const inquiry = validInquiry({
    name: " Alice <script> ",
    email: "ALICE@EXAMPLE.TEST",
    organization: " City & Roads ",
    message: 'First line\n<b>"Second"</b>',
  });
  const response = await worker.fetch(contactRequest(inquiry), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(delivery.mock.callCount(), 1);
  const [url, options] = delivery.mock.calls[0].arguments;
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.Authorization, "Bearer test-api-key");
  const email = JSON.parse(options.body);
  assert.equal(email.from, env.CONTACT_FROM_EMAIL);
  assert.deepEqual(email.to, [env.CONTACT_TO_EMAIL]);
  assert.equal(email.reply_to, "alice@example.test");
  assert.ok(email.text.includes('First line\n<b>"Second"</b>'));
  assert.ok(email.html.includes("Alice &lt;script&gt;"));
  assert.ok(email.html.includes("City &amp; Roads"));
  assert.ok(email.html.includes("First line<br>&lt;b&gt;&quot;Second&quot;&lt;/b&gt;"));
  assert.ok(!email.html.includes("<script>"));
});

test("uses the public contact recipient when no recipient override is configured", async (t) => {
  const { env, delivery } = setup(t);
  delete env.CONTACT_TO_EMAIL;
  const response = await worker.fetch(contactRequest(validInquiry()), env);
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(delivery.mock.calls[0].arguments[1].body).to, ["contact@ramzor.io"]);
});

test("forwards non-contact requests and responses unchanged to static assets", async (t) => {
  const { env, delivery, assets, assetResponse } = setup(t);
  const request = new Request("https://example.test/assets/ramzor-logo.png?version=2");
  const response = await worker.fetch(request, env);
  assert.equal(response, assetResponse);
  assert.equal(assets.mock.callCount(), 1);
  assert.equal(assets.mock.calls[0].arguments[0], request);
  assert.equal(delivery.mock.callCount(), 0);
});
