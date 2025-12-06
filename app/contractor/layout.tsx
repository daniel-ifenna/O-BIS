import type React from "react"
import type { Metadata } from "next"

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/icon.svg.png"

export const metadata: Metadata = {
  title: "Contractor Portal",
  icons: { icon: [{ url: "/icon-light-32x32.png", sizes: "32x32" }], apple: "/apple-icon.png" },
}

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return children
}
