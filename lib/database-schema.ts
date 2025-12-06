/**
 * DATABASE SCHEMA DEFINITIONS
 *
 * This file defines the complete data models for the Construction Platform.
 * These models should be implemented in a production database (PostgreSQL/MongoDB)
 * Currently using mock data with localStorage for demonstration.
 */

// ============================================================================
// EXISTING MODELS
// ============================================================================

export interface User {
  id: string
  name: string
  email: string
  role: "manager" | "contractor" | "vendor"
  company?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string | number
  title: string
  location: string
  budget: string
  status: "Published" | "Bidding" | "Awarded" | "In Progress" | "Completed"
  bids: number
  createdAt: string
  estimatedCost: string
  contingency: string
  contingencyPercent: string
  paymentSchedule: string
  paymentTerms: string
  retentionPercent: string
  category?: string
  description?: string
  detailedDescription?: string
  managerId: string // Link to manager who created it
  contractorId?: string // Link to awarded contractor
  bidDays?: number
  acceptedBidDays?: number
  maxBids?: number
  clientName?: string
  clientCompany?: string
  documents?: {
    itb?: string
    itbUrl?: string
    specs?: string
    specsUrl?: string
    boq?: string
    boqUrl?: string
    financial?: string
    financialUrl?: string
  }
}

export interface Milestone {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  weight: number // Percentage
  progress: number
  status: "Pending" | "In Progress" | "Completed"
}

export interface Bid {
  id: string
  projectId: string
  contractorId: string
  bidderName: string
  companyName: string
  email: string
  phone: string
  address: string
  amount: string | number
  duration: string | number
  message: string
  proposalText?: string
  status: "New" | "Reviewed" | "Accepted" | "Rejected" | "Awarded"
  submittedAt: string
  reviewedAt?: string
  recordDate?: string
  recordTime?: string
  contractSent?: boolean
  contractSentAt?: string
  subcontractors?: { name: string; company: string; scope: string }[]
  uploads?: {
    proposal?: string[]
    profile?: string[]
    specs?: string[]
    tax?: string[]
    bond?: string[]
    additional?: string[]
  }
}

export interface PaymentRequest {
  id: string
  projectId: string
  projectName?: string
  requesterRole: "contractor" | "vendor"
  requesterId: string
  requesterName: string
  amount: string
  type: "Milestone Completion" | "Delivery Confirmation"
  milestone?: string
  proofUrl: string
  status: "Pending" | "Approved" | "Declined" | "Paid"
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  recordDate?: string
  recordTime?: string
  accountMasked?: string
}

export interface Transaction {
  id: string
  userId: string
  type: "received" | "requested" | "withdrawn" | "refunded"
  amount: string
  projectId: string
  date: string
  description: string
  paymentRequestId?: string
  recordDate?: string
  recordTime?: string
}

export interface DailyReport {
  id: string
  projectId: string
  contractorId: string
  date: string
  time: string
  crew: string
  crewChief: string
  totalPersonnel: number
  workDescription: string
  workPercentage: number
  safetyIncidents: number
  qaIssues: number
  attachments?: string[] // File URLs
}

// removed duplicate Milestone definition; using the one above with startDate/endDate and status "Completed"

// ============================================================================
// NEW MODELS FOR PUBLIC PROCUREMENT
// ============================================================================

/**
 * PUBLIC PROCUREMENT REQUEST
 * Available to public vendors without authentication
 * Created by contractors for material/service procurement
 */
export interface PublicProcurementRequest {
  id: string
  projectId: string
  contractorId: string
  item: string
  specification: string
  quantity: number
  unit: "pieces" | "kilograms" | "meters" | "cubic-meters" | "liters" | "hours"
  deliveryLocation: string
  requestedDate: string
  status: "open" | "quoted" | "awarded" | "delivered" | "closed"
  createdAt: string
  publicUrl: string // Unique public URL for vendors
  quotes: Quote[]
  selectedQuoteId?: string
  isPublic: boolean // Toggle for public visibility
  recordDate?: string
  recordTime?: string
}

/**
 * VENDOR QUOTE
 * Submitted by vendors in response to procurement requests
 */
export interface Quote {
  id: string
  procurementRequestId: string
  vendorId: string
  vendorName: string
  vendorEmail: string
  vendorPhone: string
  pricePerUnit: string
  totalPrice: string
  deliveryDays: number
  deliveryDate: string
  submittedAt: string
  status: "pending" | "selected" | "rejected"
  proposalUrl?: string
  complianceScore?: string
  notes?: string
  recordDate?: string
  recordTime?: string
}

/**
 * VENDOR PROFILE
 * Created when vendor signs up through public portal
 */
export interface VendorProfile {
  id: string
  userId: string
  email: string
  companyName: string
  businessRegistration: string
  phone: string
  address: string
  city: string
  state: string
  categories: string[] // Types of goods/services supplied
  certifications?: string[] // ISO, quality certifications
  rating: number // Average rating 1-5
  completedDeliveries: number
  createdAt: string
  updatedAt: string
  documents?: {
    businessLicense?: string
    tax?: string
    insurance?: string
  }
}

// ============================================================================
// NEW MODEL FOR CONTRACTOR COMPLAINTS
// ============================================================================

/**
 * CONTRACTOR COMPLAINT
 * Filed by contractors regarding project issues, vendor performance, etc.
 * Sent directly to project manager for review
 */
export interface ContractorComplaint {
  id: string
  projectId: string
  contractorId: string
  contractorName: string
  managerId: string
  category: "vendor-performance" | "quality-issue" | "safety-concern" | "payment-delay" | "other"
  subject: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  attachments?: string[] // File URLs
  status: "open" | "acknowledged" | "investigating" | "resolved" | "closed"
  filedAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolution?: string
  resolvedAt?: string
  feedback?: string // Contractor feedback on resolution
}

/**
 * COMPLAINT ACTIVITY LOG
 * Tracks manager actions and status updates on complaints
 */
export interface ComplaintActivity {
  id: string
  complaintId: string
  managerId: string
  action: "created" | "acknowledged" | "assigned" | "updated" | "resolved"
  notes: string
  timestamp: string
  attachments?: string[]
}

// ============================================================================
// ENHANCED MODELS FOR DATA LINKING & REPORTING
// ============================================================================

/**
 * PROJECT LINK RECORD
 * Ensures contractor dashboards are linked to manager project data
 */
export interface ProjectLink {
  projectId: string
  managerId: string
  contractorId: string
  role: "awarded-contractor" | "involved-vendor" | "observer"
  startDate: string
  endDate?: string
  status: "active" | "completed" | "terminated"
}

/**
 * FINANCIAL SUMMARY FOR EXPORT
 * Used for Excel/PDF report generation
 */
export interface FinancialSummary {
  projectId: string
  projectTitle: string
  totalBudget: number
  totalSpent: number
  pendingPayments: number
  completedPayments: number
  contingencyUsed: number
  variance: number
  transactions: Transaction[]
  paymentRequests: PaymentRequest[]
}

/**
 * REPORT EXPORT METADATA
 * Tracks generated reports for audit
 */
export interface ReportExport {
  id: string
  projectId: string
  requestedBy: string
  requestedByRole: "contractor" | "manager"
  reportType: "daily-reports" | "financial-summary" | "project-overview" | "vendor-performance"
  format: "excel" | "pdf" | "csv"
  generatedAt: string
  fileUrl: string
  expiresAt: string
}

// ============================================================================
// DATABASE SCHEMA SUMMARY
// ============================================================================

/**
 * TABLES TO CREATE IN PRODUCTION DATABASE:
 *
 * ✅ EXISTING (Already referenced in code):
 * - users (id, name, email, role, company, createdAt, updatedAt)
 * - projects (id, title, location, budget, status, managerId, contractorId, ...)
 * - milestones (id, projectId, name, startDate, endDate, weight, progress, status)
 * - bids (id, projectId, contractorId, bidderName, amount, status, ...)
 * - payment_requests (id, projectId, requesterRole, requesterId, amount, status, ...)
 * - transactions (id, userId, type, amount, projectId, date, ...)
 * - daily_reports (id, projectId, contractorId, date, crew, workDescription, ...)
 *
 * 🆕 NEW - PUBLIC PROCUREMENT:
 * - public_procurements (id, projectId, contractorId, item, quantity, isPublic, ...)
 * - quotes (id, procurementRequestId, vendorId, pricePerUnit, status, ...)
 * - vendor_profiles (id, userId, companyName, businessReg, categories, rating, ...)
 * - vendor_certifications (vendorId, certificationName, certificationUrl, ...)
 * - vendor_ratings (vendorId, projectId, rating, comment, submittedBy, ...)
 *
 * 🆕 NEW - COMPLAINTS:
 * - contractor_complaints (id, projectId, contractorId, managerId, category, status, ...)
 * - complaint_activities (id, complaintId, managerId, action, notes, timestamp, ...)
 * - complaint_attachments (id, complaintId, fileUrl, uploadedAt, ...)
 *
 * 🆕 NEW - REPORTING & EXPORT:
 * - project_links (projectId, managerId, contractorId, role, status, ...)
 * - report_exports (id, projectId, requestedBy, reportType, format, fileUrl, ...)
 *
 * 📊 INDEXES TO CREATE:
 * - projects: (managerId), (contractorId), (status)
 * - public_procurements: (isPublic), (status), (createdAt)
 * - quotes: (procurementRequestId), (vendorId), (status)
 * - contractor_complaints: (projectId), (contractorId), (managerId), (status)
 * - transactions: (userId), (projectId), (date)
 */

// ============================================================================
// API ROUTES NEEDED
// ============================================================================

/**
 * ROUTES TO IMPLEMENT:
 *
 * PUBLIC PROCUREMENT:
 * - GET /api/procurements/public (list all public procurement requests)
 * - GET /api/procurements/public/:id (view single request details)
 * - POST /api/procurements/:id/quotes (vendor submit quote)
 * - GET /api/procurements/:id/quotes (get all quotes for request)
 *
 * VENDOR SIGNUP & PROFILE:
 * - POST /api/auth/vendor-signup (create vendor account)
 * - GET /api/vendor/profile/:id (get vendor profile)
 * - PUT /api/vendor/profile/:id (update vendor profile)
 * - GET /api/vendor/quotations (list vendor's quotes)
 * - PUT /api/vendor/quotations/:id (update quote status)
 *
 * CONTRACTOR COMPLAINTS:
 * - POST /api/complaints (contractor file complaint)
 * - GET /api/complaints/:projectId (list project complaints)
 * - GET /api/complaints/:id (get complaint details)
 * - PUT /api/complaints/:id/status (update complaint status)
 * - POST /api/complaints/:id/activities (log activity)
 *
 * REPORTING & EXPORT:
 * - POST /api/reports/generate (generate report in Excel/PDF)
 * - GET /api/reports/:projectId/daily-reports (download daily reports)
 * - GET /api/reports/:projectId/financial-summary (download financial data)
 * - GET /api/reports/:projectId/transactions (download transaction history)
 * - GET /api/reports/list (list all generated reports)
 *
 * MANAGER COMPLAINT DASHBOARD:
 * - GET /api/manager/complaints (list all complaints for manager's projects)
 * - GET /api/manager/complaints/:id/activity (get complaint activity history)
 * - PUT /api/manager/complaints/:id/acknowledge (mark as acknowledged)
 * - PUT /api/manager/complaints/:id/resolve (resolve complaint)
 */
