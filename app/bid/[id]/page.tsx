"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Upload, X, AlertCircle, Plus } from "lucide-react"
import { useProjects } from "@/lib/project-context"
import { formatNaira } from "@/lib/currency"
import { useBids } from "@/lib/bid-context"

export default function BidSubmission() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [submitted, setSubmitted] = useState(false)
  const { getProject, isLoaded, updateProject } = useProjects()
  const { submitBid, getBidsByProject } = useBids()
  const [remoteProject, setRemoteProject] = useState<any | null>(null)
  const project = (remoteProject ? remoteProject : (getProject(id) as any))
  const bidsForProject = getBidsByProject(id)
  const closingDays = project?.bidDays ?? 10
  const maxBids = Number(project?.maxBids || 0)
  

  const [formData, setFormData] = useState({
    bidderName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    estimate: "",
    duration: "",
    message: "",
  })

  const [uploads, setUploads] = useState<{ [key: string]: File[] }>({
    proposal: [],
    profile: [],
    specs: [],
    tax: [],
    bond: [],
    additional: [],
  })
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string[] }>({
    proposal: [],
    profile: [],
    specs: [],
    tax: [],
    bond: [],
    additional: [],
  })
  const [formError, setFormError] = useState<string>("")
  const [subcontractors, setSubcontractors] = useState<Array<{ name: string; email?: string; phone?: string; address?: string; company: string; scope: string }>>([
    { name: "", email: "", phone: "", address: "", company: "", scope: "" },
  ])

  useEffect(() => {
    const fetchServerProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (res.ok) {
          const item = await res.json()
          setRemoteProject(item)
          updateProject(id, item)
        }
      } catch {}
    }
    void fetchServerProject()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setUploads((prev) => {
      const current = prev[field] || []
      const next = current.concat(files).slice(0, 3)
      return { ...prev, [field]: next }
    })
  }

  const removeFile = (field: string, index: number) => {
    setUploads((prev) => {
      const next = [...(prev[field] || [])]
      next.splice(index, 1)
      return { ...prev, [field]: next }
    })
  }

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })

  const ensureFileUrls = async () => {
    const keys = Object.keys(uploads)
    const next: { [key: string]: string[] } = {}
    for (const k of keys) {
      const arr = uploads[k] || []
      next[k] = []
      for (const f of arr) {
        try {
          const url = await readFileAsDataUrl(f)
          next[k].push(url)
        } catch {}
      }
    }
    setFileUrls(next)
    return next
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submit Bid clicked", id)
    const requiredDocs = ["proposal"]
    const missing = requiredDocs.filter((k) => (uploads[k] || []).length === 0)
    if (missing.length > 0) {
      setFormError("Please upload the proposal document")
      return
    }
    const urls = await ensureFileUrls()
    const subs = subcontractors.filter((s) => s.name || s.company || s.scope)
    const amountNum = Number(String(formData.estimate).replace(/[^0-9.]/g, ""))
    const durationNum = Number(String(formData.duration))
    const result = await submitBid(id, {
      contractorId: "public",
      bidderName: formData.bidderName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      amount: amountNum,
      duration: durationNum,
      message: formData.message,
      subcontractors: subs,
      uploads: {
        proposal: urls.proposal,
        profile: urls.profile,
        specs: urls.specs,
        tax: urls.tax,
        bond: urls.bond,
        additional: urls.additional,
      },
    })
    if (!result.ok) {
      setFormError(result.error || "Failed to submit bid")
      return
    }
    setSubmitted(true)
    setTimeout(() => {
      router.push("/bid")
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <div className="text-4xl">✓</div>
            </div>
            <div>
              <CardTitle className="text-2xl mb-2">Bid Submitted Successfully!</CardTitle>
              <CardDescription className="text-base">
                Your bid has been received. Selected bidders will be contacted shortly for an interview.
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to projects list...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CardTitle className="text-xl">Loading project...</CardTitle>
            <CardDescription>Please wait while we load the project details.</CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CardTitle className="text-xl">Project not found</CardTitle>
            <CardDescription>Return to the projects list and select a valid project.</CardDescription>
            <Link href="/bid">
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (maxBids > 0 && bidsForProject.length >= maxBids) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CardTitle className="text-xl">Submission Limit Reached</CardTitle>
            <CardDescription>
              This project has reached the maximum number of bids allowed. Please check other opportunities.
            </CardDescription>
            <Link href="/bid">
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (["Closed", "Awarded", "Completed"].includes(project.status)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CardTitle className="text-xl">Bidding Closed</CardTitle>
            <CardDescription>
              Bidding for this project is closed. Please return to the projects list to find other open opportunities.
            </CardDescription>
            <Link href="/bid">
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/bid">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <img
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/icon.sg.png"}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              if (img.src.endsWith("/icon.sg.png")) img.src = "/icon.svg.png"
            }}
            alt="O-BIS"
            className="w-7 h-7 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit Bid</h1>
            <p className="text-sm text-muted-foreground">{project.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Project Overview */}
        <Card className="bg-card/60 border-border/50 mb-8">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Project Name</p>
                <p className="font-semibold">{project.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{project.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bid Submission Deadline</p>
                <p className="font-semibold">{
                  (() => {
                    const created = project?.createdAt ? new Date(project.createdAt) : new Date()
                    const d = new Date(created)
                    d.setDate(d.getDate() + closingDays)
                    return d.toLocaleDateString()
                  })()
                }</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-primary">{formatNaira(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-semibold">{project.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bids Received</p>
                <p className="font-semibold">{bidsForProject.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="font-semibold">{formatNaira(project.estimatedCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contingency</p>
                <p className="font-semibold">{project.contingency} ({project.contingencyPercent}%)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention</p>
                <p className="font-semibold">{project.retentionPercent}%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Payment Schedule</p>
                <p className="font-semibold">{project.paymentSchedule}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Terms</p>
                <p className="font-semibold">{project.paymentTerms}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bidding Window</p>
                <p className="font-semibold">{closingDays} days</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p className="font-semibold">{project.clientName || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client Company</p>
                <p className="font-semibold">{project.clientCompany || "Not specified"}</p>
              </div>
            </div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm text-muted-foreground">
                {project.description}
              </TabsContent>
              <TabsContent value="details" className="text-sm text-muted-foreground">
                {project.detailedDescription || project.description}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Instructions to Bidders</CardTitle>
            <CardDescription>Complete all mandatory fields and uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Welcome! Please carefully complete this bid submission form. All fields marked with * are mandatory. Ensure that all required documents are uploaded. Incomplete submissions may be disqualified.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>Uploaded by the manager for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Invitation to Bid (ITB)</p>
                <p className="font-semibold truncate">{(project as any).documents?.itb || (project as any).itbName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.itbUrl ? (
                    <a
                      href={(project as any).documents?.itbUrl}
                      download={(project as any).documents?.itb || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Project Specifications</p>
                <p className="font-semibold truncate">{(project as any).documents?.specs || (project as any).specsName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.specsUrl ? (
                    <a
                      href={(project as any).documents?.specsUrl}
                      download={(project as any).documents?.specs || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Bill of Quantities (BoQ)</p>
                <p className="font-semibold truncate">{(project as any).documents?.boq || (project as any).boqName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.boqUrl ? (
                    <a
                      href={(project as any).documents?.boqUrl}
                      download={(project as any).documents?.boq || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Financial Specifications</p>
                <p className="font-semibold truncate">{(project as any).documents?.financial || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.financialUrl ? (
                    <a
                      href={(project as any).documents?.financialUrl}
                      download={(project as any).documents?.financial || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{formError}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Contact Information */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your details and company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bidderName">Contact Person Name *</Label>
                  <Input
                    id="bidderName"
                    name="bidderName"
                    placeholder="John Doe"
                    value={formData.bidderName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company / Individual Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="BuildCorp Inc"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Company Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bid Details */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Bid Details</CardTitle>
              <CardDescription>Your proposal amount and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimate">Estimated Budget / Quotation *</Label>
                  <Input
                    id="estimate"
                    name="estimate"
                    type="number"
                    placeholder="250000"
                    value={formData.estimate}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">In project currency</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Project Duration (Days) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    placeholder="45"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">In days</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell the project manager why you're the best choice for this project..."
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Subcontractors (If Applicable)</Label>
                <div className="space-y-2">
                  {subcontractors.map((sc, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <Input
                        placeholder="Name"
                        value={sc.name}
                        onChange={(e) =>
                          setSubcontractors((prev) => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], name: e.target.value }
                            return next
                          })
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={sc.email || ""}
                        onChange={(e) =>
                          setSubcontractors((prev) => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], email: e.target.value }
                            return next
                          })
                        }
                      />
                      <Input
                        placeholder="Phone"
                        value={sc.phone || ""}
                        onChange={(e) =>
                          setSubcontractors((prev) => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], phone: e.target.value }
                            return next
                          })
                        }
                      />
                      <Input
                        placeholder="Company"
                        value={sc.company}
                        onChange={(e) =>
                          setSubcontractors((prev) => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], company: e.target.value }
                            return next
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Scope of work"
                          value={sc.scope}
                          onChange={(e) =>
                            setSubcontractors((prev) => {
                              const next = [...prev]
                              next[idx] = { ...next[idx], scope: e.target.value }
                              return next
                            })
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-transparent"
                          onClick={() =>
                            setSubcontractors((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Address"
                        value={sc.address || ""}
                        onChange={(e) =>
                          setSubcontractors((prev) => {
                            const next = [...prev]
                            next[idx] = { ...next[idx], address: e.target.value }
                            return next
                          })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => setSubcontractors((prev) => [...prev, { name: "", email: "", phone: "", address: "", company: "", scope: "" }])}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Subcontractor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Required Documentation Uploads</CardTitle>
              <CardDescription>Maximum 3 files per upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "proposal", label: "Financial Proposal", required: true, description: "Detailed breakdown of costs and payment schedule" },
                { key: "profile", label: "Company Profile", required: false, description: "Overview of company history, past projects, capabilities" },
                { key: "specs", label: "Technical Proposal / Specifications", required: false, description: "Approach, methodology, equipment, and technology to be used" },
                { key: "tax", label: "Tax Compliance / Certificates", required: false, description: "Current tax compliance certificate or equivalent" },
                { key: "bond", label: "Bid Bond / Performance Security", required: false, description: "Bank guarantee or bid security as required by project" },
                { key: "additional", label: "Additional Supporting Documents", required: false, description: "References, case studies, licenses, insurance certificates, etc." },
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{doc.label}</Label>
                    {doc.required && <span className="text-destructive text-sm">*</span>}
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, doc.key)}
                      className="hidden"
                      id={doc.key}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      multiple
                    />
                    <label htmlFor={doc.key} className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, or images. Max 3 files.</p>
                    </label>
                  </div>

                  {uploads[doc.key] && uploads[doc.key].length > 0 && (
                    <div className="space-y-2">
                      {uploads[doc.key].map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          <button type="button" onClick={() => removeFile(doc.key, idx)} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-accent/10 border border-accent/20">
            <CardContent className="pt-6">
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">Important</p>
                <p className="text-muted-foreground">All uploaded documents must be accurate and verifiable. O-BIS may verify documentation as part of the evaluation process.</p>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card className="bg-accent/10 border border-accent/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Important</p>
                  <p className="text-muted-foreground">
                    By submitting your bid, you agree to the terms and conditions of this project. Your submission will be kept confidential and reviewed fairly against all other bids. Once submitted, edits are not allowed unless explicitly permitted by the project manager. Only bids that meet documentation and completeness criteria will be considered.
                  </p>
                  <div className="mt-3">
                    <p className="font-semibold text-foreground mb-1">Tips for a Successful Bid</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Ensure all mandatory fields are completed.</li>
                      <li>Double-check financial and technical documents for accuracy.</li>
                      <li>Clearly indicate subcontractors and responsibilities.</li>
                      <li>Follow the project timeline strictly.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/bid" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Submit Bid
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
// duplicate import removed
