import { type NextRequest, NextResponse } from "next/server"
import { createVendorProfile } from "@/lib/file-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      businessReg,
      contact,
      email,
      phone,
      address,
      city,
      state,
      categories,
      certifications,
      bio,
    } = body

    if (!companyName || !email || !phone || !contact) {
      return NextResponse.json({ error: "companyName, email, phone, and contact are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const vendorProfile = {
      id: `vendor-${Date.now()}`,
      userId: `user-${Date.now()}`,
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
    const saved = await createVendorProfile(vendorProfile)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
