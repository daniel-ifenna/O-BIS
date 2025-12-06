# Construction Platform - Feature Implementation Guide

## Overview
This document outlines all new features to implement and how they connect to existing systems.

---

## 1. PUBLIC PROCUREMENT PORTAL & VENDOR SIGNUP

### Feature Requirements
- ✅ Public procurement requests visible without authentication
- ✅ Vendors can sign up through public portal
- ✅ Vendors get access to vendor portal after signup
- ✅ Vendors can view and quote on public procurement requests

### Data Flow
\`\`\`
Contractor Creates Procurement
  → Marks as "Public"
    → Appears in /vendor/public-procurements
      → Vendors Submit Quotes
        → Quotes appear in contractor's procurement page
          → Contractor selects vendor
            → Payment workflow begins
\`\`\`

### New Pages Needed
- `/vendor/public-procurements` - List of public procurement opportunities
- `/vendor/public-procurements/[id]` - Single procurement details + quote form
- `/auth/vendor-signup` - Public vendor registration
- `/vendor/my-quotations` - Vendor's submitted quotes

### Updated Pages
- `/contractor/procurement/page.tsx` - Add "Make Public" toggle to procurements

---

## 2. CONTRACTOR COMPLAINT FORM & COMPLAINT MANAGEMENT

### Feature Requirements
- ✅ Contractor portal has complaint form
- ✅ Complaints sent directly to project manager
- ✅ Manager can view all complaints in dashboard
- ✅ Manager can acknowledge, investigate, and resolve complaints

### Data Flow
\`\`\`
Contractor Files Complaint
  → Auto-routed to Project Manager
    → Manager Acknowledges Receipt
      → Manager Investigates
        → Manager Resolves + Provides Resolution
          → Contractor Receives Resolution
\`\`\`

### New Pages Needed
- `/contractor/complaints` - List contractor's complaints
- `/contractor/complaints/create` - File new complaint
- `/contractor/complaints/[id]` - View complaint details & history
- `/manager/complaints` - Manager dashboard for all complaints
- `/manager/complaints/[id]` - Review and resolve complaint

### New Components
- `ComplaintForm.tsx` - Form for contractors to file complaints
- `ComplaintCard.tsx` - Display complaint summary
- `ComplaintActivityLog.tsx` - Show complaint history and updates

---

## 3. CONTRACTOR-MANAGER DATA LINKING (VERIFICATION & ENHANCEMENT)

### Current Status
✅ Already linked via `ProjectContext` - projects belong to managers
✅ Contractor dashboards reference projects
⚠️ Need to enhance linking for:
  - Contractor daily reports linked to project → visible to manager
  - Payment requests linked to project → visible to manager
  - Procurement requests linked to project → visible to manager

### Enhancement Needed
\`\`\`
Update all data models to include:
- projectId (links to specific project)
- managerId (for permission checks)
- contractorId (for data filtering)

This ensures contractor input automatically appears in manager dashboard
\`\`\`

### Verification Checklist
- [ ] Daily reports include projectId (already done)
- [ ] Payment requests include projectId (already done)
- [ ] Procurement requests include projectId (already done)
- [ ] Manager dashboards filter data by their projects
- [ ] Real-time data sync between contractor and manager views

---

## 4. REPORT & FINANCIAL EXPORT (EXCEL/PDF)

### Feature Requirements
- ✅ Download all daily reports as Excel file
- ✅ Download all financial transactions as Excel file
- ✅ Financial summary includes budget vs actual
- ✅ Reports include contractor and manager data

### Export Types

#### A. Daily Reports Export
\`\`\`
Filename: {ProjectTitle}_Daily_Reports_{Date}.xlsx
Columns:
- Date
- Time
- Crew Chief
- Total Personnel
- Work Description
- Work Percentage
- Safety Incidents
- QA Issues
- Attachments (list)
\`\`\`

#### B. Financial Summary Export
\`\`\`
Filename: {ProjectTitle}_Financial_Summary_{Date}.xlsx
Sheets:
1. Summary (Budget, Spent, Pending, Completed)
2. All Transactions (Date, Type, Amount, Description)
3. Payment Requests (Requester, Amount, Status)
4. Variance Analysis
5. Monthly Breakdown
\`\`\`

### Technical Implementation
Use libraries:
- `xlsx` - For Excel generation
- `pdf-lib` or `jspdf` - For PDF generation
- `date-fns` - For date formatting

### New Pages Needed
- `/contractor/reports` - Dashboard to generate/download reports
- `/manager/reports/:projectId` - Reports for specific project

---

## 5. VERIFY CONTRACTOR-MANAGER DATA LINKAGE (DETAILED)

### Current Implementation Analysis

**Manager Dashboard receives data from:**
- Project context (manager's projects)
- Mock data in components

**Contractor Dashboard receives data from:**
- Project context (active projects)
- Mock data in components

### Enhancement Steps

1. **Add Real-Time Filtering**
   \`\`\`typescript
   // Manager sees only:
   - Their created projects
   - Associated contractor daily reports
   - Associated payment requests
   - Associated procurements
   
   // Contractor sees only:
   - Their active/awarded projects
   - Their own daily reports
   - Their own payment requests
   - Their own procurements
   \`\`\`

2. **Update Manager Dashboard to display:**
   - Latest contractor daily reports for each project
   - Pending payment requests from contractors
   - Procurement requests in progress
   - New complaints filed

3. **Update Contractor Dashboard to display:**
   - Project status from manager's perspective
   - Manager's approval status on reports
   - Manager's approval status on payments

---

## 6. SCHEMA & DATABASE IMPLEMENTATION PRIORITY

### Phase 1: Core (Foundation)
- Users (with roles)
- Projects with manager linkage
- Milestones
- Bids

### Phase 2: Procurement Enhancement
- Public Procurement Requests
- Quotes
- Vendor Profiles

### Phase 3: Complaints & Reporting
- Contractor Complaints
- Daily Reports (enhanced)
- Financial Transactions

### Phase 4: Export & Advanced Features
- Report Exports table
- Project Links table
- Vendor Ratings table

---

## 7. MOCK DATA VS PRODUCTION

### For Development/v0 Preview
- Use localStorage with mock data
- Implement data structures exactly as defined
- Focus on UI/UX and data flow

### For Production Database
- Use PostgreSQL or MongoDB
- Implement all indexes as defined
- Set up proper authentication
- Add file upload to cloud storage (AWS S3, Vercel Blob, etc.)

---

## 8. IMPLEMENTATION TIMELINE

### Week 1: Public Procurement
- Vendor signup flow
- Public procurement listing
- Quote submission

### Week 2: Complaints System
- Contractor complaint form
- Manager complaint dashboard
- Activity logging

### Week 3: Reporting & Export
- Daily report export
- Financial summary export
- Report generation utilities

### Week 4: Integration & Testing
- Contractor-manager data verification
- End-to-end testing
- Performance optimization

---

## 9. Key Files to Create/Update

### New Files to Create
\`\`\`
lib/
  ├── database-schema.ts (✅ already created)
  ├── mock-data.ts (create mock data store)
  ├── export-utils.ts (Excel/PDF generation)
  └── complaint-utils.ts (complaint logic)

app/
  ├── vendor/
  │   ├── public-procurements/
  │   │   ├── page.tsx
  │   │   └── [id]/page.tsx
  │   ├── my-quotations/page.tsx
  │   └── portal/page.tsx
  ├── auth/
  │   └── vendor-signup/page.tsx
  ├── contractor/
  │   ├── complaints/
  │   │   ├── page.tsx
  │   │   ├── create/page.tsx
  │   │   └── [id]/page.tsx
  │   └── reports/page.tsx
  ├── manager/
  │   ├── complaints/
  │   │   ├── page.tsx
  │   │   └── [id]/page.tsx
  │   └── reports/[projectId]/page.tsx
  └── api/
      ├── procurements/
      ├── quotes/
      ├── complaints/
      ├── reports/
      └── vendor/

components/
  ├── complaint-form.tsx
  ├── complaint-card.tsx
  ├── complaint-activity-log.tsx
  ├── report-generator.tsx
  └── public-procurement-card.tsx
\`\`\`

### Existing Files to Update
\`\`\`
app/contractor/procurement/page.tsx (add public toggle)
app/contractor/dashboard/page.tsx (add complaints widget)
app/manager/dashboard/page.tsx (add complaints + reports)
lib/project-context.tsx (enhance data linking)
app/layout.tsx (add vendor route protection)
\`\`\`

---

## 10. API Endpoints Priority

### Must Have
- POST /api/auth/vendor-signup
- GET /api/procurements/public
- POST /api/procurements/:id/quotes
- POST /api/complaints
- GET /api/reports/generate

### Should Have
- PUT /api/complaints/:id/status
- GET /api/manager/complaints
- GET /api/vendor/profile/:id

### Nice to Have
- POST /api/vendor/ratings
- GET /api/reports/list
- DELETE /api/complaints/:id

---

## Next Steps

1. ✅ Database schema defined (see database-schema.ts)
2. 🔄 Start building public procurement portal
3. 🔄 Implement vendor signup flow
4. 🔄 Add complaint form to contractor portal
5. 🔄 Build complaint management dashboard
6. 🔄 Implement Excel/PDF export utilities
7. 🔄 Verify and enhance data linking
8. 🔄 Test end-to-end workflows

---

## 6. Escrow Wallet System (Virtual Ledger)

### Architecture
- Virtual-only wallet and ledger using Prisma. No real payment rails.
- Funds movement represented as `EscrowWalletTransaction` rows; balances are derived.
- Works for managers, contractors, and vendors with role-based flows.

### Data Model & Balance
- Do not store a `balance` field; compute on demand: credits minus debits.
- Shared server function: `calculateWalletBalance(userId)` in `lib/server/payment-requests.ts:79–86`.

### API Endpoints
- `GET /api/wallet/[userId]` → Wallet summary using derived balance.
- `GET /api/wallet/[userId]/transactions` → Ledger entries sorted by date/time.
- `POST /api/admin/wallet/deposit` → Admin-only virtual funding for manager wallets (guarded by `x-admin-key`).
- `POST /api/wallet/internal-transfer` → Manager-only internal ledger transfer (atomic debit/credit).

### Manager Approval Flow
- On approval, atomically:
  - Debit manager wallet (`withdrawn`).
  - Credit requester wallet (`received`).
- Implemented in `app/api/manager/payments/requests/[id]/status/route.ts:39–65`.

### Admin Virtual Deposit
- Admin credits manager wallet using `x-admin-key` header equal to `ADMIN_API_KEY`.
- Implemented in `app/api/admin/wallet/deposit/route.ts`.

### Internal Transfer
- Manager-initiated; debits the manager and credits the recipient.
- Implemented in `app/api/wallet/internal-transfer/route.ts`.

### Email Templates & Notifications
- Standardized templates in `lib/utils/email-templates.ts`:
  - `paymentApprovedEmail`, `paymentRejectedEmail`, `internalTransferEmail`, `adminDepositEmail`, `shortlistedEmail`, `walletDebitedEmail`.
- All templates include branding, timestamp, optional references and CTA links.
- Routes using templates:
  - Admin deposit: `app/api/admin/wallet/deposit/route.ts:39–53`.
  - Internal transfer: `app/api/wallet/internal-transfer/route.ts:71–90`.
  - Approval/rejection: `app/api/manager/payments/requests/[id]/status/route.ts:70–98`.
  - Shortlisted invite: `lib/bid-review.ts:30–34`.

### Role Guards & Access Control
- Wallet summary/transactions: self or manager role.
- Internal transfer: manager-only.
- Payment approvals/rejections: manager-only.
- Admin deposit: admin-only via `x-admin-key`.

### Frontend Integration
- Contractor wallet: server-driven summary and ledger with virtual note.
- Vendor portal: balance card with virtual note.
- Manager dashboard: escrow balance and virtual wallet note.
- Headers typed as `Record<string,string>` for fetch calls.

### Environment
- Required SMTP env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Admin API key: `ADMIN_API_KEY`.
- Optional `NEXT_PUBLIC_BASE_URL` used to build CTA links in emails.

### Verification Checklist
- [ ] Lint/build succeed (`npm run lint`, `npm run build`).
- [ ] Wallet endpoints return accurate derived balances.
- [ ] Manager approvals create atomic debit/credit ledger entries.
- [ ] Admin deposit is enforced by key and creates credit ledger entry.
- [ ] Internal transfers restricted to managers; emails sent to both parties.
- [ ] Emails render with branding in HTML and provide plain text fallback.
- [ ] Frontend displays balances and ledgers without deposit/withdraw UI for non-admins.
