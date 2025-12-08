const fs = require("fs")
const path = require("path")
let jwt
try { jwt = require("jsonwebtoken") } catch {}

const BASE = process.env.BASE_URL || "http://localhost:3000"

async function req(method, url, opts = {}) {
  const res = await fetch(BASE + url, { method, ...opts })
  const ct = res.headers.get("content-type") || ""
  let body
  if (ct.includes("application/json")) {
    body = await res.json().catch(() => ({}))
  } else {
    body = await res.text().catch(() => "")
  }
  return { ok: res.ok, status: res.status, body }
}

function assert(cond, msg, results) {
  if (cond) { 
    results.passed.push(msg) 
  } else { 
    results.failed.push(msg)
    console.error(`FAIL: ${msg}`)
  }
}

async function main() {
  console.log("=== Verifying Bid Uploads ===")
  const results = { passed: [], failed: [] }

  // 1. Create a Manager Token (Mocking one for local dev/test env if JWT_SECRET available)
  // In a real env we might need to login. Assuming dev env has JWT_SECRET or we can simulate.
  // We'll try to rely on the fact that we can hit the API if we have a valid token.
  // If not, we might need to create a user first.
  
  // Let's create a temp user/manager to be safe
  const mgrEmail = `mgr_${Date.now()}@test.com`
  const mgrPass = "password123"
  
  console.log("Creating Manager...")
  const mgrRes = await req("POST", "/api/auth/manager/signup", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Manager",
      company: "Test Corp",
      email: mgrEmail,
      password: mgrPass,
      role: "manager"
    })
  })
  
  if (!mgrRes.ok) {
    console.error("Failed to create manager", mgrRes.body)
    process.exit(1)
  }
  
  // Login to get token
  const loginRes = await req("POST", "/api/auth/signin", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mgrEmail, password: mgrPass })
  })
  
  if (!loginRes.ok) {
    console.error("Failed to login manager", loginRes.body)
    process.exit(1)
  }
  
  const token = loginRes.body.token
  const authHeader = { Authorization: `Bearer ${token}` }
  
  // 2. Create a Project
  console.log("Creating Project...")
  const projRes = await req("POST", "/api/projects", {
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify({
      title: "Upload Verification Project",
      location: "Lagos",
      budget: 1000000,
      status: "Published",
      description: "Test project for file uploads"
    })
  })
  
  if (!projRes.ok) {
    console.error("Failed to create project", projRes.body)
    process.exit(1)
  }
  
  const projectId = projRes.body.id
  assert(projectId, "Project created successfully", results)

  // 3. Submit a Bid with Uploads (Public/Contractor)
  // We don't strictly need a contractor account if the API allows it (it checks contractorId but handles public/null).
  // However, the route logic: if (body.contractorId ...). 
  // Let's assume we can submit as a guest or just provide basic details.
  
  console.log("Submitting Bid with Files...")
  const mockPdf = "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogCjw8CiAgL1R5cGUgL1BhZ2VzCiAgL01lZGlhQm94IFsgMCAwIDIwMCAyMDAgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKCjMgMCBvYmogCjw8CiAgL1R5cGUgL1BhZ2XQogIC9QYXJlbnQgMiAwIFIKICAvUmVzb3VyY2VzIDw8CiAgICAvRm9udCA8PAogICAgICAvRjEgNCAwIFIKICAgID4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTEKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKCjUgMCBvYmogCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNDQgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQzCiUlRU9GCg=="
  
  const bidRes = await req("POST", `/api/projects/${projectId}/bids`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bidderName: "Test Bidder",
      companyName: "Test Upload Co",
      email: "bidder@test.com",
      phone: "1234567890",
      amount: "500000",
      duration: 10,
      uploads: {
        proposal: [mockPdf],
        profile: [mockPdf]
      }
    })
  })
  
  if (!bidRes.ok) {
    console.error("Failed to submit bid", bidRes.body)
    process.exit(1)
  }
  
  const bidId = bidRes.body.id
  assert(bidId, "Bid submitted successfully", results)
  
  // 4. Verify Uploads in Manager View API
  console.log("Verifying Uploads in Manager API...")
  const viewRes = await req("GET", `/api/projects/${projectId}/bids`, {
    headers: { ...authHeader }
  })
  
  if (!viewRes.ok) {
    console.error("Failed to fetch bids for manager", viewRes.body)
    process.exit(1)
  }
  
  const bids = viewRes.body
  const myBid = bids.find(b => b.id === bidId)
  
  assert(myBid, "Bid found in manager list", results)
  
  if (myBid) {
    console.log("DEBUG: Bid Files:", JSON.stringify(myBid.files, null, 2))
    console.log("DEBUG: Bid Uploads:", JSON.stringify(myBid.uploads, null, 2))

    // Check uploads structure
    const uploads = myBid.uploads
    assert(uploads, "Uploads object present in bid", results)
    assert(uploads.proposal && uploads.proposal.length > 0, "Proposal document found", results)
    assert(uploads.profile && uploads.profile.length > 0, "Profile document found", results)
    
    // Check if URL is valid (should be the data URI or a storage URL)
    const propUrl = uploads.proposal[0]
    const profUrl = uploads.profile[0]
    
    console.log("Proposal URL:", propUrl.substring(0, 50) + "...")
    assert(propUrl.length > 0, "Proposal URL is not empty", results)
  }

  console.log("\n=== Report ===")
  console.log(`Passed: ${results.passed.length}`)
  console.log(`Failed: ${results.failed.length}`)
  if (results.failed.length > 0) process.exit(1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
