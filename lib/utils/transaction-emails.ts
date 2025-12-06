import { type EmailContent } from "./email-templates"

function nowTs() { return new Date().toLocaleString() }
function wrap(subject: string, title: string, body: string, preheader?: string) {
  const ph = preheader || subject
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f7f7;font-family:Inter,Arial,sans-serif;color:#1f2937"><div style="display:none;max-height:0;overflow:hidden">${ph}</div><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7"><tr><td align="center" style="padding:24px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb"><tr><td style="padding:24px;border-bottom:1px solid #e5e7eb"><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:8px;background:#ea580c"></div><div style="font-weight:700;color:#0f172a">Open-Eye Africa Technologies – O-BIS</div></div></td></tr><tr><td style="padding:24px"><h2 style="margin:0 0 8px 0;color:#0f172a">${title}</h2>${body}<div style="margin-top:16px;color:#6b7280;font-size:12px">Timestamp: ${nowTs()}</div></td></tr><tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px">© ${new Date().getFullYear()} Open-Eye Africa Technologies. All rights reserved.</td></tr></table></td></tr></table></body></html>`
}

function currency(amount: number | string) {
  const n = Number(amount || 0)
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n)
  } catch {
    return `₦${n.toFixed(2)}`
  }
}

export function depositSuccessEmail(params: { name: string; amount: number | string; reference: string; newBalance?: number | string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Deposit Successful"
  const content = `<p>Dear ${params.name},</p><p>We have successfully processed your deposit of <strong>${amt}</strong>.</p><p>Reference: ${params.reference}</p>${params.newBalance ? `<p>Your new wallet balance is <strong>${currency(params.newBalance)}</strong>.</p>` : ""}<p>Thank you for using O-BIS.</p><p>Best regards,<br>O-BIS Management Team</p>`
  return { subject, html: wrap(subject, "Deposit Confirmed", content), text: `Dear ${params.name},\nDeposit of ${amt} successful.\nRef: ${params.reference}\nBest regards,\nO-BIS Management Team` }
}

export function withdrawRequestEmail(params: { name: string; amount: number | string; bankName: string; accountNumber: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Withdrawal Request Received"
  const content = `<p>Dear ${params.name},</p><p>We have received your request to withdraw <strong>${amt}</strong> to your bank account.</p><ul><li>Bank: ${params.bankName}</li><li>Account: ${params.accountNumber}</li></ul><p>This request is being processed and funds will be disbursed shortly.</p><p>Best regards,<br>O-BIS Management Team</p>`
  return { subject, html: wrap(subject, "Withdrawal Processing", content), text: `Dear ${params.name},\nWithdrawal request for ${amt} received.\nBest regards,\nO-BIS Management Team` }
}

export function withdrawProcessedEmail(params: { name: string; amount: number | string; reference: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Withdrawal Processed"
  const content = `<p>Dear ${params.name},</p><p>Your withdrawal of <strong>${amt}</strong> has been successfully processed and sent to your bank account.</p><p>Transaction Ref: ${params.reference}</p><p>Please allow up to 24 hours for the funds to reflect.</p><p>Best regards,<br>O-BIS Management Team</p>`
  return { subject, html: wrap(subject, "Withdrawal Complete", content), text: `Dear ${params.name},\nWithdrawal of ${amt} processed.\nRef: ${params.reference}\nBest regards,\nO-BIS Management Team` }
}
