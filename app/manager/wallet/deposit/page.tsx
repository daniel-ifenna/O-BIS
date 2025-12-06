"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/utils"

export default function DepositPage() {
  const { user, getAuthToken } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("card")
  const [isLoading, setIsLoading] = useState(false)

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setIsLoading(true)
    try {
      // In a real app, you would initialize Paystack/Stripe popup here.
      // For this implementation, we will simulate a successful payment via our API.
      const token = getAuthToken()
      const res = await fetch("/api/payments/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          currency: "NGN",
        }),
      })

      if (res.ok) {
        toast({ title: "Deposit Successful", description: `${formatNaira(Number(amount))} has been added to your wallet.` })
        setAmount("")
        // Force refresh logic if needed
      } else {
        const err = await res.json()
        throw new Error(err.error || "Deposit failed")
      }
    } catch (error: any) {
      toast({ title: "Deposit Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="bg-card/60 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <CardTitle>Deposit Funds</CardTitle>
          </div>
          <CardDescription>Add money to your wallet to fund projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (NGN)</Label>
              <Input
                type="number"
                min="100"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Card Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !amount}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Processing..." : "Pay Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
