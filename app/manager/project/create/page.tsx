"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProjects } from "@/lib/project-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload } from "lucide-react"

export default function CreateProject() {
  const router = useRouter()
  const { addProject } = useProjects()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
    detailedDescription: "",
    bidDays: "14",
    maxBids: "10",
    budget: "",
  })

  const [uploads, setUploads] = useState({
    itb: null as File | null,
    specs: null as File | null,
    boq: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof uploads) => {
    if (e.target.files?.[0]) {
      setUploads((prev) => ({
        ...prev,
        [field]: e.target.files?.[0] || null,
      }))
    }
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        id: Date.now(),
        title: formData.title,
        location: formData.location,
        budget: formData.budget,
        status: "Published",
        bids: 0,
        createdAt: new Date().toISOString(),
        estimatedCost: "",
        contingency: "",
        contingencyPercent: "",
        paymentSchedule: "",
        paymentTerms: "",
        retentionPercent: "",
        category: formData.category,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        bidDays: Number(formData.bidDays || 0),
        maxBids: Number(formData.maxBids || 0),
      } as any
      const result = await addProject(payload)
      if (result?.ok) {
        toast({ title: "Project published", description: "Your project has been saved." })
        router.push("/manager/dashboard")
      } else {
        toast({ title: "Publish failed", description: String(result?.error || "Unknown error"), variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Project</h1>
            <p className="text-sm text-muted-foreground">Set up a project to start receiving bids</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Office Building Renovation"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Downtown, City"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated Budget *</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="e.g., 250000"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief overview of the project"
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailedDescription">Detailed Description</Label>
                <Textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  placeholder="Comprehensive project details, requirements, and specifications"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  className="min-h-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bidding Rules */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Bidding Rules</CardTitle>
              <CardDescription>Configure how bids will be accepted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bidDays">Bid Submission Days *</Label>
                  <Input
                    id="bidDays"
                    name="bidDays"
                    type="number"
                    value={formData.bidDays}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">How many days to accept bids</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBids">Maximum Bids to Accept *</Label>
                  <Input
                    id="maxBids"
                    name="maxBids"
                    type="number"
                    value={formData.maxBids}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for unlimited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload project specifications and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "itb", label: "Invitation to Bid (ITB)", description: "PDF document" },
                { key: "specs", label: "Project Specifications", description: "Technical specifications" },
                { key: "boq", label: "Bill of Quantities (BoQ)", description: "Cost breakdown" },
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label>{doc.label}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, doc.key as keyof typeof uploads)}
                      className="hidden"
                      id={doc.key}
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor={doc.key} className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {uploads[doc.key as keyof typeof uploads]?.name || "Click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/manager/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">Publish Project</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
