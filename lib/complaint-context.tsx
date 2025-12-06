"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface ContractorComplaint {
  id: string
  projectId: string
  contractorId: string
  contractorName: string
  managerId: string
  category: "vendor-performance" | "quality-issue" | "safety-concern" | "payment-delay" | "other"
  subject: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  attachments?: string[]
  status: "open" | "acknowledged" | "investigating" | "resolved" | "closed"
  filedAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolution?: string
  resolvedAt?: string
  feedback?: string
  activities: ComplaintActivity[]
}

export interface ComplaintActivity {
  id: string
  complaintId: string
  managerId?: string
  action: "created" | "acknowledged" | "assigned" | "updated" | "resolved"
  notes: string
  timestamp: string
}

interface ComplaintContextType {
  complaints: ContractorComplaint[]
  addComplaint: (complaint: Omit<ContractorComplaint, "id" | "filedAt" | "activities">) => void
  getComplaint: (id: string) => ContractorComplaint | undefined
  getComplaintsByProject: (projectId: string) => ContractorComplaint[]
  getComplaintsByContractor: (contractorId: string) => ContractorComplaint[]
  getComplaintsByManager: (managerId: string) => ContractorComplaint[]
  updateComplaintStatus: (id: string, status: ContractorComplaint["status"]) => void
  resolveComplaint: (id: string, resolution: string) => void
  addActivity: (complaintId: string, activity: Omit<ComplaintActivity, "id">) => void
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined)

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<ContractorComplaint[]>([])

  const addComplaint = async (complaint: Omit<ContractorComplaint, "id" | "filedAt" | "activities">) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint),
      })
      if (res.ok) {
        const created = (await res.json()) as ContractorComplaint
        setComplaints((prev) => [created, ...prev])
        return
      }
    } catch {}
    const fallback: ContractorComplaint = {
      ...complaint,
      id: `complaint-${Date.now()}`,
      filedAt: new Date().toISOString(),
      activities: [],
      status: "open",
    }
    setComplaints((prev) => [fallback, ...prev])
  }

  const getComplaint = (id: string) => {
    return complaints.find((c) => c.id === id)
  }

  const getComplaintsByProject = (projectId: string) => {
    return complaints.filter((c) => c.projectId === projectId)
  }

  const getComplaintsByContractor = (contractorId: string) => {
    return complaints.filter((c) => c.contractorId === contractorId)
  }

  const getComplaintsByManager = (managerId: string) => {
    return complaints.filter((c) => c.managerId === managerId)
  }

  const updateComplaintStatus = (id: string, status: ContractorComplaint["status"]) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const activity: ComplaintActivity = {
            id: `activity-${Date.now()}`,
            complaintId: id,
            action: "updated",
            notes: `Status changed to ${status}`,
            timestamp: new Date().toISOString(),
          }
          return {
            ...c,
            status,
            acknowledgedAt: status === "acknowledged" ? new Date().toISOString() : c.acknowledgedAt,
            activities: [...c.activities, activity],
          }
        }
        return c
      }),
    )
  }

  const resolveComplaint = (id: string, resolution: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const activity: ComplaintActivity = {
            id: `activity-${Date.now()}`,
            complaintId: id,
            action: "resolved",
            notes: resolution,
            timestamp: new Date().toISOString(),
          }
          return {
            ...c,
            status: "resolved",
            resolution,
            resolvedAt: new Date().toISOString(),
            activities: [...c.activities, activity],
          }
        }
        return c
      }),
    )
  }

  const addActivity = (complaintId: string, activity: Omit<ComplaintActivity, "id">) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            activities: [
              ...c.activities,
              {
                ...activity,
                id: `activity-${Date.now()}`,
              },
            ],
          }
        }
        return c
      }),
    )
  }

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        addComplaint,
        getComplaint,
        getComplaintsByProject,
        getComplaintsByContractor,
        getComplaintsByManager,
        updateComplaintStatus,
        resolveComplaint,
        addActivity,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  )
}

export function useComplaints() {
  const context = useContext(ComplaintContext)
  if (!context) {
    throw new Error("useComplaints must be used within ComplaintProvider")
  }
  return context
}
