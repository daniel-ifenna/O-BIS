"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowUpRight, Building2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/utils"
import useSWR from "swr"

export default function WithdrawPage() {
  const { user, getAuthToken } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${getAuthToken()}` } }).then((r) => r.json())
  const { data: wallet } = useSWR(user?.id ? `/api/wallet/${user.id}` : null, fetcher)

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setIsLoading(true)
    try {
      const token = getAuthToken()
      const res = await fetch("/api/payments/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          bankName,
          accountNumber,
        }),
      })

      if (res.ok) {
        toast({ title: "Withdrawal Requested", description: `Request for ${formatNaira(Number(amount))} sent successfully.` })
        setAmount("")
        setBankName("")
        setAccountNumber("")
      } else {
        const err = await res.json()
        throw new Error(err.error || "Withdrawal failed")
      }
    } catch (error: any) {
      toast({ title: "Request Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="bg-card/60 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-primary" />
            <CardTitle>Withdraw Funds</CardTitle>
          </div>
          <CardDescription>Transfer funds from your wallet to your bank account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-primary">{wallet?.balance ? formatNaira(wallet.balance) : "..."}</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (NGN)</Label>
              <Input
                type="number"
                min="100"
                max={wallet?.balance || 0}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="e.g. GTBank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={10}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !amount || Number(amount) > (wallet?.balance || 0)}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Processing..." : "Withdraw Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
