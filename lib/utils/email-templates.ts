export type EmailContent = { subject: string; html: string; text: string }
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

export function paymentApprovedEmail(params: { recipientName: string; amount: number | string; managerName: string; reference?: string; ctaLink?: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Payment Request Approved – Funds Released"
  const content = `<p>Dear ${params.recipientName},</p><p>We are pleased to inform you that your payment request for <strong>${amt}</strong> has been <strong>approved</strong> by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>The approved funds have now been credited to your wallet.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Payment Approved", content)
  const text = `Dear ${params.recipientName},\nYour payment request for ${amt} has been approved by ${params.managerName} and the funds have been credited to your wallet.\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}

export function paymentRejectedEmail(params: { recipientName: string; amount: number | string; managerName: string; reason: string; reference?: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Payment Request Update – Rejected"
  const content = `<p>Dear ${params.recipientName},</p><p>Your payment request for <strong>${amt}</strong> has unfortunately been <strong>rejected</strong> by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>Reason provided: ${params.reason}</p><p>You may contact your manager if you need further clarification.</p><p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Payment Rejected", content)
  const text = `Dear ${params.recipientName},\nYour payment request for ${amt} has been rejected by ${params.managerName}.\nReason: ${params.reason}\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}

export function internalTransferEmail(params: { recipientName: string; amount: number | string; managerName: string; reference?: string; ctaLink?: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Funds Transferred to Your Wallet"
  const content = `<p>Dear ${params.recipientName},</p><p>This is to notify you that <strong>${amt}</strong> has been transferred to your wallet by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>You can now view this amount in your wallet balance.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Wallet Credited", content)
  const text = `Dear ${params.recipientName},\n${amt} has been transferred to your wallet by ${params.managerName}.\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}

export function adminDepositEmail(params: { managerName: string; amount: number | string; reference?: string; ctaLink?: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Virtual Deposit Added to Your Wallet"
  const content = `<p>Dear ${params.managerName},</p><p>A virtual deposit of <strong>${amt}</strong> has been added to your wallet for administrative or project allocation purposes.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>This deposit was issued by the system administrator.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Wallet Credited", content)
  const text = `Dear ${params.managerName},\nA virtual deposit of ${amt} has been added to your wallet by the system administrator.\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}

export function shortlistedEmail(params: { contractorName: string; managerName: string; projectName: string; meetingLink: string; bidAmount?: number | string; duration?: number | string }): EmailContent {
  const amt = params.bidAmount != null ? currency(params.bidAmount) : "N/A"
  const subject = "You Have Been Shortlisted – Meeting Invitation"
  const content = `<p>Dear ${params.contractorName},</p><p>On behalf of ${params.managerName}, we are pleased to notify you that your bid for <strong>${params.projectName}</strong> has been <strong>shortlisted</strong>.</p><p>You are hereby invited to the scheduled meeting.</p><p><strong>Join the meeting:</strong> <a href="${params.meetingLink}">${params.meetingLink}</a></p><p><strong>Bid Amount:</strong> ${amt}<br><strong>Project Duration:</strong> ${params.duration ?? "N/A"}</p><p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Shortlisted – Meeting Invitation", content)
  const text = `Dear ${params.contractorName},\nOn behalf of ${params.managerName}, your bid for ${params.projectName} has been shortlisted.\nJoin meeting: ${params.meetingLink}\nBid amount: ${amt}\nDuration: ${params.duration ?? "N/A"}\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}

export function walletDebitedEmail(params: { recipientName: string; amount: number | string; managerName: string; reason?: string; reference?: string }): EmailContent {
  const amt = currency(params.amount)
  const subject = "Wallet Debited – Transfer Processed"
  const content = `<p>Dear ${params.recipientName},</p><p>Your wallet has been debited with <strong>${amt}</strong>${params.managerName ? ` by ${params.managerName}` : ""}.${params.reason ? ` Reason: ${params.reason}.` : ""}</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>If you did not expect this debit, please contact support.</p><p>Best regards,<br>O-BIS Management Team</p>`
  const html = wrap(subject, "Wallet Debited", content)
  const text = `Dear ${params.recipientName},\nYour wallet has been debited with ${amt}${params.managerName ? ` by ${params.managerName}` : ""}.${params.reason ? ` Reason: ${params.reason}.` : ""}\nBest regards,\nO-BIS Management Team`
  return { subject, html, text }
}
