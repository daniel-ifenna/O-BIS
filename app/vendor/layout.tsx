import type React from "react"
import type { Metadata } from "next"

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/icon.svg.png"

export const metadata: Metadata = {
  title: "Vendor Portal",
  icons: { icon: [{ url: "/icon.svg.png", sizes: "32x32" }], apple: "/apple-icon.png" },
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return children
}

