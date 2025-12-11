"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import type { Bid } from "@/lib/database-schema"
import { useProjects } from "@/lib/project-context"

interface BidContextType {
  bids: Bid[]
  getBidsByProject: (projectId: string | number) => Bid[]
  submitBid: (
    projectId: string | number,
    bid: Omit<Bid, "id" | "projectId" | "status" | "submittedAt">,
  ) => Promise<{ ok: boolean; created?: Bid; error?: string }>
  shortlistBid: (projectId: string | number, bidId: string) => Promise<void>
  awardBid: (projectId: string | number, bidId: string) => Promise<void>
  isLoaded?: boolean
  getAllBids: () => Bid[]
  getPendingBids: () => Bid[]
  getBid: (id: string) => Bid | undefined
  updateBid: (id: string, updates: Partial<Bid>) => Bid | undefined
  updateBidStatus: (
    id: string,
    status: Bid["status"],
    reviewedBy: string,
    reviewNotes?: string,
  ) => Promise<{ ok: boolean; updated?: Bid; error?: string }>
  deleteBid: (id: string) => void
  logBidAction: (bidId: string, action: "submitted" | "shortlisted" | "rejected" | "invited" | "awarded", notes?: string) => void
  getEventsByProject: (projectId: string | number) => BidEvent[]
}

type BidEvent = {
  id: string
  bidId: string
  projectId: string | number
  action: "submitted" | "shortlisted" | "rejected" | "invited" | "awarded"
  actorRole?: string
  actorId?: string
  timestamp: string
  notes?: string
}

const BidContext = createContext<BidContextType | undefined>(undefined)

export function BidProvider({ children }: { children: ReactNode }) {
  const [bids, setBids] = useState<Bid[]>([])
  const { setProjectStatus, incrementBidCount, projects, updateProject } = useProjects()
  const [isLoaded, setIsLoaded] = useState(false)
  const [events, setEvents] = useState<BidEvent[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("token") || localStorage.getItem("managerToken") || localStorage.getItem("contractorToken") || "")) || ""
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch("/api/bids", { headers })
        if (res.ok) {
          const items = await res.json()
          if (Array.isArray(items)) setBids(items)
        }
      } catch {
        try {
          const saved = localStorage.getItem("bids")
          if (saved) {
            const data = JSON.parse(saved)
            if (Array.isArray(data)) setBids(data)
          }
        } catch {}
        try {
          const evSaved = localStorage.getItem("bid_events")
          if (evSaved) {
            const ev = JSON.parse(evSaved)
            if (Array.isArray(ev)) setEvents(ev)
          }
        } catch {}
      } finally {
        setIsLoaded(true)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("bids", JSON.stringify(bids))
    } catch {}
  }, [bids])

  useEffect(() => {
    try {
      localStorage.setItem("bid_events", JSON.stringify(events))
    } catch {}
  }, [events])

  // Reconcile legacy bids whose projectId stored as project title instead of ID
  useEffect(() => {
    if (!isLoaded) return
    setBids((prev) => {
      let changed = false
      const next = prev.map((b) => {
        const byId = projects.find((p) => String(p.id) === String(b.projectId))
        if (byId) return b
        const key = String(b.projectId).toLowerCase()
        const byTitle = projects.find((p) => p.title && p.title.toLowerCase() === key)
        if (byTitle) {
          changed = true
          return { ...b, projectId: String(byTitle.id) }
        }
        return b
      })
      return changed ? next : prev
    })
  }, [isLoaded, projects])

  const getBidsByProject = (projectId: string | number) => bids.filter((b) => String(b.projectId) === String(projectId))

  const getEventsByProject = (projectId: string | number) =>
    events
      .filter((e) => String(e.projectId) === String(projectId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getAllBids = () => bids

  const getPendingBids = () => bids.filter((b) => b.status === "New")

  const getBid = (id: string) => bids.find((b) => b.id === id)

  const updateBid = (id: string, updates: Partial<Bid>) => {
    let updated: Bid | undefined
    setBids((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          updated = { ...b, ...updates }
          return updated
        }
        return b
      }),
    )
    return updated
  }

  const updateBidStatus = async (
    id: string,
    status: Bid["status"],
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<{ ok: boolean; updated?: Bid; error?: string }> => {
    const optimistic = () => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, "0")
      const d = String(now.getDate()).padStart(2, "0")
      const h = String(now.getHours()).padStart(2, "0")
      const min = String(now.getMinutes()).padStart(2, "0")
      const updated = updateBid(id, { status, reviewedAt: now.toISOString(), recordDate: `${y}-${m}-${d}`, recordTime: `${h}:${min}` } as any)
      return updated
    }
    try {
      const res = await fetch(`/api/bids/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBids((prev) => {
          let projectId: string | number | null = null
          const next = prev.map((b) => {
            if (b.id === id) { projectId = b.projectId; return updated }
            if (status === "Accepted" && projectId !== null && String(b.projectId) === String(projectId)) {
              return { ...b, status: "Rejected" as any }
            }
            return b
          })
          if (status === "Accepted" && projectId !== null) {
            setProjectStatus(projectId, "Active")
          }
          return next
        })
        return { ok: true, updated }
      }
      const msg = await res.json().catch(() => ({}))
      // Only fallback to local for "Reviewed" to avoid desync on decision errors
      if (status === "Reviewed") {
        const u = optimistic()
        return { ok: false, updated: u, error: msg?.error || "Failed to update status" }
      }
      if (status === "Accepted") {
        setProjectStatus(optimistic()?.projectId || id, "Active")
      }
      return { ok: false, error: msg?.error || "Failed to update status" }
    } catch {
      if (status === "Reviewed") {
        const u = optimistic()
        return { ok: false, updated: u, error: "Network error" }
      }
      if (status === "Accepted") {
        setProjectStatus(optimistic()?.projectId || id, "Active")
      }
      return { ok: false, error: "Network error" }
    }
  }

  const deleteBid = (id: string) => {
    setBids((prev) => prev.filter((b) => b.id !== id))
  }

  const submitBid = async (
    projectId: string | number,
    bid: Omit<Bid, "id" | "projectId" | "status" | "submittedAt">,
  ) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bid),
      })
      if (res.ok) {
        const created = await res.json()
        setBids((prev) => [created, ...prev])
        incrementBidCount(projectId, 1)
        setEvents((prev) => [
          { id: `evt-${Date.now()}`, bidId: created.id, projectId: created.projectId, action: "submitted", timestamp: new Date().toISOString() },
          ...prev,
        ])
        try {
          const p = projects.find((p) => String(p.id) === String(projectId))
          toast({ title: "New bid submitted", description: `${created.companyName} • ${(p?.title || `Project ${projectId}`)}` })
        } catch {}
        return { ok: true, created }
      }
      const msg = await res.json().catch(() => ({}))
      return { ok: false, error: msg?.error || "Failed to submit bid" }
    } catch {}
    return { ok: false, error: "Network error" }
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

  const formatNairaAmount = (value: any) => {
    const num = Number(String(value).replace(/[^0-9.]/g, "")) || 0
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(num)
    } catch {
      return `₦${num.toLocaleString("en-NG")}`
    }
  }

  const shortlistBid = async (projectId: string | number, bidId: string) => {
    const countShortlisted = bids.filter((b) => String(b.projectId) === String(projectId) && b.status === "Reviewed").length
    if (countShortlisted >= 5) return
    const existing = bids.find((b) => b.id === bidId)
    if (existing && existing.status === "Reviewed") return
    try {
      const res = await fetch(`/api/bids/${bidId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Reviewed" }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBids((prev) => prev.map((b) => (b.id === bidId ? updated : b)))
      } else {
        setBids((prev) =>
          prev.map((b) => {
            if (b.id === bidId) {
              const now = new Date()
              const y = now.getFullYear()
              const m = String(now.getMonth() + 1).padStart(2, "0")
              const d = String(now.getDate()).padStart(2, "0")
              const h = String(now.getHours()).padStart(2, "0")
              const min = String(now.getMinutes()).padStart(2, "0")
              return { ...b, status: "Reviewed", reviewedAt: now.toISOString(), recordDate: `${y}-${m}-${d}`, recordTime: `${h}:${min}` }
            }
            return b
          }),
        )
      }
    } catch {
      setBids((prev) =>
        prev.map((b) => {
          if (b.id === bidId) {
            const now = new Date()
            const y = now.getFullYear()
            const m = String(now.getMonth() + 1).padStart(2, "0")
            const d = String(now.getDate()).padStart(2, "0")
            const h = String(now.getHours()).padStart(2, "0")
            const min = String(now.getMinutes()).padStart(2, "0")
            return { ...b, status: "Reviewed", reviewedAt: now.toISOString(), recordDate: `${y}-${m}-${d}`, recordTime: `${h}:${min}` }
          }
          return b
        }),
      )
    }
    setEvents((prev) => [
      { id: `evt-${Date.now()}`, bidId, projectId, action: "shortlisted", timestamp: new Date().toISOString() },
      ...prev,
    ])
    const bid = bids.find((b) => b.id === bidId)
    if (bid) {
      // Notification is now handled by the specific meeting invite action
      // We only send a generic status update notification here if needed
      /*
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const interviewUrl = `${baseUrl}/interview/${projectId}`
      await sendEmail(
        bid.email,
        "Interview Invitation",
        `<div><p>Dear ${bid.bidderName},</p><p>Your bid has been shortlisted for interview.</p><p>Join the interview: <a href="${interviewUrl}">${interviewUrl}</a></p><p>Amount: ${formatNairaAmount(bid.amount)}</p><p>Duration: ${bid.duration} days</p></div>`,
      )
      */
    }
  }

  const awardBid = async (projectId: string | number, bidId: string) => {
    const getToken = () => {
      if (typeof window === "undefined") return ""
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("managerToken") ||
        ""
      )
    }
    const optimistic = () => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, "0")
      const d = String(now.getDate()).padStart(2, "0")
      const h = String(now.getHours()).padStart(2, "0")
      const min = String(now.getMinutes()).padStart(2, "0")
      setBids((prev) =>
        prev.map((b) => {
          if (b.id === bidId) return { ...b, status: "Awarded", reviewedAt: now.toISOString(), recordDate: `${y}-${m}-${d}`, recordTime: `${h}:${min}` }
          return String(b.projectId) === String(projectId) ? { ...b, status: "Rejected", reviewedAt: now.toISOString(), recordDate: `${y}-${m}-${d}`, recordTime: `${h}:${min}` } : b
        }),
      )
      setProjectStatus(projectId, "Awarded")
    }
    try {
      const res = await fetch(`/api/bids/${bidId}/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ownerName: "Manager" }),
      })
      if (res.ok) {
        const data = await res.json()
        const contractSent = Boolean(data?.contractSent)
        const contractSentAt = String(data?.contractSentAt || "")
        setBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "Awarded", contractSent, contractSentAt } : String(b.projectId) === String(projectId) ? { ...b, status: "Rejected" } : b)))
        setProjectStatus(projectId, "Awarded")
        try {
          const target = bids.find((b) => b.id === bidId)
          updateProject(projectId, { acceptedBidDays: Number(target?.duration || 0) || undefined })
        } catch {}
      } else {
        optimistic()
      }
    } catch {
      optimistic()
    }
    setEvents((prev) => [
      { id: `evt-${Date.now()}`, bidId, projectId, action: "awarded", timestamp: new Date().toISOString() },
      ...prev,
    ])
  }

  const logBidAction = (bidId: string, action: "submitted" | "shortlisted" | "rejected" | "invited" | "awarded", notes?: string) => {
    const bid = bids.find((b) => b.id === bidId)
    const projectId = bid?.projectId || ""
    setEvents((prev) => [
      { id: `evt-${Date.now()}`, bidId, projectId, action, timestamp: new Date().toISOString(), notes },
      ...prev,
    ])
  }

  return (
    <BidContext.Provider
      value={{
        bids,
        getBidsByProject,
        submitBid,
        shortlistBid,
        awardBid,
        isLoaded,
        getAllBids,
        getPendingBids,
        getBid,
        updateBid,
        updateBidStatus,
        deleteBid,
        logBidAction,
        getEventsByProject,
      }}
    >
      {children}
    </BidContext.Provider>
  )
}

export function useBids() {
  const context = useContext(BidContext)
  if (!context) {
    throw new Error("useBids must be used within BidProvider")
  }
  return context
}
