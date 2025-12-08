"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Briefcase, Activity, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!stats) return <div className="p-8">Failed to load dashboard data</div>

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Platform performance and key metrics</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{stats.stats.newUsersToday} today</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">+{stats.stats.newVendorsToday} today</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.totalManagers}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.transactionsToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Pending / Bidding</p>
                  <p className="text-sm text-muted-foreground">Awaiting contractors</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats.stats.projectsPending}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Ongoing</p>
                  <p className="text-sm text-muted-foreground">Active construction</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats.stats.projectsOngoing}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">Successfully delivered</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats.stats.projectsCompleted}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.projects.map((p: any) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.projects.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
