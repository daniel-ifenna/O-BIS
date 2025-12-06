/**
 * Export Utilities for generating Excel and PDF reports
 * Handles daily reports, financial summaries, and transaction exports
 */

/**
 * Generate Excel file for daily reports
 * Uses simple CSV format that opens as Excel
 */
export function generateDailyReportsExcel(reports: any[], projectTitle: string): Blob {
  // CSV header
  const headers = [
    "Date",
    "Time",
    "Crew/Contractor",
    "Crew Chief",
    "Total Personnel",
    "Work Description",
    "Work Progress %",
    "Safety Incidents",
    "QA Issues",
  ]

  // Convert reports to CSV rows
  const rows = reports.map((report) => [
    report.date,
    report.time,
    report.crew,
    report.crewChief,
    report.totalPersonnel,
    `"${report.workDescription}"`, // Wrap in quotes to handle commas
    report.workPercentage,
    report.safetyIncidents,
    report.qaIssues,
  ])

  // Build CSV content
  const csvContent = [
    `Daily Reports - ${projectTitle}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  // Create blob
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
}

/**
 * Generate Excel file for financial summary
 */
export function generateFinancialSummaryExcel(
  projectTitle: string,
  financialData: {
    totalBudget: number
    totalSpent: number
    pendingPayments: number
    completedPayments: number
    contingencyUsed: number
    contingencyPercent: number
    transactions: any[]
    paymentRequests: any[]
  },
): Blob {
  const {
    totalBudget,
    totalSpent,
    pendingPayments,
    completedPayments,
    contingencyUsed,
    contingencyPercent,
    transactions,
    paymentRequests,
  } = financialData

  // Calculate variance
  const variance = totalBudget - totalSpent
  const percentUsed = ((totalSpent / totalBudget) * 100).toFixed(2)

  // Summary section
  const summaryRows = [
    ["Financial Summary - " + projectTitle],
    ["Generated:", new Date().toLocaleString()],
    [""],
    ["Metric", "Amount (₦)"],
    ["Total Budget", totalBudget.toLocaleString()],
    ["Total Spent", totalSpent.toLocaleString()],
    ["Pending Approval", pendingPayments.toLocaleString()],
    ["Completed Payments", completedPayments.toLocaleString()],
    ["Remaining Budget", variance.toLocaleString()],
    ["% Budget Used", percentUsed + "%"],
    ["Contingency Allocated", (totalBudget * (contingencyPercent / 100)).toLocaleString()],
    ["Contingency Used", contingencyUsed.toLocaleString()],
  ]

  // Transactions section
  const transactionHeaders = ["Date", "Type", "Project/Requester", "Amount (₦)", "Description"]
  const transactionRows = transactions.map((tx) => [tx.date, tx.type, tx.projectId, tx.amount, tx.description])

  // Payment requests section
  const paymentHeaders = ["Date", "Requester", "Type", "Amount (₦)", "Status"]
  const paymentRows = paymentRequests.map((pr) => [pr.requestedAt, pr.requesterName, pr.type, pr.amount, pr.status])

  // Build CSV content
  const csvContent = [
    // Summary
    ...summaryRows.map((row) => row.join(",")),
    "",
    "",
    "Transaction History",
    transactionHeaders.join(","),
    ...transactionRows.map((row) => row.join(",")),
    "",
    "",
    "Payment Requests",
    paymentHeaders.join(","),
    ...paymentRows.map((row) => row.join(",")),
  ].join("\n")

  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
}

/**
 * Generate Excel file for transaction history
 */
export function generateTransactionExcel(transactions: any[], projectTitle: string): Blob {
  const headers = ["Date", "Time", "Type", "Amount (₦)", "Related Project", "Status", "Description"]

  const rows = transactions.map((tx) => [
    tx.date,
    tx.time || "",
    tx.type,
    tx.amount,
    tx.projectId,
    tx.status || "Completed",
    tx.description,
  ])

  const csvContent = [
    `Transaction History - ${projectTitle}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
    "",
    `Total Transactions: ${rows.length}`,
    `Total Amount: ₦${rows.reduce((sum, row) => sum + Number.parseFloat(row[3].replace(/[^0-9.-]+/g, "")), 0).toLocaleString()}`,
  ].join("\n")

  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
}

/**
 * Download blob as file
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format file name with timestamp
 */
export function formatFileName(baseFileName: string, format: "csv" | "xlsx" = "csv"): string {
  const timestamp = new Date().toISOString().split("T")[0]
  return `${baseFileName}_${timestamp}.${format === "xlsx" ? "xlsx" : "csv"}`
}
