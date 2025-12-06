import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email") || ""
    if (!email) return NextResponse.json({ exists: false })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ exists: false })
    return NextResponse.json({ exists: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company } })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
