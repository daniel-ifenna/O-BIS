"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building2, Briefcase, Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Search, DollarSign, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  
  return (
    <div className="p-8 space-y-8 min-h-screen bg-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">Admin: {user?.email}</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 w-full max-w-5xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="transactions">Logs</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <FinancialsTab active={activeTab === "financials"} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab active={activeTab === "users"} />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <VendorsTab active={activeTab === "vendors"} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <ProjectsTab active={activeTab === "projects"} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab active={activeTab === "transactions"} />
        </TabsContent>
        <TabsContent value="awards" className="space-y-4">
          <AwardsTab active={activeTab === "awards"} />
        </TabsContent>
        <TabsContent value="contractors" className="space-y-4">
          <ContractorsTab active={activeTab === "contractors"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Sub-Components ---

function OverviewTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData("/api/admin/dashboard").then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-[500px] w-full" />
  if (!data) return <div>Failed to load data</div>

  const { stats, projects } = data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} sub={`+${stats.newUsersToday} today`} icon={Users} />
        <StatCard title="Active Vendors" value={stats.totalVendors} sub={`+${stats.newVendorsToday} today`} icon={Building2} />
        <StatCard title="Active Managers" value={stats.totalManagers} sub="Project Owners" icon={Briefcase} />
        <StatCard title="Transactions Today" value={stats.transactionsToday} sub="Volume" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="Pending / Bidding" value={stats.projectsPending} color="text-orange-500" />
            <StatusRow label="Ongoing" value={stats.projectsOngoing} color="text-blue-500" />
            <StatusRow label="Completed" value={stats.projectsCompleted} color="text-green-500" />
            <StatusRow label="New Today" value={stats.newProjectsToday} color="text-purple-500" />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.map((p: any) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.status} - {p.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-muted-foreground">No active projects</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FinancialsTab({ active }: { active: boolean }) {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    if (active) fetchData("/api/admin/financials").then(setData)
  }, [active])

  if (!data) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Volume" value={formatCurrency(data.totalVolume)} sub="All time transacted" icon={DollarSign} />
        <StatCard title="Revenue (Month)" value={formatCurrency(data.revenue.monthly)} sub="Last 30 days" icon={TrendingUp} />
        <StatCard title="Revenue (Today)" value={formatCurrency(data.revenue.daily)} sub="Last 24 hours" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Fee Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="Publishing Fees (1%)" value={formatCurrency(data.fees.publishing)} />
            <StatusRow label="Bidding Fees" value={formatCurrency(data.fees.bidding)} />
            <StatusRow label="Vendor Quote Fees" value={formatCurrency(data.fees.quote)} />
            <StatusRow label="Transfer Fees (₦55)" value={formatCurrency(data.fees.transfer)} />
            <StatusRow label="Subscriptions" value={formatCurrency(data.fees.subscription)} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Revenue Trends</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="Today" value={formatCurrency(data.revenue.daily)} />
            <StatusRow label="This Week" value={formatCurrency(data.revenue.weekly)} />
            <StatusRow label="This Month" value={formatCurrency(data.revenue.monthly)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersTab({ active }: { active: boolean }) {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (roleFilter && roleFilter !== "all") params.set("role", roleFilter)
    fetchData(`/api/admin/users?${params}`).then(setUsers)
  }

  useEffect(() => { if (active) load() }, [active, roleFilter])

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("auth_token")
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      load()
    } catch (e) { console.error(e) }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Directory</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="w-64" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="contractor">Contractors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={load}>Search</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell>{u.company || "-"}</TableCell>
                <TableCell>{u.subscriptionPlan || "-"}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "destructive"}>
                    {u.isActive ? "Active" : "Suspended"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(u.id, u.isActive)}>
                    {u.isActive ? "Suspend" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function VendorsTab({ active }: { active: boolean }) {
  const [vendors, setVendors] = useState<any[]>([])
  
  useEffect(() => { if (active) fetchData("/api/admin/vendors").then(setVendors) }, [active])

  return (
    <Card>
      <CardHeader><CardTitle>Vendor Monitoring</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Quotes</TableHead>
              <TableHead>Jobs Won</TableHead>
              <TableHead>Fees Paid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.email}</div>
                  </div>
                </TableCell>
                <TableCell>{v.company || "-"}</TableCell>
                <TableCell>{v.quotesSubmitted}</TableCell>
                <TableCell>{v.jobsWon}</TableCell>
                <TableCell>{formatCurrency(v.totalFees)}</TableCell>
                <TableCell><Badge variant="outline">{v.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ProjectsTab({ active }: { active: boolean }) {
  const [projects, setProjects] = useState<any[]>([])
  const [filter, setFilter] = useState("all")

  const load = () => {
    const url = filter === "all" ? "/api/admin/projects" : `/api/admin/projects?status=${filter}`
    fetchData(url).then(setProjects)
  }

  useEffect(() => { if (active) load() }, [active, filter])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Management</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Bidding">Bidding</SelectItem>
              <SelectItem value="Active">Active/Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Fees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.owner}</TableCell>
                <TableCell>{formatCurrency(p.budget)}</TableCell>
                <TableCell><Badge>{p.status}</Badge></TableCell>
                <TableCell>{p.progress}%</TableCell>
                <TableCell>{formatCurrency(p.feesCollected)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TransactionsTab({ active }: { active: boolean }) {
  const [logs, setLogs] = useState<any[]>([])
  const [controls, setControls] = useState<any>(null)
  const [pending, setPending] = useState<any[]>([])
  const [threshold, setThreshold] = useState<string>("")
  const [reports, setReports] = useState<any[]>([])
  const load = async () => {
    const data = await fetchData("/api/admin/transfers")
    setControls(data.controls)
    setPending(data.pending)
    setLogs(data.logs)
    setThreshold(String(data.controls?.suspiciousAmountThreshold || ""))
    try { const r = await fetchData("/api/admin/daily-reports"); setReports(r || []) } catch {}
  }
  useEffect(() => { if (active) load() }, [active])

  const toggleFreeze = async (freeze: boolean) => {
    const token = localStorage.getItem("auth_token")
    await fetch("/api/admin/transfers?action=freeze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ freeze, threshold }) })
    await load()
  }
  const actOn = async (id: string, action: "approve" | "decline") => {
    const token = localStorage.getItem("auth_token")
    await fetch(`/api/admin/transfers?action=${action}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
    await load()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction Logs</CardTitle>
            <CardDescription>Internal transfers with freeze and approval controls</CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Suspicious threshold (₦)" className="w-56" />
            <Button variant={controls?.freezeInternalTransfers ? "destructive" : "default"} onClick={() => toggleFreeze(!controls?.freezeInternalTransfers)}>
              {controls?.freezeInternalTransfers ? "Unfreeze Transfers" : "Freeze Transfers"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pending.length > 0 && (
          <div className="mb-6">
            <CardTitle className="text-base">Pending Internal Transfers</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{new Date(p.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{p.fromUserId}</TableCell>
                    <TableCell className="text-xs">{p.toUserId}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(p.amount)}</TableCell>
                    <TableCell>{p.flaggedLarge ? <Badge variant="destructive">Large</Badge> : <Badge variant="outline">Normal</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => actOn(p.id, "approve")}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => actOn(p.id, "decline")}>Decline</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Project</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-xs">{new Date(l.date).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="text-sm">{l.user}</div>
                  <div className="text-xs text-muted-foreground capitalize">{l.role}</div>
                </TableCell>
                <TableCell className="capitalize">{l.type}</TableCell>
                <TableCell className="capitalize">{l.feeType === 'none' ? '-' : l.feeType}</TableCell>
                <TableCell className="font-bold">{formatCurrency(l.amount)}</TableCell>
                <TableCell className="text-xs truncate max-w-[150px]">{l.project}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-8">
          <CardTitle className="text-base">Daily Reporting (Activity Logs)</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Work</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>QA</TableHead>
                <TableHead>Safety</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{r.date} {r.time}</TableCell>
                  <TableCell className="text-xs truncate max-w-[180px]">{r.project}</TableCell>
                  <TableCell className="text-xs">{r.contractor}</TableCell>
                  <TableCell className="text-xs truncate max-w-[240px]">{r.workDescription}</TableCell>
                  <TableCell className="font-semibold">{r.workPercentage}%</TableCell>
                  <TableCell className="text-xs">{r.qaIssues}</TableCell>
                  <TableCell className="text-xs">{r.safetyIncidents}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function AwardsTab({ active }: { active: boolean }) {
  const [awards, setAwards] = useState<any[]>([])
  useEffect(() => { if (active) fetchData("/api/admin/awards").then(setAwards) }, [active])
  return (
    <Card>
      <CardHeader><CardTitle>Contract Awards</CardTitle><CardDescription>Email delivery status and history</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs">{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{r.projectId}</TableCell>
                <TableCell>
                  <div className="text-sm">{r.contractorName || r.contractorEmail}</div>
                  <div className="text-xs text-muted-foreground">{r.contractorEmail}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === 'Awarded' ? 'default' : 'destructive'}>{r.status}</Badge>
                </TableCell>
                <TableCell>
                  {r.emailSent ? (
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Sent</span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600"><Clock className="w-4 h-4" /> Failed</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-destructive">{r.emailError || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ContractorsTab({ active }: { active: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    fetchData(`/api/admin/contractors?${params}`).then(setItems)
  }
  useEffect(() => { if (active) load() }, [active])
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Contractors</CardTitle>
            <CardDescription>Contact info, documents, awards, active jobs, performance, compliance</CardDescription>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Search contractors..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="w-64" />
            <Button onClick={load}>Search</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Awards</TableHead>
              <TableHead>Active Jobs</TableHead>
              <TableHead>Avg Progress</TableHead>
              <TableHead>Compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.company || '-'}</div>
                </TableCell>
                <TableCell className="text-xs">{c.email}</TableCell>
                <TableCell>{c.documents}</TableCell>
                <TableCell>{c.contractsAwarded}</TableCell>
                <TableCell>{c.activeJobs}</TableCell>
                <TableCell>{c.avgProgress}%</TableCell>
                <TableCell>
                  <Badge variant={c.compliance === 'compliant' ? 'default' : 'destructive'} className="capitalize">{c.compliance}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-6">
          <CardTitle className="text-base">Contracts</CardTitle>
          <div className="mt-2 space-y-2">
            {items.flatMap((c) => (c.contracts || []).map((p: any, i: number) => (
              <div key={`${c.id}-${p.id}-${i}`} className="text-sm flex justify-between p-2 bg-secondary/10 rounded">
                <span className="truncate max-w-[40%]">{p.title}</span>
                <span className="text-muted-foreground">{p.status}</span>
                <span className="text-muted-foreground">Manager: {p.manager || '-'}</span>
                <span className="font-semibold">{formatCurrency(p.budget)}</span>
              </div>
            )))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Helpers ---

async function fetchData(url: string) {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) return res.json()
  throw new Error("Failed to fetch")
}

function formatCurrency(val: any) {
  const num = Number(val || 0)
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(num)
}

function StatCard({ title, value, sub, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function StatusRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
      <span className="font-medium text-sm">{label}</span>
      <span className={`font-bold ${color || ""}`}>{value}</span>
    </div>
  )
}
