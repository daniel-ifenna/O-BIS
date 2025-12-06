"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface Project {
  id: string | number
  title: string
  location: string
  budget: string
  status: string
  bids: number
  createdAt: string
  estimatedCost: string
  contingency: string
  contingencyPercent: string
  paymentSchedule: string
  paymentTerms: string
  retentionPercent: string
  category?: string
  description?: string
  contractorId?: string
  bidDays?: number
  acceptedBidDays?: number
}

interface ProjectContextType {
  projects: Project[]
  selectedProjectId: string | number | null
  setSelectedProjectId: (id: string | number | null) => void
  addProject: (project: Project) => Promise<{ ok: boolean; error?: string }>
  getProject: (id: string | number) => Project | undefined
  closeBidding: (id: string | number) => void
  setProjectStatus: (id: string | number, status: string) => void
  incrementBidCount: (id: string | number, delta?: number) => void
  isLoaded: boolean
  getAllProjects: () => Project[]
  getOpenProjects: () => Project[]
  getProjectsByContractor: (contractorId: string) => Project[]
  getProjectByContractor: (projectId: string | number, contractorId: string) => Project | undefined
  updateProject: (id: string | number, updates: Partial<Project>) => Project | undefined
  deleteProject: (id: string | number) => void
  decrementBidCount: (id: string | number, delta?: number) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/projects")
        if (res.ok) {
          const items = await res.json()
          if (Array.isArray(items)) {
            const normalized = items.map((p: any) => {
              const d = p.createdAt ? new Date(p.createdAt) : null
              const y = d ? d.getFullYear() : ""
              const m = d ? String(d.getMonth() + 1).padStart(2, "0") : ""
              const day = d ? String(d.getDate()).padStart(2, "0") : ""
              const h = d ? String(d.getHours()).padStart(2, "0") : ""
              const min = d ? String(d.getMinutes()).padStart(2, "0") : ""
              return {
                ...p,
                bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                budget: p.budget != null ? String(p.budget) : "",
                createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : (p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined),
              }
            })
            setProjects(normalized)
          }
        }
      } catch {
      } finally {
        setIsLoaded(true)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    // no-op: keep state in memory; source of truth is Prisma via /api/projects
  }, [projects])

  const addProject = async (project: Project) => {
    try {
    const token = (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("auth_token") || localStorage.getItem("managerToken") || "")) || ""
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(project),
      })
      if (res.ok) {
        const created = await res.json()
        setProjects((prev) => [created, ...prev])
        try {
          const listRes = await fetch("/api/projects")
          if (listRes.ok) {
            const items = await listRes.json()
            if (Array.isArray(items)) {
              const normalized = items.map((p: any) => {
                const d = p.createdAt ? new Date(p.createdAt) : null
                const y = d ? d.getFullYear() : ""
                const m = d ? String(d.getMonth() + 1).padStart(2, "0") : ""
                const day = d ? String(d.getDate()).padStart(2, "0") : ""
                const h = d ? String(d.getHours()).padStart(2, "0") : ""
                const min = d ? String(d.getMinutes()).padStart(2, "0") : ""
                return {
                  ...p,
                  bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                  budget: p.budget != null ? String(p.budget) : "",
                  createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                  acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : (p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined),
                }
              })
              setProjects(normalized)
            }
          }
        } catch {}
        return { ok: true as const }
      } else {
        let err = "Failed to create project"
        try {
          const j = await res.json()
          if (j?.error) err = String(j.error)
        } catch {}
        return { ok: false as const, error: err }
      }
    } catch {}
    try {
      const msg = await (async () => {
        const r = await fetch("/api/projects")
        return r.ok ? "Server reachable" : "Server unreachable"
      })()
      return { ok: false as const, error: msg }
    } catch {
      return { ok: false as const, error: "Network error" }
    }
  }

  const getProject = (id: string | number) => {
    const foundById = projects.find((p) => String(p.id) === String(id))
    if (foundById) return foundById
    const key = String(id).toLowerCase()
    return projects.find((p) => p.title?.toLowerCase() === key)
  }

  const closeBidding = async (id: string | number) => {
    let updatedRemote: any = null
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Closed" }),
      })
      if (res.ok) {
        updatedRemote = await res.json()
      }
    } catch {}
    setProjects((prev) =>
      prev.map((p) => {
        if (String(p.id) !== String(id)) return p
        if (updatedRemote) {
          const d = updatedRemote.createdAt ? new Date(updatedRemote.createdAt) : null
          let createdAt = p.createdAt
          if (d) {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, "0")
            const day = String(d.getDate()).padStart(2, "0")
            const h = String(d.getHours()).padStart(2, "0")
            const min = String(d.getMinutes()).padStart(2, "0")
            createdAt = `${y}-${m}-${day} ${h}:${min}`
          }
          return {
            ...p,
            status: String(updatedRemote.status || "Closed"),
            budget: updatedRemote.budget != null ? String(updatedRemote.budget) : p.budget,
            createdAt,
          }
        }
        return { ...p, status: p.status === "Awarded" ? "Awarded" : "Closed" }
      }),
    )
  }

  const setProjectStatus = async (id: string | number, status: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        try {
          const latest = await fetch("/api/projects")
          if (latest.ok) {
            const items = await latest.json()
            if (Array.isArray(items)) {
              const normalized = items.map((p: any) => {
                const d = p.createdAt ? new Date(p.createdAt) : null
                const y = d ? d.getFullYear() : ""
                const m = d ? String(d.getMonth() + 1).padStart(2, "0") : ""
                const day = d ? String(d.getDate()).padStart(2, "0") : ""
                const h = d ? String(d.getHours()).padStart(2, "0") : ""
                const min = d ? String(d.getMinutes()).padStart(2, "0") : ""
                return {
                  ...p,
                  bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                  budget: p.budget != null ? String(p.budget) : "",
                  createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                  acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : (p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined),
                }
              })
              setProjects(normalized)
            }
          }
        } catch {}
      }
    } catch {}
    setProjects((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, status } : p)))
  }

  const incrementBidCount = (id: string | number, delta: number = 1) => {
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, bids: Math.max(0, (p.bids || 0) + delta) } : p)),
    )
  }

  const getAllProjects = () => projects

  const getOpenProjects = () => projects.filter((p) => p.status === "Published" || p.status === "Bidding")

  const getProjectsByContractor = (contractorId: string) => projects.filter((p) => p.contractorId === contractorId)

  const getProjectByContractor = (projectId: string | number, contractorId: string) =>
    projects.find((p) => String(p.id) === String(projectId) && p.contractorId === contractorId)

  const updateProject = (id: string | number, updates: Partial<Project>) => {
    let updated: Project | undefined
    setProjects((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(id)) {
          updated = { ...p, ...updates }
          return updated
        }
        return p
      }),
    )
    try {
      fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
    } catch {}
    return updated
  }

  const deleteProject = async (id: string | number) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" })
    } catch {}
    try {
      const latest = await fetch("/api/projects")
      if (latest.ok) {
        const items = await latest.json()
        if (Array.isArray(items)) {
          const normalized = items.map((p: any) => {
            const d = p.createdAt ? new Date(p.createdAt) : null
            const y = d ? d.getFullYear() : ""
            const m = d ? String(d.getMonth() + 1).padStart(2, "0") : ""
            const day = d ? String(d.getDate()).padStart(2, "0") : ""
            const h = d ? String(d.getHours()).padStart(2, "0") : ""
            const min = d ? String(d.getMinutes()).padStart(2, "0") : ""
            return {
              ...p,
              bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
              budget: p.budget != null ? String(p.budget) : "",
              createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
              acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : (p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined),
            }
          })
          setProjects(normalized)
          return
        }
      }
    } catch {}
    setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)))
  }

  const decrementBidCount = (id: string | number, delta: number = 1) => {
    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(id) ? { ...p, bids: Math.max(0, (p.bids || 0) - delta) } : p,
      ),
    )
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        addProject,
        getProject,
        closeBidding,
        setProjectStatus,
        incrementBidCount,
        isLoaded,
        getAllProjects,
        getOpenProjects,
        getProjectsByContractor,
        getProjectByContractor,
        updateProject,
        deleteProject,
        decrementBidCount,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjects must be used within ProjectProvider")
  }
  return context
}
