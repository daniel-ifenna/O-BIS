import { prisma } from "@/lib/db"
import { encryptAccountNumber } from "@/lib/security/bank"
import { createFirebaseStorageFromEnv } from "@/lib/storage"

export async function processPaymentRequest(request: Request, payload: { sub: string; role: "contractor" | "vendor" }) {
  const ct = request.headers.get("content-type") || ""
  let data: any = {}
  let proofUrl = ""
  let proofMeta: any = {}
  if (ct.includes("multipart/form-data")) {
    const form = await request.formData()
    data = {
      projectId: form.get("projectId")?.toString(),
      amount: form.get("amount")?.toString(),
      bankName: form.get("bankName")?.toString(),
      branch: form.get("branch")?.toString(),
      accountType: form.get("accountType")?.toString(),
      accountNumber: form.get("accountNumber")?.toString(),
    }
    const file = form.get("proof") as File | null
    if (file) {
      const storage = createFirebaseStorageFromEnv()
      const buffer = Buffer.from(await file.arrayBuffer())
      const up = await storage.uploadBuffer(buffer, {
        category: "proof-of-delivery",
        filename: file.name || "proof",
        contentType: file.type || "application/octet-stream",
        projectId: data.projectId,
        userId: payload.sub,
      })
      proofUrl = up.publicUrl || up.mediaLink || storage.getPublicUrl(up.path)
      proofMeta = { path: up.path, contentType: up.contentType, size: up.size }
    }
  } else {
    data = await request.json().catch(() => ({}))
    proofUrl = data.proofUrl || ""
    if (!proofUrl && typeof data.proofDataUrl === "string") {
      const storage = createFirebaseStorageFromEnv()
      const b64 = data.proofDataUrl.split(",")[1]
      const buffer = Buffer.from(b64, "base64")
      const up = await storage.uploadBuffer(buffer, {
        category: "proof-of-delivery",
        filename: data.proofFilename || "proof",
        contentType: data.proofContentType || "application/octet-stream",
        projectId: data.projectId,
        userId: payload.sub,
      })
      proofUrl = up.publicUrl || up.mediaLink || storage.getPublicUrl(up.path)
      proofMeta = { path: up.path, contentType: up.contentType, size: up.size }
    }
  }

  if (!data.amount || Number(data.amount) <= 0) throw new Error("Invalid amount")
  for (const k of ["bankName", "branch", "accountType", "accountNumber"]) {
    if (!data[k]) throw new Error(`Missing ${k}`)
  }
  if (!proofUrl) throw new Error("Proof of delivery is required")

  const encAcc = encryptAccountNumber(String(data.accountNumber))
  const now = new Date()
  const y = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const h = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  const recordDate = `${y}-${mm}-${d}`
  const recordTime = `${h}:${min}`
  const created = await prisma.paymentRequest.create({
    data: {
      userId: payload.sub,
      userType: payload.role as any,
      projectId: data.projectId || null,
      amount: data.amount,
      bankName: data.bankName,
      branch: data.branch,
      accountType: data.accountType,
      accountNumberEnc: encAcc,
      proofUrl,
      proofPath: proofMeta.path,
      proofContentType: proofMeta.contentType,
      proofSize: proofMeta.size,
      recordDate,
      recordTime,
    },
  })
  return created
}

export async function calculateWalletBalance(userId: string) {
  const [creditsAgg, debitsAgg] = await Promise.all([
    prisma.escrowWalletTransaction.aggregate({ where: { userId, type: { in: ["received", "refunded"] as any } }, _sum: { amount: true } }),
    prisma.escrowWalletTransaction.aggregate({ where: { userId, type: { in: ["requested", "withdrawn"] as any } }, _sum: { amount: true } }),
  ])
  const credits = Number(creditsAgg._sum.amount || 0)
  const debits = Number(debitsAgg._sum.amount || 0)
  return credits - debits
}
