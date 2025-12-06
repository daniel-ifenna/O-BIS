"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload } from "lucide-react"

export default function CreateProcurementRequest() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectId: "",
    item: "",
    specification: "",
    quantity: "",
    unit: "pieces",
    deliveryLocation: "",
    requestedDate: "",
  })
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([])

  const [specFile, setSpecFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSpecFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        const token = (() => { try { return localStorage.getItem("auth_token") || "" } catch { return "" } })()
        if (token) headers.Authorization = `Bearer ${token}`
        const resp = await fetch("/api/contractor/procurements", {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId: formData.projectId,
            item: formData.item,
            specification: formData.specification,
            quantity: Number(formData.quantity || 0),
            unit: formData.unit,
            deliveryLocation: formData.deliveryLocation,
            requestedDate: formData.requestedDate,
            isPublic: true,
          }),
        })
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}))
          throw new Error(j.error || "Failed to create procurement request")
        }
        const created = await resp.json()

        if (specFile) {
          try {
            const fd = new FormData()
            fd.append("file", specFile)
            fd.append("category", "procurement-specifications")
            fd.append("filename", specFile.name)
            fd.append("contentType", specFile.type || "application/octet-stream")
            fd.append("procurementId", created.id || created?.id || "")
            await fetch("/api/storage/upload", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd })
          } catch {}
        }

        router.push("/contractor/procurement")
      } catch (err) {
        console.error(err)
        alert((err as any)?.message || "Failed to create procurement request")
      }
    })()
  }

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch("/api/projects")
        const items = await resp.json().catch(() => [])
        const mapped = Array.isArray(items) ? items.map((p: any) => ({ id: String(p.id), title: String(p.title) })) : []
        setProjects(mapped)
      } catch {
        setProjects([])
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/procurement">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Procurement Request</h1>
            <p className="text-sm text-muted-foreground">Create a request to send to vendors</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Details */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>What do you need to procure?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => handleSelectChange(value, "projectId")}>
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item">Item Name *</Label>
                <Input
                  id="item"
                  name="item"
                  placeholder="e.g., Steel Beams, Concrete Mix"
                  value={formData.item}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specification">Specification / Description *</Label>
                <Textarea
                  id="specification"
                  name="specification"
                  placeholder="Detailed specifications, grades, standards, etc."
                  value={formData.specification}
                  onChange={handleChange}
                  className="min-h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleSelectChange(value, "unit")}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="kilograms">Kilograms</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="cubic-meters">Cubic Meters</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Requested By Date *</Label>
                  <Input
                    id="requestedDate"
                    name="requestedDate"
                    type="date"
                    value={formData.requestedDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                <Input
                  id="deliveryLocation"
                  name="deliveryLocation"
                  placeholder="e.g., Downtown Site"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Specification Documents</CardTitle>
              <CardDescription>Upload technical specifications (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="spec-file"
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="spec-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{specFile?.name || "Click to upload"}</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/contractor/procurement" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Create Request
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
