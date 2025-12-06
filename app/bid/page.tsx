"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Search, MapPin, Calendar, Upload, X } from "lucide-react"
import { useProjects } from "@/lib/project-context"
import { useBids } from "@/lib/bid-context"
import { formatNaira } from "@/lib/currency"

export default function PublicBidPortal() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    bidderName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    estimate: "",
    duration: "",
    message: "",
    proposalText: "",
  })
  const [uploads, setUploads] = useState<{ [key: string]: File[] }>({
    proposal: [],
    profile: [],
    specs: [],
    tax: [],
    additional: [],
  })

  const { projects, isLoaded } = useProjects()
  const { submitBid } = useBids()

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50 text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CardTitle className="text-xl">Loading projects...</CardTitle>
            <CardDescription>Please wait while we load available projects for bidding.</CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredProjects = projects.filter((p) => {
    const isActive = p.status === "Published" || p.status === "Bidding"
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = filterCategory === "all" || p.category === filterCategory
    return isActive && matchSearch && matchCategory
  })

  // Get unique categories from projects
  const categories = [
    "all",
    ...new Set(
      projects
        .map((p) => p.category?.toLowerCase())
        .filter((c): c is string => Boolean(c)),
    ),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">O-BIS</h1>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search projects by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.bidDays || 10} days left
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatNaira(project.budget)}</p>
                      <p className="text-xs text-muted-foreground">{(project.bids ?? 0)} bids received</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Invitation to Bid (ITB)</p>
                      <p className="text-sm font-semibold truncate">{(project as any).documents?.itb || "Not uploaded"}</p>
                      <div className="mt-1">
                        {(project as any).documents?.itbUrl ? (
                          <a href={(project as any).documents?.itbUrl} download={(project as any).documents?.itb || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No file</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Project Specifications</p>
                      <p className="text-sm font-semibold truncate">{(project as any).documents?.specs || "Not uploaded"}</p>
                      <div className="mt-1">
                        {(project as any).documents?.specsUrl ? (
                          <a href={(project as any).documents?.specsUrl} download={(project as any).documents?.specs || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No file</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Bill of Quantities (BoQ)</p>
                      <p className="text-sm font-semibold truncate">{(project as any).documents?.boq || "Not uploaded"}</p>
                      <div className="mt-1">
                        {(project as any).documents?.boqUrl ? (
                          <a href={(project as any).documents?.boqUrl} download={(project as any).documents?.boq || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No file</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Financial Specifications</p>
                      <p className="text-sm font-semibold truncate">{(project as any).documents?.financial || "Not uploaded"}</p>
                      <div className="mt-1">
                        {(project as any).documents?.financialUrl ? (
                          <a href={(project as any).documents?.financialUrl} download={(project as any).documents?.financial || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No file</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <Button
                    onClick={() => {
                      setActiveProjectId(project.id)
                      setIsBidModalOpen(true)
                      setSubmitted(false)
                      setFormError("")
                    }}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 py-6 text-base font-semibold shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                      <path d="M3 3h18v2H3V3zm0 7h18v2H3v-2zm0 7h12v2H3v-2z" />
                    </svg>
                    Submit Bid
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No projects found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent className="sm:max-w-[95vw] lg:max-w-5xl p-4">
          <div className="max-h-[85vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <div className="text-4xl">✓</div>
              </div>
              <DialogTitle>Bid Submitted Successfully</DialogTitle>
              <DialogDescription>
                Your bid has been received. Selected bidders will be contacted shortly for an interview.
              </DialogDescription>
              <DialogFooter>
                <Button onClick={() => setIsBidModalOpen(false)} variant="outline">Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const p = projects.find((x) => String(x.id) === String(activeProjectId))
                return (
                  <div className="space-y-2">
                    <DialogHeader>
                      <DialogTitle>Submit Bid</DialogTitle>
                      <DialogDescription>{p?.title} — {p?.location}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold">{formatNaira(p?.budget)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days Left</p>
                        <p className="font-semibold">{p?.bidDays || 10}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bids Received</p>
                        <p className="font-semibold">{p?.bids ?? 0}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Project Documents</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 border rounded-lg">
                          <p className="text-[11px] text-muted-foreground">Invitation to Bid (ITB)</p>
                          <p className="text-sm font-semibold truncate">{(p as any)?.documents?.itb || "Not uploaded"}</p>
                          <div className="mt-1">
                            {(p as any)?.documents?.itbUrl ? (
                              <a href={(p as any).documents.itbUrl} download={(p as any).documents.itb || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">No file</span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 border rounded-lg">
                          <p className="text-[11px] text-muted-foreground">Project Specifications</p>
                          <p className="text-sm font-semibold truncate">{(p as any)?.documents?.specs || "Not uploaded"}</p>
                          <div className="mt-1">
                            {(p as any)?.documents?.specsUrl ? (
                              <a href={(p as any).documents.specsUrl} download={(p as any).documents.specs || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">No file</span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 border rounded-lg">
                          <p className="text-[11px] text-muted-foreground">Bill of Quantities (BoQ)</p>
                          <p className="text-sm font-semibold truncate">{(p as any)?.documents?.boq || "Not uploaded"}</p>
                          <div className="mt-1">
                            {(p as any)?.documents?.boqUrl ? (
                              <a href={(p as any).documents.boqUrl} download={(p as any).documents.boq || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">No file</span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 border rounded-lg">
                          <p className="text-[11px] text-muted-foreground">Financial Specifications</p>
                          <p className="text-sm font-semibold truncate">{(p as any)?.documents?.financial || "Not uploaded"}</p>
                          <div className="mt-1">
                            {(p as any)?.documents?.financialUrl ? (
                              <a href={(p as any).documents.financialUrl} download={(p as any).documents.financial || undefined} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">Download</a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">No file</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!activeProjectId) return
                  const required = ["bidderName", "companyName", "email", "estimate", "duration"]
                  const missing = required.filter((k) => !(formData as any)[k])
                  if (missing.length > 0) {
                    setFormError("Please fill all required fields")
                    return
                  }
                  const requiredDocs = ["proposal", "profile", "specs", "tax"]
                  const missingDocs = requiredDocs.filter((k) => (uploads[k] || []).length === 0)
                  if (missingDocs.length > 0) {
                    setFormError("Please upload all required documents")
                    return
                  }
                  submitBid(activeProjectId, {
                    contractorId: "public",
                    bidderName: formData.bidderName,
                    companyName: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    amount: formData.estimate,
                    duration: formData.duration,
                    message: formData.message,
                    proposalText: formData.proposalText,
                    uploads: {
                      proposal: uploads.proposal.map((f) => f.name),
                      profile: uploads.profile.map((f) => f.name),
                      specs: uploads.specs.map((f) => f.name),
                      tax: uploads.tax.map((f) => f.name),
                      additional: uploads.additional.map((f) => f.name),
                    },
                  })
                  setSubmitted(true)
                }}
                className="space-y-3"
              >
                {formError && <p className="text-destructive text-sm">{formError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="bidderName">Bidder Name</Label>
                    <Input id="bidderName" value={formData.bidderName} onChange={(e) => setFormData({ ...formData, bidderName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="estimate">Bid Amount</Label>
                    <Input id="estimate" value={formData.estimate} onChange={(e) => setFormData({ ...formData, estimate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="duration">Estimated Duration (days)</Label>
                    <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="proposalText">Bid Proposal</Label>
                  <Textarea id="proposalText" placeholder="Describe your approach, methodology, key personnel, and assumptions" value={formData.proposalText} onChange={(e) => setFormData({ ...formData, proposalText: e.target.value })} />
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold">Required Documentation Uploads</p>
                  {[
                    { key: "proposal", label: "Financial Proposal", required: true },
                    { key: "profile", label: "Company Profile", required: true },
                    { key: "specs", label: "Technical Specifications", required: true },
                    { key: "tax", label: "Tax Compliance", required: true },
                    { key: "additional", label: "Additional Supporting Document (optional)", required: false },
                  ].map((doc) => (
                    <div key={doc.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>{doc.label}</Label>
                        {doc.required && <span className="text-destructive text-sm">*</span>}
                      </div>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, doc.key)}
                          className="hidden"
                          id={`modal-${doc.key}`}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          multiple
                        />
                        <label htmlFor={`modal-${doc.key}`} className="cursor-pointer">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, or images. Max 3 files.</p>
                        </label>
                      </div>
                      {uploads[doc.key] && uploads[doc.key].length > 0 && (
                        <div className="space-y-2">
                          {uploads[doc.key].map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg">
                              <span className="text-sm font-medium truncate">{file.name}</span>
                              <button type="button" onClick={() => removeFile(doc.key, idx)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Submit Bid</Button>
                </DialogFooter>
              </form>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
