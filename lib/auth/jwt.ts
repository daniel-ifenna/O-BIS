import jwt from "jsonwebtoken"

type Payload = { sub: string; role: "manager" | "contractor" | "vendor" }

export function signToken(payload: Payload, expiresIn: string = process.env.JWT_EXPIRES_IN || "1h") {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) throw new Error("Missing JWT_SECRET")
  return jwt.sign(payload, secret as jwt.Secret, { algorithm: "HS256", expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): Payload | null {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) throw new Error("Missing JWT_SECRET")
  try {
    return jwt.verify(token, secret) as Payload
  } catch {
    return null
  }
}
