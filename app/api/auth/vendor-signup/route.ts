import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { emailService } from "@/lib/email-service"
import { issueVerificationToken } from "@/lib/auth/reset"
import { findUserByEmail, createUser, createRoleProfile, sanitizeUser, createVendorProfile } from "@/lib/file-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      businessReg,
      contact,
      email,
      password,
      phone,
      address,
      city,
      state,
      categories,
      certifications,
      bio,
    } = body

    if (!companyName || !email || !password || !phone || !contact) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const hasDb = Boolean(process.env.DATABASE_URL_PGBOUNCER || process.env.DATABASE_URL)

    if (hasDb) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

        const passwordHash = await hashPassword(password)
        const now = new Date()
        const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
        const recordTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: contact, // Using contact person name as user name
              email,
              role: "vendor",
              company: companyName,
              passwordHash,
              recordDate,
              recordTime,
            },
          })

          const vendor = await tx.vendor.create({
            data: {
              userId: user.id,
              company: companyName,
              recordDate,
              recordTime,
              // Note: Additional vendor fields like businessReg, address etc are not in standard Vendor schema
              // We might need to store them in a JSON field or extended table if schema supports it.
              // For now, adhering to schema.prisma: Vendor has { id, userId, company }
            },
          })
          return user
        })

        // Send verification email
        try {
          const { token } = await issueVerificationToken(result.id)
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${new URL(request.url).origin}`
          const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(token)}`
          await emailService.sendVerificationEmail(result.email, result.name, verifyUrl)
        } catch (e) {
          console.warn("Failed to send verification email:", e)
        }

        return NextResponse.json({ id: result.id, email: result.email, role: "vendor" }, { status: 201 })
      } catch (dbError) {
        console.error("DB Signup Error:", dbError)
        // Fallback to file-db if DB fails? Usually risky to mix. 
        // Better to fail if DB is expected but errors out.
        // However, matching signup route pattern:
        throw dbError
      }
    } else {
      // File DB Fallback
      const existing = await findUserByEmail(email)
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

      const passwordHash = await hashPassword(password)
      const createdUser = await createUser({
        name: contact,
        email,
        role: "vendor",
        company: companyName,
        passwordHash,
      })

      // Also create the detailed vendor profile in file-db
      const vendorProfile = {
        id: `vendor-${Date.now()}`,
        userId: createdUser.id,
        email,
        companyName,
        businessRegistration: businessReg || "",
        phone,
        address: address || "",
        city: city || "",
        state: state || "",
        categories: (categories || "").split(",").map((c: string) => c.trim()).filter(Boolean),
        certifications: (certifications || "").split(",").map((c: string) => c.trim()).filter(Boolean),
        rating: 0,
        completedDeliveries: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: {},
        contact,
        bio: bio || "",
      }
      await createVendorProfile(vendorProfile)
      
      return NextResponse.json({ id: createdUser.id, email: createdUser.email, role: "vendor" }, { status: 201 })
    }
  } catch (error) {
    console.error("Vendor Signup Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
