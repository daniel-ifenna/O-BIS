"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (project: any) => Promise<{ ok: boolean; error?: string }>
}

export function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
    detailedDescription: "",
    bidDays: "14",
    maxBids: "10",
    budget: "",
    estimatedCost: "",
    contingencyPercent: "10",
    paymentSchedule: "milestone",
    paymentTerms: "net30",
    retentionPercent: "5",
  })

  const [uploads, setUploads] = useState({
    itb: null as File | null,
    specs: null as File | null,
    boq: null as File | null,
    financial: null as File | null,
  })
  const [uploadDataUrls, setUploadDataUrls] = useState({
    itbUrl: "",
    specsUrl: "",
    boqUrl: "",
    financialUrl: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof uploads) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploads((prev) => ({ ...prev, [field]: file }))
      const reader = new FileReader()
      reader.onload = () => {
        const url = typeof reader.result === "string" ? reader.result : ""
        setUploadDataUrls((prev) => {
          const key =
            field === "itb"
              ? "itbUrl"
              : field === "specs"
                ? "specsUrl"
                : field === "boq"
                  ? "boqUrl"
                  : "financialUrl"
          return { ...prev, [key]: url }
        })
      }
      reader.readAsDataURL(file)
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
    setIsSubmitting(true)

    try {
      if (!formData.title || !formData.category || !formData.location || !formData.budget || !formData.estimatedCost) {
        toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      const newProject = {
        id: Date.now(),
        title: formData.title,
        location: formData.location,
        budget: String(Number(formData.budget)),
        status: "Published",
        bids: 0,
        category: formData.category,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        estimatedCost: formData.estimatedCost ? String(Number(formData.estimatedCost)) : "",
        contingency: String(Math.round(Number(formData.estimatedCost || 0) * (Number(formData.contingencyPercent || 0) / 100))),
        contingencyPercent: String(Number(formData.contingencyPercent || 0)),
        paymentSchedule: formData.paymentSchedule,
        paymentTerms: formData.paymentTerms,
        retentionPercent: String(Number(formData.retentionPercent || 0)),
        bidDays: Number(formData.bidDays || 0),
        maxBids: Number(formData.maxBids || 0),
        clientName: user?.name || "",
        clientCompany: user?.company || "",
        documents: {
          itb: uploads.itb?.name || "",
          itbUrl: uploadDataUrls.itbUrl || "",
          specs: uploads.specs?.name || "",
          specsUrl: uploadDataUrls.specsUrl || "",
          boq: uploads.boq?.name || "",
          boqUrl: uploadDataUrls.boqUrl || "",
          financial: uploads.financial?.name || "",
          financialUrl: uploadDataUrls.financialUrl || "",
        },
      }

      const result = await onCreate(newProject as any)
      if (result && (result as any).ok) {
        toast({ title: "Project published", description: newProject.title })
      } else {
        const msg = (result as any)?.error || "Failed to create project. Please try again."
        toast({ title: "Publish failed", description: msg, variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      setFormData({
        title: "",
        category: "",
        location: "",
        description: "",
        detailedDescription: "",
        bidDays: "14",
        maxBids: "10",
        budget: "",
        estimatedCost: "",
        contingencyPercent: "10",
        paymentSchedule: "milestone",
        paymentTerms: "net30",
        retentionPercent: "5",
      })
      setUploads({ itb: null, specs: null, boq: null, financial: null })
      setUploadDataUrls({ itbUrl: "", specsUrl: "", boqUrl: "", financialUrl: "" })

      onClose()
    } catch (error) {
      toast({ title: "Publish failed", description: "Unexpected error", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Project</h2>
            <p className="text-sm text-muted-foreground">Set up a project to start receiving bids</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Project Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Project Details</h3>
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
                <Label htmlFor="budget">Client Budget Allocation *</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g., 250000000"
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
                className="min-h-20"
              />
            </div>
          </div>

          <div className="space-y-4 bg-card/50 p-4 rounded-lg border border-border/50">
            <h3 className="font-semibold text-foreground">Financial Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Project Cost *</Label>
                <Input
                  id="estimatedCost"
                  name="estimatedCost"
                  type="number"
                  placeholder="e.g., 250000000"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contingencyPercent">Contingency % *</Label>
                <Input
                  id="contingencyPercent"
                  name="contingencyPercent"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 10"
                  value={formData.contingencyPercent}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Contingency Amount: ₦
                  {Math.round(
                    Number(formData.estimatedCost || 0) * (Number(formData.contingencyPercent || 0) / 100),
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentSchedule">Payment Schedule *</Label>
                <Select
                  value={formData.paymentSchedule}
                  onValueChange={(value) => handleSelectChange(value, "paymentSchedule")}
                >
                  <SelectTrigger id="paymentSchedule">
                    <SelectValue placeholder="Select payment schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upfront">Upfront</SelectItem>
                    <SelectItem value="milestone">Milestone Based</SelectItem>
                    <SelectItem value="monthly">Monthly Installments</SelectItem>
                    <SelectItem value="completion">Upon Completion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms *</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) => handleSelectChange(value, "paymentTerms")}
                >
                  <SelectTrigger id="paymentTerms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash on Delivery</SelectItem>
                    <SelectItem value="net30">Net 30 Days</SelectItem>
                    <SelectItem value="net60">Net 60 Days</SelectItem>
                    <SelectItem value="net90">Net 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentionPercent">Retention Percentage *</Label>
              <Input
                id="retentionPercent"
                name="retentionPercent"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 5"
                value={formData.retentionPercent}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Retention Amount: ₦
                {Math.round(
                  Number(formData.estimatedCost || 0) * (Number(formData.retentionPercent || 0) / 100),
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Bidding Rules Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Bidding Rules</h3>
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
          </div>

          {/* Document Uploads Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Required Documents</h3>
            <div className="space-y-4">
              {[
                { key: "itb", label: "Invitation to Bid (ITB)", description: "PDF document" },
                { key: "specs", label: "Project Specifications", description: "Technical specifications" },
                { key: "boq", label: "Bill of Quantities (BoQ)", description: "Cost breakdown" },
                { key: "financial", label: "Financial Specifications", description: "Payment, retention, terms" },
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label>{doc.label}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, doc.key as keyof typeof uploads)}
                      className="hidden"
                      id={doc.key}
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor={doc.key} className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {uploads[doc.key as keyof typeof uploads]?.name || "Click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="flex gap-4 p-6 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-background/80 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Project"}
          </button>
        </div>
      </form>
    </div>
  )
}
