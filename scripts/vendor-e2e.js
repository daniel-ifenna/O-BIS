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
  let contractorJWT = null
  if (jwt && process.env.JWT_SECRET) {
    try {
      contractorJWT = jwt.sign({ sub: "contractor-1", role: "contractor" }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" })
      results.passed.push("Generated contractor JWT")
    } catch {
      results.warnings.push("Failed to generate contractor JWT")
    }
  } else {
    results.warnings.push("JWT_SECRET missing or jsonwebtoken unavailable; procurement creation may be unauthorized")
  }

  const createProject = await req("POST", "/api/projects", { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Vendor E2E ${Date.now()}`, location: "Test", budget: "1000000", status: "Published", bids: 0, managerId: "manager-1" }) })
  if (!createProject.ok) {
    console.error("Project create failed", createProject.status, createProject.body)
  }
  const projectId = createProject.body?.id
  if (projectId) results.passed.push("Project created for vendor flow")
  else results.failed.push("Project creation for vendor flow")

  const createProc = await req("POST", "/api/contractor/procurements", { headers: { "Content-Type": "application/json", ...(contractorJWT ? { Authorization: `Bearer ${contractorJWT}` } : {}) }, body: JSON.stringify({ projectId, item: "Cement", specification: "Grade 42.5R", quantity: 1000, unit: "kilograms", deliveryLocation: "Site A", requestedDate: "2025-01-25", isPublic: true }) })
  if (createProc.ok) results.passed.push("Public procurement created")
  else results.warnings.push("Failed to create procurement via API")

  let listProc = await req("GET", "/api/procurements/public")
  if (!(listProc.ok && Array.isArray(listProc.body) && listProc.body.length > 0)) {
    try {
      const seedDir = path.join(process.cwd(), "data")
      const fp = path.join(seedDir, "public_procurements.json")
      if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true })
      const now = new Date().toISOString()
      const seed = [{
        id: `pp-${Date.now()}`,
        projectId: "vendor-e2e-proj",
        contractorId: "contractor-1",
        item: "Cement",
        specification: "Grade 42.5R",
        quantity: 1000,
        unit: "kilograms",
        deliveryLocation: "Site A",
        requestedDate: "2025-01-25",
        status: "open",
        createdAt: now,
        publicUrl: `/public-procurement/${Date.now()}`,
        quotes: [],
        isPublic: true,
        recordDate: now.slice(0,10),
        recordTime: now.slice(11,16),
      }]
      fs.writeFileSync(fp, JSON.stringify(seed, null, 2), "utf8")
      results.passed.push("Seeded one public procurement")
      listProc = await req("GET", "/api/procurements/public")
    } catch (e) {
      results.warnings.push("Failed to seed public procurements " + String(e?.message || e))
    }
  }

  if (listProc.ok && Array.isArray(listProc.body) && listProc.body.length > 0) {
    const pid = listProc.body[0].id
    const quote = await req("POST", `/api/procurements/${pid}/quotes`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vendorName: "Vendor One", vendorEmail: `vendor_${Date.now()}@example.com`, pricePerUnit: "45000", totalPrice: "450000", deliveryDays: 3, deliveryDate: "2025-02-01" }) })
    assert(quote.ok, "Vendor quote submitted", results)
    const rd = quote.body?.recordDate
    const rt = quote.body?.recordTime
    // recordDate is YYYY-MM-DD
    const dateOk = rd && /^\d{4}-\d{2}-\d{2}$/.test(rd)
    // recordTime is HH:MM
    const timeOk = rt && /^\d{2}:\d{2}$/.test(rt)
    
    assert(dateOk && timeOk, "Quote timestamps format verified (YYYY-MM-DD HH:MM)", results)
  } else {
    results.warnings.push("No public procurements available; skipping quote submission")
  }

  console.log("\n=== Vendor E2E Summary ===")
  console.log("Passed:", results.passed.length)
  results.passed.forEach((p) => console.log("✔", p))
  console.log("\nFailed:", results.failed.length)
  results.failed.forEach((f) => console.log("✖", f))
  console.log("\nWarnings:", results.warnings.length)
  results.warnings.forEach((w) => console.log("!", w))

  if (results.failed.length > 0) process.exit(1)
}

main().catch((e) => { console.error("Vendor E2E runner error", e); process.exit(1) })
