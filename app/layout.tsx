import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ProjectProvider } from "@/lib/project-context"
import { AuthProvider } from "@/lib/auth-context"
import { ProcurementProvider } from "@/lib/procurement-context"
import { ComplaintProvider } from "@/lib/complaint-context"
import { PaymentProvider } from "@/lib/payment-context"
import { BidProvider } from "@/lib/bid-context"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/icon.sg.png"

export const metadata: Metadata = {
  title: {
    default: "O-BIS | Construction Intelligence",
    template: "O-BIS:  %s",
  },
  applicationName: "O-BIS",
  description: "End-to-end construction and procurement management platform",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon.sg.png", sizes: "64x64" },
      { url: "/icon.svg.png", sizes: "64x64" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ProjectProvider>
            <ProcurementProvider>
              <BidProvider>
                <PaymentProvider>
                  <ComplaintProvider>
                    {children}
                    <Toaster />
                  </ComplaintProvider>
                </PaymentProvider>
              </BidProvider>
            </ProcurementProvider>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
