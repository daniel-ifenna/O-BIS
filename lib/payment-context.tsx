"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { PaymentRequest } from "@/lib/database-schema"

interface PaymentContextType {
  payments: PaymentRequest[]
  refresh: () => Promise<void>
  getPaymentRequest: (id: string) => PaymentRequest | undefined
  getPendingRequests: () => PaymentRequest[]
  getHistory: () => PaymentRequest[]
  approvePayment: (id: string, reason?: string) => Promise<void>
  declinePayment: (id: string, reason?: string) => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<PaymentRequest[]>([])

  const getToken = () => {
    if (typeof window === "undefined") return ""
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("managerToken") ||
      ""
    )
  }

  const refresh = async () => {
    try {
      const token = getToken()
      const res = await fetch("/api/manager/payments/requests", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (res.ok) {
        const items = await res.json()
        if (Array.isArray(items)) setPayments(items)
      }
    } catch {}
  }

  useEffect(() => {
    void refresh()
  }, [])

  const approvePayment = async (id: string, reason?: string) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/manager/payments/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: "APPROVED", reason }),
      })
      if (res.ok) await refresh()
    } catch {}
  }

  const getPaymentRequest = (id: string) => payments.find((p) => p.id === id)

  const getPendingRequests = () => payments.filter((p) => p.status === "Pending")

  const getHistory = () => payments.filter((p) => p.status !== "Pending")

  const declinePayment = async (id: string, reason?: string) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/manager/payments/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: "REJECTED", reason }),
      })
      if (res.ok) await refresh()
    } catch {}
  }

  return (
    <PaymentContext.Provider
      value={{
        payments,
        refresh,
        getPaymentRequest,
        getPendingRequests,
        getHistory,
        approvePayment,
        declinePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayments() {
  const ctx = useContext(PaymentContext)
  if (!ctx) {
    throw new Error("usePayments must be used within PaymentProvider")
  }
  return ctx
}
