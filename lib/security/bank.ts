import crypto from "crypto"

const ALGO = "aes-256-gcm"

function getKey() {
  const keyB64 = process.env.PAYMENT_ENCRYPTION_KEY || ""
  if (!keyB64) throw new Error("Missing PAYMENT_ENCRYPTION_KEY")
  const key = Buffer.from(keyB64, "base64")
  if (key.length !== 32) throw new Error("PAYMENT_ENCRYPTION_KEY must be 32 bytes base64")
  return key
}

export function encryptAccountNumber(accountNumber: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(accountNumber, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString("base64")
}

export function decryptAccountNumber(encB64: string): string {
  const key = getKey()
  const buf = Buffer.from(encB64, "base64")
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString("utf8")
}

export function maskAccountNumber(encB64: string): string {
  try {
    const dec = decryptAccountNumber(encB64)
    const last4 = dec.slice(-4)
    return `**** **** **** ${last4}`
  } catch {
    return "**** **** **** ****"
  }
}
