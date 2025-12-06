import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const type = body.type || "financial-summary"
    if (type === "financial-summary") {
      const summary = body.summary || {}
      const transactions: any[] = Array.isArray(body.transactions) ? body.transactions : []
      const paymentRequests: any[] = Array.isArray(body.paymentRequests) ? body.paymentRequests : []

      const summaryRows = Object.entries(summary).map(([k, v]) => `${k},${v}`)
      const transactionHeaders = ["Date", "Type", "Project", "Amount", "Description"]
      const transactionRows = transactions.map((tx) => [tx.date, tx.type, tx.projectId, tx.amount, tx.description].join(","))
      const paymentHeaders = ["Date", "Requester", "Type", "Amount", "Status"]
      const paymentRows = paymentRequests.map((pr) => [pr.requestedAt, pr.requesterName, pr.type, pr.amount, pr.status].join(","))

      const csv = [
        ...summaryRows,
        "",
        "",
        "Transaction History",
        transactionHeaders.join(","),
        ...transactionRows,
        "",
        "",
        "Payment Requests",
        paymentHeaders.join(","),
        ...paymentRows,
      ].join("\n")

      return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
    }
    return NextResponse.json({ error: "Unsupported report type" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

