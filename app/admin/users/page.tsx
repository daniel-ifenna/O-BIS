"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserX, UserCheck, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<string>("all")
  const [search, setSearch] = useState("")

  const loadUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const query = new URLSearchParams()
      if (filterRole !== "all") query.set("role", filterRole)
      if (search) query.set("q", search)
      
      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
        loadUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [filterRole, search])

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
          <p className="text-muted-foreground">Manage all registered users on the platform</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="contractor">Contractors</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                        ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                          u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 
                          u.role === 'vendor' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>{u.company || "-"}</TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                         <UserX className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
