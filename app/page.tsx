"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Building2, ShoppingCart, TrendingUp, Users, ChevronRight, Briefcase, FileText, CheckCircle, Shield, Menu, X, Globe, Lock, Activity } from "lucide-react"
import { useProjects } from "@/lib/project-context"
import { formatNaira, formatDateTime } from "@/lib/utils"

async function getProcurements() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/procurements/public`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default function Home() {
  const router = useRouter()
  const { projects } = useProjects()
  const [procurements, setProcurements] = useState<any[]>([])
  const activeProjects = projects
    .filter((p) => p.status === "Published" || p.status === "Bidding")
    .sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime()
      const bd = new Date(b.createdAt || 0).getTime()
      return bd - ad
    })
    .slice(0, 5)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/procurements/public")
        if (res.ok) {
          const items = await res.json()
          if (Array.isArray(items)) setProcurements(items)
        }
      } catch {}
    }
    void load()
  }, [])

  const availableProcurements = procurements
    .filter((p) => String(p.status || "").toLowerCase() === "open")
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-justify">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={process.env.NEXT_PUBLIC_LOGO_URL || "/icon.sg.png"}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement
                  if (img.src.endsWith("/icon.sg.png")) img.src = "/icon.svg.png"
                }}
                alt="O-BIS"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <h1 className="text-2xl font-bold text-foreground">O-BIS</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-primary/50">
                Features
              </a>
              <a href="#projects" className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-primary/50">
                Projects
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-primary/50">
                About
              </a>
            </nav>
            <div className="flex gap-3">
              <Link href="/auth/sign-in">
                <Button variant="outline" className="transition-transform duration-300 hover:scale-[1.02] bg-transparent">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02]">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="space-y-6 mb-12">
          <div className="inline-block">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              Building Intelligence System
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight text-balance">
            Business Intelligence Suite for Construction & Procurement
          </h2>
          <p className="text-xl md:text-[1.25rem] text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            O-BIS: Construction meets Clarity | <span className="italic">Powered by Open-eye Africa Technologies</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/auth/sign-in">
            <Button className="bg-primary hover:bg-primary/90 px-8 py-6 text-base shadow-sm transition-transform duration-300 hover:scale-[1.02]">
              Manager Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/contractor/sign-in">
            <Button variant="outline" className="px-8 py-6 text-base border-border/50 bg-transparent transition-transform duration-300 hover:scale-[1.02]">
              Contractor Portal
              <Briefcase className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/vendor/sign-in">
            <Button variant="outline" className="px-8 py-6 text-base border-border/50 bg-transparent transition-transform duration-300 hover:scale-[1.02]">
              Vendor Portal
              <ShoppingCart className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/bid">
            <Button variant="outline" className="px-8 py-6 text-base border-border/50 bg-transparent transition-transform duration-300 hover:scale-[1.02]">
              Submit Bid
              <Briefcase className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mt-16 pt-16 border-t border-border/30">
          <Card className="bg-card/60 border-border/40 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold text-primary">1000+</p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border/40 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold text-primary">₦200.5B</p>
              <p className="text-sm text-muted-foreground">Total Value Managed</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border/40 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Verified Vendors</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">Transform How You Build</h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">The Future of Construction & Procurement Management</p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">O-BIS is a modern, end-to-end construction and procurement management ecosystem designed to bring transparency, structure, and efficiency to every stage of project delivery. Built by Open-eye Africa Technologies, it connects project owners, contractors, and vendors on a single, unified digital platform making construction management simpler, faster, and more accountable.</p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">From tendering to contract award, daily site reporting, procurement, and milestone-based payments, O-BIS provides the digital backbone your organization needs to manage projects with confidence, full visibility, and verified quality.</p>
          </div>
          <Card className="bg-card/60 border-border/50 transition-all hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Why O-BIS?</CardTitle>
              <CardDescription>Purpose-built to streamline complex delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Single-Source Management</p>
                  <p className="text-sm text-muted-foreground">One platform to manage all stakeholders, documents, and workflows.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Data-Driven Decisions</p>
                  <p className="text-sm text-muted-foreground">Instant insights into project progress, risks, and budgets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Secure & Compliant</p>
                  <p className="text-sm text-muted-foreground">Escrow-backed payments, audit-ready records, and compliance tracking.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Collaboration Made Easy</p>
                  <p className="text-sm text-muted-foreground">Centralized tasks, notifications, and document sharing.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl md:text-5xl font-bold text-foreground">Key Features</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage construction projects with transparency and control
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              title: "Smart Project Dashboard",
              description: "Instant visibility into milestones, budgets, risks, and progress",
            },
            {
              icon: ShoppingCart,
              title: "Digital Procurement Suite",
              description: "Public RFQs, vendor quotes, compliance checks, and award flows",
            },
            {
              icon: null,
              title: "Escrow-Backed Payments",
              description: "₦-first settlements with rule-based disbursement tied to milestones",
            },
            {
              icon: FileText,
              title: "Document Center",
              description: "Versioned storage, controlled access, and audit-ready records",
            },
            {
              icon: Users,
              title: "Collaboration Hub",
              description: "Tasks, comments, and notifications for fast team alignment",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="bg-card/40 border-border/50 transition-all hover:shadow-xl hover:-translate-y-0.5">
              <CardHeader>
                {feature.icon ? (
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                ) : (
                  <div className="w-10 h-10 mb-4 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                    ₦
                  </div>
                )}
                <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Portals Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl md:text-5xl font-bold text-foreground">Access Your Portal</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">Choose your role to access the right tools</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Manager Portal */}
          <Card className="bg-card/60 border-primary/30 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Manager Portal</CardTitle>
              <CardDescription>Create projects, manage bids, and oversee procurement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>Create and publish projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>Manage bids and contractors</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>Approve procurement requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>Control escrow payments</span>
                </li>
              </ul>
              <Link href="/auth/sign-in" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02]">
                  Go to Manager Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contractor Portal */}
          <Card className="bg-card/60 border-secondary/30 hover:border-secondary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Contractor Portal</CardTitle>
              <CardDescription>File complaints, daily reports, and manage bids</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-secondary" />
                  <span>Access dashboard and project tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-secondary" />
                  <span>Submit daily reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-secondary" />
                  <span>File and track complaints</span>
                </li>
              </ul>
              <Link href="/contractor/sign-in" className="w-full">
                <Button variant="outline" className="w-full bg-transparent transition-transform duration-300 hover:scale-[1.02]">
                  Go to Contractor Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Procurement Portal */}
          <Card className="bg-card/60 border-accent/30 hover:border-accent/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">Procurement Portal</CardTitle>
              <CardDescription>Submit quotes on available projects - No login required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>Respond to RFQs</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>Submit competitive quotes</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>Manage order fulfillment</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>Track payment status</span>
                </li>
              </ul>
              <Link href="/public-procurement" className="w-full">
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5 bg-transparent transition-transform duration-300 hover:scale-[1.02]">
                Access Procurement Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
          </Card>
          {/* Vendor Portal */}
          <Card className="bg-card/60 border-accent/30 hover:border-accent/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">Vendor Portal</CardTitle>
              <CardDescription>Manage quotations and deliveries after signup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>View and manage your quotes</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-accent" />
                  <span>Track deliveries and payment status</span>
                </li>
              </ul>
              <Link href="/vendor/sign-in" className="w-full">
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5 bg-transparent transition-transform duration-300 hover:scale-[1.02]">
                  Go to Vendor Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bid Submission CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <h4 className="text-2xl font-bold text-foreground">Ready to Submit a Bid?</h4>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse available projects and submit your bids to win construction contracts
          </p>
              <Link href="/bid">
                <Button className="bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02]">
                  View Available Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
      </section>

      {/* Recent Projects Section */}
      <section id="projects" className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold text-foreground">Active Projects</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">Browse recent projects and submit your bids</p>
        </div>

        <div className="grid gap-4">
          {activeProjects.length > 0 ? (
            activeProjects.map((project) => (
              <Card key={project.id} className="bg-card/50 border-border/40 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold text-primary">{formatNaira(project.budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bids</p>
                          <p className="font-semibold">{project.bids ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-semibold text-accent">{project.status}</p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/bid/${project.id}`}>
              <Button className="bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02]">
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active projects available for bidding</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center pt-8">
          <Link href="/bid">
            <Button variant="outline" size="lg" className="transition-transform duration-300 hover:scale-[1.02] bg-transparent">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Available Procurements Section */}
      <section id="procurements" className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold text-foreground">Available Procurement Requests</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">Browse public RFQs and submit vendor quotes</p>
        </div>

        <div className="grid gap-4">
          {availableProcurements.length > 0 ? (
            availableProcurements.map((rq) => (
              <Card key={rq.id} className="bg-card/50 border-border/40 hover:border-accent/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{rq.item}</h4>
                      <p className="text-sm text-muted-foreground">{rq.specification}</p>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-semibold">{rq.quantity} {rq.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivery</p>
                          <p className="font-semibold">{rq.deliveryLocation || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Requested</p>
                          <p className="font-semibold">{formatDateTime(rq.requestedDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quotes</p>
                          <p className="font-semibold">{Array.isArray(rq.quotes) ? rq.quotes.length : 0}</p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/public-procurement/${rq.id}`}>
                      <Button className="bg-accent hover:bg-accent/90 transition-transform duration-300 hover:scale-[1.02]">
                        View RFQ
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card/50 border-border/40">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No public procurement requests available</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center pt-8">
          <Link href="/public-procurement">
            <Button variant="outline" size="lg" className="transition-transform duration-300 hover:scale-[1.02] bg-transparent">
              View All Procurements
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 space-y-8 text-center">
        <div className="space-y-4">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">Transform How You Build</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            O-BIS empowers forward-thinking organizations to deliver projects on time, within budget, with verified
            quality, and under full compliance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/manager/dashboard">
            <Button className="bg-primary hover:bg-primary/90 px-8 py-6 text-base transition-transform duration-300 hover:scale-[1.02]">
              Start Managing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-bold">O-BIS</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Open-eye Build Intelligence System for end-to-end Nigerian construction delivery.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/auth/sign-in" className="hover:text-foreground transition-colors">
                      Manager Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/public-procurement" className="hover:text-foreground transition-colors">
                      Procurement Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/bid" className="hover:text-foreground transition-colors">
                      Bid System
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/login" className="hover:text-foreground transition-colors">
                      Admin
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>2025 Open-eye Africa Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
