const fs = require("fs")
const path = require("path")
let jwt
try { jwt = require("jsonwebtoken") } catch {}

const BASE = process.env.BASE_URL || "http://localhost:3000"

function parseEnvFile(fp) {
  try {
    const txt = fs.readFileSync(fp, "utf8")
    txt.split(/\r?\n/).forEach((line) => {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (m) {
        const key = m[1]
        let val = m[2]
        if (val.startsWith("\"") && val.endsWith("\"")) val = val.slice(1, -1)
        if (!process.env[key]) process.env[key] = val
      }
    })
  } catch {}
}

async function req(method, url, opts = {}) {
  const res = await fetch(BASE + url, { method, ...opts })
  const ct = res.headers.get("content-type") || ""
  let body
  if (ct.includes("application/json")) {
    body = await res.json().catch(() => ({}))
  } else {
    body = await res.text().catch(() => "")
  }
  return { ok: res.ok, status: res.status, body, headers: res.headers }
}

function assert(cond, msg, results) {
  if (cond) { results.passed.push(msg) } else { results.failed.push(msg) }
}

async function main() {
  const results = { passed: [], failed: [], warnings: [] }
  parseEnvFile(path.join(process.cwd(), ".env.local"))
  parseEnvFile(path.join(process.cwd(), ".env"))

  const mgrEmail = `manager_${Date.now()}@example.com`
  const mgrPassword = "TestPass!23"

  const signUp = await req("POST", "/api/auth/signup", { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Manager User", email: mgrEmail, password: mgrPassword, role: "manager" }) })
  if (signUp.ok || signUp.status === 409) results.passed.push("Manager signup")
  else { results.failed.push("Manager signup"); console.error("Signup resp:", signUp.status, signUp.body) }

  const signIn = await req("POST", "/api/auth/manager/signin", { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: mgrEmail, password: mgrPassword }) })
  const token = signIn.body?.token
  if (signIn.ok && token) results.passed.push("Manager signin")
  else { results.failed.push("Manager signin"); console.error("Signin resp:", signIn.status, signIn.body) }

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const proj = await req("POST", "/api/projects", { headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify({ title: `E2E Project ${Date.now()}`, location: "Test City", budget: "1500000", status: "Published", bids: 0 }) })
  const projectId = proj.body?.id
  assert(proj.ok && projectId, "Project created", results)
  if (!(proj.ok && projectId)) console.error("Project resp:", proj.status, proj.body)

  const bid = await req("POST", `/api/projects/${projectId}/bids`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bidderName: "Alpha Co", companyName: "Alpha Construction Ltd", email: `contractor_${Date.now()}@example.com`, amount: "1200000", duration: 30 }) })
  const bidId = bid.body?.id
  assert(bid.ok && bidId, "Bid created", results)
  if (!(bid.ok && bidId)) console.error("Bid resp:", bid.status, bid.body)

  const now = new Date()
  const date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`
  const time = `${String(now.getUTCHours()).padStart(2, "0")}:${String((now.getUTCMinutes() + 10) % 60).padStart(2, "0")}`
  const invitePayload = {
    meetingTitle: "Bid Review Meeting",
    date,
    time,
    googleMeetLink: "https://meet.google.com/abc-defg-hij",
    message: "Please come prepared to discuss your proposal.",
    attendees: ["observer1@example.com", "observer2@example.com"],
    timeZone: "Africa/Lagos",
    ownerName: "Mgr Name",
  }
  const invite = await req("POST", `/api/bids/${bidId}/invite-meeting`, { headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify(invitePayload) })
  assert(invite.ok && invite.body?.ok, "Meeting invite sent", results)
  if (!(invite.ok && invite.body?.ok)) console.error("Invite resp:", invite.status, invite.body)

  const history = await req("GET", `/api/bids/${bidId}/invite-meeting`, { headers: { ...authHeaders } })
  if (history.ok && Array.isArray(history.body) && history.body.length > 0) results.passed.push("Invite history recorded")
  else results.warnings.push("Invite history not recorded or empty")

  const award = await req("POST", `/api/bids/${bidId}/award`, { headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify({ ownerName: "Mgr Name" }) })
  assert(award.ok && award.body?.ok, "Award processed", results)
  if (!(award.ok && award.body?.ok)) console.error("Award resp:", award.status, award.body)

  console.log("\n=== Manager E2E Summary ===")
  console.log("Passed:", results.passed.length)
  results.passed.forEach((p) => console.log("✔", p))
  console.log("\nFailed:", results.failed.length)
  results.failed.forEach((f) => console.log("✖", f))
  console.log("\nWarnings:", results.warnings.length)
  results.warnings.forEach((w) => console.log("!", w))

  if (results.failed.length > 0) process.exit(1)
}

main().catch((e) => { console.error("Manager E2E runner error", e); process.exit(1) })
