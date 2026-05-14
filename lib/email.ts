import { appUrl } from "@/lib/stripe";

// Email sending via Resend. In dev (or when RESEND_API_KEY is missing) we
// log the email to the server console instead of failing — so the rest of
// the system can be exercised before Resend is wired up.

type Grant = { token: string; productName: string };

export async function sendReceiptEmail(opts: {
  to: string;
  orderId: number;
  grants: Grant[];
}): Promise<void> {
  const subject = `Your NextGen Diesel order #${opts.orderId}`;
  const html = renderReceiptHtml(opts);
  const text = renderReceiptText(opts);
  await send({ to: opts.to, subject, html, text });
}

export async function sendDownloadLinksEmail(opts: {
  to: string;
  orders: Array<{
    orderId: number;
    placedAt: Date;
    grants: Grant[];
  }>;
}): Promise<void> {
  const subject = `Your NextGen Diesel downloads`;
  const html = renderResendHtml(opts);
  const text = renderResendText(opts);
  await send({ to: opts.to, subject, html, text });
}

export async function sendAdminMagicLink(opts: {
  to: string;
  url: string;
}): Promise<void> {
  const subject = `Sign in to NextGen Diesel admin`;
  const html = `
    <!doctype html>
    <html><body style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0c1224">
      <h1 style="margin:0 0 16px;font-size:24px">Sign in</h1>
      <p>Click the button below to sign in to the NextGen Diesel admin. The link expires in 15 minutes.</p>
      <p style="margin:24px 0">
        <a href="${opts.url}" style="display:inline-block;background:#ff6a1a;color:white;padding:12px 20px;border-radius:8px;font-weight:bold;text-decoration:none">Sign in</a>
      </p>
      <p style="font-size:12px;color:#6b7280">Or paste this URL into your browser:<br><span style="word-break:break-all">${opts.url}</span></p>
      <p style="font-size:12px;color:#6b7280">If you didn't request this link, ignore this email.</p>
    </body></html>
  `;
  await send({
    to: opts.to,
    subject,
    html,
    text: `Sign in to NextGen Diesel admin: ${opts.url}\n\nThis link expires in 15 minutes. If you didn't request it, ignore this email.`,
  });
}

// ─── internals ────────────────────────────────────────────────────────────────

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY or RESEND_FROM_EMAIL missing — printing to console instead of sending.`,
    );
    console.log("─── EMAIL ───");
    console.log(`To:      ${opts.to}`);
    console.log(`Subject: ${opts.subject}`);
    console.log(`Body:\n${opts.text}`);
    console.log("─────────────");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

function downloadHref(token: string): string {
  return `${appUrl()}/api/download/${token}`;
}

function renderReceiptHtml(opts: {
  orderId: number;
  grants: Grant[];
}): string {
  const items = opts.grants
    .map(
      (g) => `
      <li style="margin:12px 0">
        <div style="font-weight:bold">${escapeHtml(g.productName)}</div>
        <a href="${downloadHref(g.token)}" style="display:inline-block;margin-top:6px;background:#ff6a1a;color:white;padding:10px 16px;border-radius:8px;font-weight:bold;text-decoration:none">Download</a>
      </li>`,
    )
    .join("");
  return `
    <!doctype html>
    <html><body style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;color:#0c1224">
      <h1 style="margin:0 0 8px;font-size:24px">Thanks for your order!</h1>
      <p style="color:#4a5260;margin:0 0 24px">Order #${opts.orderId}</p>
      <p>Your tuning file${opts.grants.length === 1 ? " is" : "s are"} ready. Click the button${opts.grants.length === 1 ? "" : "s"} below to download.</p>
      <ul style="list-style:none;padding:0">${items}</ul>
      <p style="font-size:12px;color:#6b7280;margin-top:32px">Keep this email — these links are permanent. Lost it? Visit <a href="${appUrl()}/downloads">your downloads page</a> and we'll resend.</p>
    </body></html>
  `;
}

function renderReceiptText(opts: {
  orderId: number;
  grants: Grant[];
}): string {
  const lines = [
    `Thanks for your order! Order #${opts.orderId}`,
    "",
    "Your downloads:",
    ...opts.grants.map((g) => `  • ${g.productName}\n    ${downloadHref(g.token)}`),
    "",
    `Lost the email? Visit ${appUrl()}/downloads to have us resend.`,
  ];
  return lines.join("\n");
}

function renderResendHtml(opts: {
  orders: Array<{ orderId: number; placedAt: Date; grants: Grant[] }>;
}): string {
  const sections = opts.orders
    .map(
      (o) => `
      <section style="margin:24px 0;padding:16px;border:1px solid #e3e7ee;border-radius:12px">
        <div style="color:#6b7280;font-size:12px">Order #${o.orderId} · ${o.placedAt.toLocaleDateString()}</div>
        <ul style="list-style:none;padding:0;margin:12px 0 0">
          ${o.grants
            .map(
              (g) => `
            <li style="margin:8px 0">
              <div style="font-weight:bold">${escapeHtml(g.productName)}</div>
              <a href="${downloadHref(g.token)}" style="display:inline-block;margin-top:6px;background:#ff6a1a;color:white;padding:10px 16px;border-radius:8px;font-weight:bold;text-decoration:none">Download</a>
            </li>`,
            )
            .join("")}
        </ul>
      </section>`,
    )
    .join("");
  return `
    <!doctype html>
    <html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0c1224">
      <h1 style="margin:0 0 8px;font-size:24px">Your downloads</h1>
      <p>Fresh links to every tuning file you've purchased.</p>
      ${sections}
    </body></html>
  `;
}

function renderResendText(opts: {
  orders: Array<{ orderId: number; placedAt: Date; grants: Grant[] }>;
}): string {
  const lines: string[] = ["Your downloads:", ""];
  for (const o of opts.orders) {
    lines.push(`Order #${o.orderId} (${o.placedAt.toLocaleDateString()})`);
    for (const g of o.grants) {
      lines.push(`  • ${g.productName}`);
      lines.push(`    ${downloadHref(g.token)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
