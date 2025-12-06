"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface PublicProcurementRequest {
  id: string
  projectId: string
  contractorId: string
  item: string
  specification: string
  quantity: number
  unit: string
  deliveryLocation: string
  requestedDate: string
  status: "open" | "quoted" | "awarded"
  createdAt: string
  isPublic: boolean
  quotes: Quote[]
  selectedQuoteId?: string
}

export interface Quote {
  id: string
  procurementRequestId: string
  vendorId: string
  vendorName: string
  vendorEmail: string
  pricePerUnit: string
  totalPrice: string
  deliveryDays: number
  deliveryDate: string
  submittedAt: string
  status: "pending" | "selected" | "rejected"
  notes?: string
  recordDate?: string
  recordTime?: string
}

interface ProcurementContextType {
  procurements: PublicProcurementRequest[]
  addProcurement: (procurement: PublicProcurementRequest) => void
  getProcurement: (id: string) => PublicProcurementRequest | undefined
  addQuote: (procurementId: string, quote: Quote) => void
  getQuotes: (procurementId: string) => Quote[]
  selectQuote: (procurementId: string, quoteId: string) => Promise<void>
  awardQuote: (procurementId: string, quoteId: string) => Promise<void>
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [procurements, setProcurements] = useState<PublicProcurementRequest[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/procurements/public")
        if (res.ok) {
          const items = await res.json()
          if (Array.isArray(items)) setProcurements(items)
        }
      } catch {}
    }
    void load()
  }, [])

  const revalidate = async () => {
    try {
      const res = await fetch("/api/procurements/public")
      if (res.ok) {
        const items = await res.json()
        if (Array.isArray(items)) setProcurements(items)
      }
    } catch {}
  }

  const addProcurement = (procurement: PublicProcurementRequest) => {
    setProcurements((prev) => [procurement, ...prev])
  }

  const getProcurement = (id: string) => {
    return procurements.find((p) => p.id === id)
  }

  const addQuote = async (procurementId: string, quote: Quote) => {
    try {
      const res = await fetch(`/api/procurements/${procurementId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      })
      if (res.ok) {
        const saved = await res.json()
        setProcurements((prev) =>
          prev.map((p) => (p.id === procurementId ? { ...p, quotes: [...p.quotes, saved], status: "quoted" } : p)),
        )
        await revalidate()
        return
      }
    } catch {}
    setProcurements((prev) =>
      prev.map((p) => (p.id === procurementId ? { ...p, quotes: [...p.quotes, quote], status: "quoted" } : p)),
    )
    await revalidate()
  }

  const getQuotes = (procurementId: string) => {
    const procurement = getProcurement(procurementId)
    return procurement?.quotes || []
  }

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html }),
      })
    } catch {}
  }

  const selectQuote = async (procurementId: string, quoteId: string) => {
    const procurement = getProcurement(procurementId)
    if (!procurement) return
    const quote = procurement.quotes.find((q) => q.id === quoteId)
    if (!quote) return
    setProcurements((prev) =>
      prev.map((p) =>
        p.id === procurementId
          ? {
              ...p,
              selectedQuoteId: quoteId,
              quotes: p.quotes.map((q) => ({ ...q, status: q.id === quoteId ? "selected" : q.status })),
            }
          : p,
      ),
    )
    await revalidate()
    await sendEmail(
      quote.vendorEmail,
      "Interview Invitation",
      `<div>
        <p>Dear ${quote.vendorName},</p>
        <p>Your quote has been shortlisted for interview.</p>
        <p>Item: ${procurement.item}</p>
        <p>Total Price: ${quote.totalPrice}</p>
      </div>`,
    )
  }

  const awardQuote = async (procurementId: string, quoteId: string) => {
    const procurement = getProcurement(procurementId)
    if (!procurement) return
    const quote = procurement.quotes.find((q) => q.id === quoteId)
    if (!quote) return
    setProcurements((prev) =>
      prev.map((p) =>
        p.id === procurementId
          ? {
              ...p,
              status: "awarded",
              selectedQuoteId: quoteId,
              quotes: p.quotes.map((q) => ({ ...q, status: q.id === quoteId ? "selected" : q.status })),
            }
          : p,
      ),
    )
    await revalidate()
    await sendEmail(
      quote.vendorEmail,
      "Award of Contract",
      `<div>
        <p>Dear ${quote.vendorName},</p>
        <p>Your quote has been accepted.</p>
        <p>Item: ${procurement.item}</p>
        <p>Total Price: ${quote.totalPrice}</p>
        <p>Please proceed with delivery according to agreed terms.</p>
      </div>`,
    )
  }

  return (
    <ProcurementContext.Provider
      value={{
        procurements,
        addProcurement,
        getProcurement,
        addQuote,
        getQuotes,
        selectQuote,
        awardQuote,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  )
}

export function useProcurements() {
  const context = useContext(ProcurementContext)
  if (!context) {
    throw new Error("useProcurements must be used within ProcurementProvider")
  }
  return context
}
