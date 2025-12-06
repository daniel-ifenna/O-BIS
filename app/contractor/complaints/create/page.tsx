"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProjects } from "@/lib/project-context"
import { useComplaints } from "@/lib/complaint-context"

export default function CreateComplaintPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { projects } = useProjects()
  const { addComplaint } = useComplaints()

  const [formData, setFormData] = useState({
    projectId: "",
    category: "" as "vendor-performance" | "quality-issue" | "safety-concern" | "payment-delay" | "other",
    severity: "" as "low" | "medium" | "high" | "critical",
    subject: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !formData.projectId || !formData.category || !formData.subject) {
      return
    }

    const selectedProject = projects.find((p) => p.id.toString() === formData.projectId)

    addComplaint({
      projectId: formData.projectId,
      contractorId: user.id,
      contractorName: user.name,
      managerId: selectedProject?.id.toString() || "",
      category: formData.category,
      severity: formData.severity || "medium",
      subject: formData.subject,
      description: formData.description,
      status: "open",
    })

    router.push("/contractor/complaints")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/complaints">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">File a Complaint</h1>
            <p className="text-sm text-muted-foreground">Report an issue to the project manager</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Which project is this complaint related to?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => handleSelectChange("projectId", value)}>
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Complaint Category & Severity */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>Categorize and describe your complaint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor-performance">Vendor Performance</SelectItem>
                      <SelectItem value="quality-issue">Quality Issue</SelectItem>
                      <SelectItem value="safety-concern">Safety Concern</SelectItem>
                      <SelectItem value="payment-delay">Payment Delay</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleSelectChange("severity", value)}>
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Brief summary of the issue"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed information about the complaint. Include dates, affected work, and any impact on the project."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-32"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground mb-2">
                <strong>Note:</strong> This complaint will be sent directly to the project manager. Ensure you provide
                sufficient detail for them to investigate and resolve the issue promptly.
              </p>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/contractor/complaints" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" />
              File Complaint
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
