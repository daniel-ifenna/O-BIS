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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Upload, X } from "lucide-react"

export default function DailyReport() {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]
  const currentTime = new Date().toLocaleTimeString()

  const [formData, setFormData] = useState({
    date: today,
    time: currentTime,
    activeMilestone: "M2",
    crew: "",
    crewChief: "",
    location: "",
    area: "",

    // Activity & Progress
    activityDescription: "",
    quantities: "",
    progress: 75,

    // Manpower & Equipment
    manpowerCount: "",
    equipment: "",
    equipmentHours: "",

    // Materials
    materialsDelivered: "",
    materialDetails: "",

    // Weather
    weatherConditions: "",

    // Issues & Risks
    issues: {
      delay: false,
      safety: false,
    },
    delayDetails: "",
    safetyDetails: "",

    // Inspections & Visitors
    inspections: "",
    visitors: "",

    issueDetails: "",
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleProgressChange = (value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      progress: Math.max(prev.progress, value[0]),
    }))
  }

  const handleCheckboxChange = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      issues: {
        ...prev.issues,
        [field]: !prev.issues[field as keyof typeof prev.issues],
      },
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files)
      if (photos.length + newPhotos.length <= 3) {
        setPhotos((prev) => [...prev, ...newPhotos])
      } else {
        setError("Maximum 3 photos allowed")
      }
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError("")
      const attachments: string[] = photos.map((p) => p.name)
      const res = await fetch(`/api/projects/${1}/daily-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          crew: formData.crew,
          crewChief: formData.crewChief,
          totalPersonnel: Number(formData.manpowerCount || 0),
          workDescription: formData.activityDescription,
          workPercentage: formData.progress,
          safetyIncidents: formData.issues.safety ? 1 : 0,
          qaIssues: 0,
          attachments,
        }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Failed to submit report")
      }
      setSubmitted(true)
      setTimeout(() => {
        router.push("/contractor/dashboard")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit report"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
              <CardTitle className="text-2xl mb-2">Report Submitted Successfully!</CardTitle>
              <CardDescription className="text-base">
                Your daily report has been recorded and submitted for review.
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Report</h1>
            <p className="text-sm text-muted-foreground">Log today's progress and activities</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. REPORT METADATA - Date and Time */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">1. Report Date & Time</CardTitle>
              <CardDescription>Timestamp for historical accuracy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. CREW & CONTRACTOR INFO */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">2. Contractor / Crew Information</CardTitle>
              <CardDescription>Identification of the crew chief and contractor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activeMilestone">Active Milestone (Read-only)</Label>
                <Input id="activeMilestone" value={formData.activeMilestone} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">M2: Framing & Structural Work</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crew">Contractor / Company Name *</Label>
                <Input
                  id="crew"
                  name="crew"
                  placeholder="e.g., ABC Construction Co."
                  value={formData.crew}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crewChief">Crew Chief / Reporting Officer *</Label>
                <Input
                  id="crewChief"
                  name="crewChief"
                  placeholder="e.g., John Doe"
                  value={formData.crewChief}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. LOCATION & AREA */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">3. Location & Work Area</CardTitle>
              <CardDescription>Where work was performed today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Downtown"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Work Area / Zone *</Label>
                  <Input
                    id="area"
                    name="area"
                    placeholder="e.g., Building A, Floor 3"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. DAILY ACTIVITY & PROGRESS */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">4. Daily Activity Description</CardTitle>
              <CardDescription>Detailed description of work performed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityDescription">Activity Description *</Label>
                <Textarea
                  id="activityDescription"
                  name="activityDescription"
                  placeholder="Describe today's work activities in detail... (max 500 chars)"
                  value={formData.activityDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      handleChange(e)
                    }
                  }}
                  maxLength={500}
                  className="min-h-24"
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.activityDescription.length}/500</p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <Label>Progress Update for Active Milestone *</Label>
                  <div className="text-2xl font-bold text-primary">{formData.progress}%</div>
                </div>
                <Slider
                  value={[formData.progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Note: Progress can only increase, not decrease
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. QUANTITIES - Measurable Units */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">5. Quantities: Measurable Units of Work</CardTitle>
              <CardDescription>Quantifiable metrics for today's work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantities">Work Units Completed *</Label>
                <Textarea
                  id="quantities"
                  name="quantities"
                  placeholder="e.g., Framed 15 wall sections, Installed 8 support beams, Completed 250 sq ft area, 5 tons of concrete poured"
                  value={formData.quantities}
                  onChange={handleChange}
                  className="min-h-20"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 6. MANPOWER & EQUIPMENT */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">6. Manpower & Key Equipment Utilization</CardTitle>
              <CardDescription>Resources deployed today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manpowerCount">Manpower Count *</Label>
                <Input
                  id="manpowerCount"
                  name="manpowerCount"
                  type="number"
                  placeholder="12"
                  value={formData.manpowerCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment in Use *</Label>
                <Textarea
                  id="equipment"
                  name="equipment"
                  placeholder="e.g., Excavator, Crane, Forklift, Concrete Mixer"
                  value={formData.equipment}
                  onChange={handleChange}
                  className="min-h-16"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentHours">Equipment Operating Hours</Label>
                <Input
                  id="equipmentHours"
                  name="equipmentHours"
                  type="number"
                  placeholder="8.5"
                  step="0.5"
                  value={formData.equipmentHours}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* 7. MATERIAL DELIVERIES */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">7. Material Deliveries</CardTitle>
              <CardDescription>Materials received today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="materialsDelivered">Materials Delivered? *</Label>
                <select
                  name="materialsDelivered"
                  value={formData.materialsDelivered}
                  onChange={(e) => setFormData((prev) => ({ ...prev, materialsDelivered: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              {formData.materialsDelivered === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="materialDetails">Material Details</Label>
                  <Textarea
                    id="materialDetails"
                    name="materialDetails"
                    placeholder="e.g., Steel beams (50 tons), Concrete (100 cubic yards), Roofing tiles (500 units)"
                    value={formData.materialDetails}
                    onChange={handleChange}
                    className="min-h-16"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 8. WEATHER CONDITIONS */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">8. Weather Conditions</CardTitle>
              <CardDescription>Environmental factors affecting work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weatherConditions">Weather Conditions Today *</Label>
                <Textarea
                  id="weatherConditions"
                  name="weatherConditions"
                  placeholder="e.g., Sunny, 28°C, Light wind, 0% chance of rain"
                  value={formData.weatherConditions}
                  onChange={handleChange}
                  className="min-h-16"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 9. ISSUES & RISKS */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">9. Issues / Risks Encountered</CardTitle>
              <CardDescription>Delays, safety incidents, and other concerns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delay"
                    checked={formData.issues.delay}
                    onCheckedChange={() => handleCheckboxChange("delay")}
                  />
                  <Label htmlFor="delay" className="font-normal cursor-pointer">
                    Delays and Lost Time
                  </Label>
                </div>
                {formData.issues.delay && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="delayDetails">Delay Details</Label>
                    <Textarea
                      id="delayDetails"
                      name="delayDetails"
                      placeholder="Describe delays, duration, and reason..."
                      value={formData.delayDetails}
                      onChange={handleChange}
                      className="min-h-16"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="safety"
                    checked={formData.issues.safety}
                    onCheckedChange={() => handleCheckboxChange("safety")}
                  />
                  <Label htmlFor="safety" className="font-normal cursor-pointer">
                    Safety Incidents
                  </Label>
                </div>
                {formData.issues.safety && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="safetyDetails">Safety Incident Details</Label>
                    <Textarea
                      id="safetyDetails"
                      name="safetyDetails"
                      placeholder="Describe incident, severity, and actions taken..."
                      value={formData.safetyDetails}
                      onChange={handleChange}
                      className="min-h-16"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 10. INSPECTIONS & VISITORS */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">10. Inspections & Site Visitors</CardTitle>
              <CardDescription>Any inspections or notable visits today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inspections">Site Inspections</Label>
                <Textarea
                  id="inspections"
                  name="inspections"
                  placeholder="e.g., Quality inspection by ABC Ltd, Passed structural assessment, Pending electrical review"
                  value={formData.inspections}
                  onChange={handleChange}
                  className="min-h-16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitors">Site Visitors</Label>
                <Textarea
                  id="visitors"
                  name="visitors"
                  placeholder="e.g., Project manager John Doe, Client representative Mary Smith, Subcontractor supervisor"
                  value={formData.visitors}
                  onChange={handleChange}
                  className="min-h-16"
                />
              </div>
            </CardContent>
          </Card>

          {/* 11. VISUAL PROOF - Photo Upload */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">11. Visual Proof</CardTitle>
              <CardDescription>Upload up to 3 photos of today's work (Required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {photos.length < 3 && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photos"
                    accept="image/jpeg,image/png"
                    multiple
                  />
                  <label htmlFor="photos" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG (up to 10MB each)</p>
                  </label>
                </div>
              )}

              {photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">Uploaded: {photos.length}/3 photos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                          <p className="text-xs text-muted-foreground text-center px-2">{photo.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href="/contractor/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting || photos.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Daily Report"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
