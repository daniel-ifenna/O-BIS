"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"

interface Milestone {
  id: string
  name: string
  startDate: string
  endDate: string
  weight: number
}

export default function MilestoneSetup() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: "",
    startDate: "",
    endDate: "",
    weight: 0,
  })

  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0)
  const remainingWeight = 100 - totalWeight
  const isValid = totalWeight === 100

  const router = useRouter()

  const handleAddMilestone = () => {
    if (newMilestone.name && newMilestone.startDate && newMilestone.endDate && newMilestone.weight) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        name: newMilestone.name,
        startDate: newMilestone.startDate,
        endDate: newMilestone.endDate,
        weight: newMilestone.weight,
      }
      setMilestones([...milestones, milestone])
      setNewMilestone({ name: "", startDate: "", endDate: "", weight: 0 })
    }
  }

  const handleRemove = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id))
  }

  const handleUpdateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: field === "weight" ? Number(value) : value,
            }
          : m,
      ),
    )
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${1}/milestones`)
        if (res.ok) {
          const items = await res.json()
          setMilestones(
            items.map((m: any) => ({ id: m.id, name: m.name, startDate: m.plannedStartDate, endDate: m.plannedEndDate, weight: m.weight })),
          )
        }
      } catch {}
    }
    void load()
  }, [])

  const saveMilestones = async () => {
    const payload = milestones.map((m) => ({ name: m.name, startDate: m.startDate, endDate: m.endDate, weight: m.weight }))
    const res = await fetch(`/api/projects/${1}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones: payload }),
    })
    if (!res.ok) return
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      try {
        // Submit milestones to API in production
        router.push("/contractor/dashboard")
      } catch (error) {
        console.error("Failed to save milestones:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Define Milestones</h1>
            <p className="text-sm text-muted-foreground">Set up project phases with weight distribution</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Milestones Table */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Define project phases with start/end dates and weight percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Existing Milestones */}
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="grid grid-cols-6 gap-3 items-end pb-4 border-b border-border">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        value={milestone.name}
                        onChange={(e) => handleUpdateMilestone(milestone.id, "name", e.target.value)}
                        placeholder="Milestone name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input
                        type="date"
                        value={milestone.startDate}
                        onChange={(e) => handleUpdateMilestone(milestone.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Input
                        type="date"
                        value={milestone.endDate}
                        onChange={(e) => handleUpdateMilestone(milestone.id, "endDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Weight %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={milestone.weight}
                        onChange={(e) =>
                          handleUpdateMilestone(milestone.id, "weight", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-semibold">Pending</p>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(milestone.id)} type="button">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add New Milestone */}
                <div className="grid grid-cols-6 gap-3 items-end pt-4 border-t-2 border-primary/20">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={newMilestone.name || ""}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                      placeholder="New milestone"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={newMilestone.startDate || ""}
                      onChange={(e) => setNewMilestone({ ...newMilestone, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Input
                      type="date"
                      value={newMilestone.endDate || ""}
                      onChange={(e) => setNewMilestone({ ...newMilestone, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Weight %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newMilestone.weight || 0}
                      onChange={(e) =>
                        setNewMilestone({ ...newMilestone, weight: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div></div>
                  <Button
                    onClick={handleAddMilestone}
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight Validator */}
          <Card
            className={`${isValid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"} border-border/50`}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Weight Distribution</p>
                  <p className="text-sm text-muted-foreground">
                    Total: {totalWeight}% — {isValid ? "Valid" : `Need ${remainingWeight}% more`}
                  </p>
                </div>
                <div className="text-2xl font-bold">{totalWeight}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/contractor/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={!isValid}>
              Save Milestones
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
