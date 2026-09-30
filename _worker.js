const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });
const clean = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

async function handleContact(request, env) {
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const missingConfiguration = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL"].filter((name) => !env[name]);
  if (missingConfiguration.length) return reply({ error: "Contact service is not configured.", missing: missingConfiguration }, 503);
  if (Number(request.headers.get("content-length") || 0) > 12_000) return reply({ error: "Request is too large." }, 413);

  let input;
  try { input = await request.json(); } catch { return reply({ error: "Invalid request." }, 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return reply({ error: "Invalid request." }, 400);
  if (clean(input.website, 200)) return reply({ ok: true });

  const name = clean(input.name, 80);
  const email = clean(input.email, 160).toLowerCase();
  const organization = clean(input.organization, 120);
  const city = clean(input.city, 100);
  const message = clean(input.message, 1000);
  const startedAt = Number(input.startedAt);
  const elapsed = Date.now() - startedAt;
  if (!name || !organization || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: "Please provide valid contact details." }, 400);
  if (!Number.isFinite(startedAt) || elapsed < 2_000 || elapsed > 7_200_000) return reply({ error: "Please refresh the page and try again." }, 400);

  const safe = {
    name: escapeHtml(name), email: escapeHtml(email), organization: escapeHtml(organization),
    city: escapeHtml(city || "Not provided"), message: escapeHtml(message || "Not provided").replace(/\n/g, "<br>"),
  };
  const controller = new AbortController();
  const deliveryTimeout = setTimeout(() => controller.abort(), 15_000);
  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL || "contact@ramzor.io"],
        reply_to: email,
        subject: `Junction inquiry${city ? ` — ${city}` : ""}`,
        text: ["New ramzor.io website inquiry", "", `Name: ${name}`, `Email: ${email}`, `Organization: ${organization}`, `City: ${city || "Not provided"}`, "", "Message:", message || "Not provided"].join("\n"),
        html: `<h2>New ramzor.io website inquiry</h2><p><strong>Name:</strong> ${safe.name}<br><strong>Email:</strong> ${safe.email}<br><strong>Organization:</strong> ${safe.organization}<br><strong>City:</strong> ${safe.city}</p><p><strong>What they want to understand or improve:</strong><br>${safe.message}</p>`,
      }),
    });
  } catch {
    return reply({ error: "Email delivery failed." }, 502);
  } finally {
    clearTimeout(deliveryTimeout);
  }
  if (!response.ok) return reply({ error: "Email delivery failed." }, 502);
  return reply({ ok: true });
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === "/api/contact") return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};
