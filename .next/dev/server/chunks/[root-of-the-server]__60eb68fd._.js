module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const dbUrl = process.env.DATABASE_URL_PGBOUNCER || process.env.DATABASE_URL || "";
function createPrismaOrMock() {
    if (dbUrl) {
        return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
            datasources: {
                db: {
                    url: dbUrl
                }
            }
        });
    }
    const warn = (op)=>{
        throw new Error(`Database unavailable: set DATABASE_URL before calling ${op}`);
    };
    return new Proxy({}, {
        get (_, prop) {
            if (prop === "$use") return ()=>{};
            if (prop === "$transaction") return ()=>warn("$transaction");
            return ()=>warn(String(prop));
        }
    });
}
const prisma = globalForPrisma.prisma || createPrismaOrMock();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function fmtTime(d) {
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
}
const TARGET_MODELS = new Set([
    "User",
    "Contractor",
    "Vendor",
    "Manager",
    "Project",
    "Bid",
    "BidInvitation",
    "ProcurementRequest",
    "EscrowWalletTransaction",
    "FileStorageRecord",
    "PaymentRequest",
    "Milestone",
    "DailyReport",
    "VendorQuote"
]);
if (typeof prisma.$use === "function") prisma.$use(async (params, next)=>{
    const now = new Date();
    const date = fmtDate(now);
    const time = fmtTime(now);
    const modelMatches = TARGET_MODELS.has(params.model || "");
    const preventDeletes = String(process.env.ALLOW_DELETE || "").toLowerCase() !== "true";
    if (preventDeletes && (params.action === "delete" || params.action === "deleteMany")) {
        throw new Error("Delete operations are disabled");
    }
    if (modelMatches) {
        if (params.action === "create") {
            params.args.data = {
                ...params.args.data || {},
                recordDate: date,
                recordTime: time
            };
        } else if (params.action === "createMany") {
            const data = params.args.data;
            if (Array.isArray(data)) {
                params.args.data = data.map((item)=>({
                        ...item || {},
                        recordDate: date,
                        recordTime: time
                    }));
            } else {
                params.args.data = {
                    ...data || {},
                    recordDate: date,
                    recordTime: time
                };
            }
        } else if (params.action === "update" || params.action === "upsert") {
            params.args.data = {
                ...params.args.data || {},
                recordDate: date,
                recordTime: time
            };
        } else if (params.action === "updateMany") {
            const data = params.args.data;
            params.args.data = {
                ...data || {},
                recordDate: date,
                recordTime: time
            };
        }
    }
    return next(params);
});
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/auth/jwt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signToken",
    ()=>signToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
function signToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || "1h") {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("Missing JWT_SECRET");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, secret, {
        algorithm: "HS256",
        expiresIn
    });
}
function verifyToken(token) {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("Missing JWT_SECRET");
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, secret);
    } catch  {
        return null;
    }
}
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[project]/lib/utils/email-templates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminDepositEmail",
    ()=>adminDepositEmail,
    "internalTransferEmail",
    ()=>internalTransferEmail,
    "paymentApprovedEmail",
    ()=>paymentApprovedEmail,
    "paymentRejectedEmail",
    ()=>paymentRejectedEmail,
    "shortlistedEmail",
    ()=>shortlistedEmail,
    "walletDebitedEmail",
    ()=>walletDebitedEmail
]);
function nowTs() {
    return new Date().toLocaleString();
}
function wrap(subject, title, body, preheader) {
    const ph = preheader || subject;
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f7f7;font-family:Inter,Arial,sans-serif;color:#1f2937"><div style="display:none;max-height:0;overflow:hidden">${ph}</div><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7"><tr><td align="center" style="padding:24px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb"><tr><td style="padding:24px;border-bottom:1px solid #e5e7eb"><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:8px;background:#ea580c"></div><div style="font-weight:700;color:#0f172a">Open-Eye Africa Technologies – O-BIS</div></div></td></tr><tr><td style="padding:24px"><h2 style="margin:0 0 8px 0;color:#0f172a">${title}</h2>${body}<div style="margin-top:16px;color:#6b7280;font-size:12px">Timestamp: ${nowTs()}</div></td></tr><tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px">© ${new Date().getFullYear()} Open-Eye Africa Technologies. All rights reserved.</td></tr></table></td></tr></table></body></html>`;
}
function currency(amount) {
    const n = Number(amount || 0);
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(n);
    } catch  {
        return `₦${n.toFixed(2)}`;
    }
}
function paymentApprovedEmail(params) {
    const amt = currency(params.amount);
    const subject = "Payment Request Approved – Funds Released";
    const content = `<p>Dear ${params.recipientName},</p><p>We are pleased to inform you that your payment request for <strong>${amt}</strong> has been <strong>approved</strong> by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>The approved funds have now been credited to your wallet.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Payment Approved", content);
    const text = `Dear ${params.recipientName},\nYour payment request for ${amt} has been approved by ${params.managerName} and the funds have been credited to your wallet.\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
function paymentRejectedEmail(params) {
    const amt = currency(params.amount);
    const subject = "Payment Request Update – Rejected";
    const content = `<p>Dear ${params.recipientName},</p><p>Your payment request for <strong>${amt}</strong> has unfortunately been <strong>rejected</strong> by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>Reason provided: ${params.reason}</p><p>You may contact your manager if you need further clarification.</p><p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Payment Rejected", content);
    const text = `Dear ${params.recipientName},\nYour payment request for ${amt} has been rejected by ${params.managerName}.\nReason: ${params.reason}\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
function internalTransferEmail(params) {
    const amt = currency(params.amount);
    const subject = "Funds Transferred to Your Wallet";
    const content = `<p>Dear ${params.recipientName},</p><p>This is to notify you that <strong>${amt}</strong> has been transferred to your wallet by ${params.managerName}.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>You can now view this amount in your wallet balance.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Wallet Credited", content);
    const text = `Dear ${params.recipientName},\n${amt} has been transferred to your wallet by ${params.managerName}.\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
function adminDepositEmail(params) {
    const amt = currency(params.amount);
    const subject = "Virtual Deposit Added to Your Wallet";
    const content = `<p>Dear ${params.managerName},</p><p>A virtual deposit of <strong>${amt}</strong> has been added to your wallet for administrative or project allocation purposes.</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>This deposit was issued by the system administrator.</p>${params.ctaLink ? `<p><a href="${params.ctaLink}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">View Wallet</a></p>` : ""}<p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Wallet Credited", content);
    const text = `Dear ${params.managerName},\nA virtual deposit of ${amt} has been added to your wallet by the system administrator.\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
function shortlistedEmail(params) {
    const amt = params.bidAmount != null ? currency(params.bidAmount) : "N/A";
    const subject = "You Have Been Shortlisted – Meeting Invitation";
    const content = `<p>Dear ${params.contractorName},</p><p>On behalf of ${params.managerName}, we are pleased to notify you that your bid for <strong>${params.projectName}</strong> has been <strong>shortlisted</strong>.</p><p>You are hereby invited to the scheduled meeting.</p><p><strong>Join the meeting:</strong> <a href="${params.meetingLink}">${params.meetingLink}</a></p><p><strong>Bid Amount:</strong> ${amt}<br><strong>Project Duration:</strong> ${params.duration ?? "N/A"}</p><p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Shortlisted – Meeting Invitation", content);
    const text = `Dear ${params.contractorName},\nOn behalf of ${params.managerName}, your bid for ${params.projectName} has been shortlisted.\nJoin meeting: ${params.meetingLink}\nBid amount: ${amt}\nDuration: ${params.duration ?? "N/A"}\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
function walletDebitedEmail(params) {
    const amt = currency(params.amount);
    const subject = "Wallet Debited – Transfer Processed";
    const content = `<p>Dear ${params.recipientName},</p><p>Your wallet has been debited with <strong>${amt}</strong>${params.managerName ? ` by ${params.managerName}` : ""}.${params.reason ? ` Reason: ${params.reason}.` : ""}</p><p>${params.reference ? `Reference: ${params.reference}` : ""}</p><p>If you did not expect this debit, please contact support.</p><p>Best regards,<br>O-BIS Management Team</p>`;
    const html = wrap(subject, "Wallet Debited", content);
    const text = `Dear ${params.recipientName},\nYour wallet has been debited with ${amt}${params.managerName ? ` by ${params.managerName}` : ""}.${params.reason ? ` Reason: ${params.reason}.` : ""}\nBest regards,\nO-BIS Management Team`;
    return {
        subject,
        html,
        text
    };
}
}),
"[project]/lib/bid-review.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGoogleMeetEvent",
    ()=>createGoogleMeetEvent,
    "generateContractAwardEmail",
    ()=>generateContractAwardEmail,
    "generateContractAwardPDF",
    ()=>generateContractAwardPDF,
    "generateInvitationEmail",
    ()=>generateInvitationEmail,
    "sendContractAwardEmail",
    ()=>sendContractAwardEmail,
    "sendInvitationEmail",
    ()=>sendInvitationEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/googleapis/build/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfkit$2f$js$2f$pdfkit$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfkit/js/pdfkit.es.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$email$2d$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/email-templates.ts [app-route] (ecmascript)");
;
;
;
;
function toISO(date, time) {
    const [y, m, d] = date.split("-").map((v)=>Number(v));
    const [hh, mm] = time.split(":").map((v)=>Number(v));
    const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
    return dt.toISOString();
}
function generateInvitationEmail(bid, ownerName, timeZone, googleMeetLink) {
    const email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$email$2d$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shortlistedEmail"])({
        contractorName: bid.contactPerson,
        managerName: ownerName,
        projectName: bid.projectName,
        meetingLink: googleMeetLink,
        bidAmount: bid.estimatedBudget,
        duration: bid.estimatedDuration
    });
    return {
        subject: email.subject,
        html: email.html
    };
}
async function createGoogleMeetEvent(bid, ownerName, timeZone, attendees = []) {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    if (!clientId || !clientSecret || !refreshToken) throw new Error("Missing Google OAuth credentials");
    if (!bid.meetingDate || !bid.meetingTime) throw new Error("Missing meetingDate or meetingTime");
    const oauth2Client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["google"].auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });
    const calendar = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["google"].calendar({
        version: "v3",
        auth: oauth2Client
    });
    const startIso = toISO(bid.meetingDate, bid.meetingTime);
    const start = {
        dateTime: startIso,
        timeZone
    };
    const endIso = toISO(bid.meetingDate, bid.meetingTime);
    const endDate = new Date(endIso);
    endDate.setHours(endDate.getHours() + 1);
    const end = {
        dateTime: endDate.toISOString(),
        timeZone
    };
    const event = {
        summary: `Discussion: ${bid.projectName}`,
        description: `Proposal discussion for ${bid.projectName} with ${bid.companyName || "Bidder"}. Owner: ${ownerName}.`,
        start,
        end,
        attendees: [
            {
                email: bid.email
            },
            ...attendees.map((e)=>({
                    email: e
                }))
        ],
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: "email",
                    minutes: 240
                }
            ]
        },
        conferenceData: {
            createRequest: {
                requestId: `${Date.now()}-${Math.random()}`.replace(/\./g, ""),
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                }
            }
        }
    };
    const { data } = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1
    });
    return {
        eventId: String(data.id),
        hangoutLink: data.hangoutLink || undefined,
        htmlLink: data.htmlLink || undefined,
        start: start.dateTime,
        end: end.dateTime
    };
}
function mailer() {
    const host = process.env.SMTP_HOST || "";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";
    const from = process.env.SMTP_FROM || "";
    if (!host || !user || !pass || !from) throw new Error("Missing SMTP configuration");
    const transport = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass
        }
    });
    return {
        transport,
        from
    };
}
async function sendInvitationEmail(to, email) {
    const { transport, from } = mailer();
    const info = await transport.sendMail({
        from,
        to,
        subject: email.subject,
        html: email.html
    });
    return info.messageId;
}
function generateContractAwardPDF(bid) {
    return new Promise((resolve, reject)=>{
        const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfkit$2f$js$2f$pdfkit$2e$es$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            size: "A4",
            margin: 50
        });
        const chunks = [];
        doc.on("data", (d)=>chunks.push(d));
        doc.on("end", ()=>resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
        doc.fontSize(20).text("O-BIS Contract Award", {
            align: "center"
        });
        doc.moveDown(1);
        doc.fontSize(12).text(`Project: ${bid.projectName}`);
        doc.text(`Company: ${bid.companyName || "N/A"}`);
        doc.text(`Contact: ${bid.contactPerson}`);
        doc.moveDown(0.5);
        doc.text("Project Information", {
            underline: true
        });
        doc.moveDown(0.5);
        doc.text(`Estimated Budget: ${bid.estimatedBudget ?? "N/A"}`);
        doc.text(`Estimated Duration: ${bid.estimatedDuration ? bid.estimatedDuration + " days" : "N/A"}`);
        doc.moveDown(0.5);
        doc.text("Project Description", {
            underline: true
        });
        doc.moveDown(0.5);
        doc.text(`${bid.description || "No description provided."}`);
        if (bid.subcontractors && bid.subcontractors.length > 0) {
            doc.moveDown(0.5);
            doc.text("Subcontractors", {
                underline: true
            });
            bid.subcontractors.forEach((s, i)=>{
                doc.text(`${i + 1}. ${s.name}${s.company ? " — " + s.company : ""}${s.scope ? " — " + s.scope : ""}`);
            });
        }
        doc.moveDown(0.5);
        doc.text("Terms and Conditions", {
            underline: true
        });
        doc.moveDown(0.5);
        doc.text("All work shall be performed in accordance with O-BIS standards, applicable regulations, and the mutually agreed scope, schedule, and commercial terms.");
        doc.moveDown(1);
        doc.text("Authorized Signature:", {
            continued: true
        }).text(" ____________________________");
        doc.moveDown(2);
        doc.fontSize(10).text("O-BIS • Contract Award Document", {
            align: "center"
        });
        doc.end();
    });
}
function generateContractAwardEmail(bid, ownerName) {
    const subject = `Contract Award: ${bid.projectName}`;
    const html = `
  <div style="font-family: Arial, sans-serif; color:#111; line-height:1.6;">
    <p>Dear ${bid.contactPerson},</p>
    <p>We are pleased to inform you that O-BIS is awarding the contract for <strong>${bid.projectName}</strong> to <strong>${bid.companyName || "your organization"}</strong>.</p>
    <p>Project Information</p>
    <ul>
      <li>Owner: ${ownerName}</li>
      <li>Estimated Budget: ${bid.estimatedBudget ?? "N/A"}</li>
      <li>Estimated Duration: ${bid.estimatedDuration ? bid.estimatedDuration + " days" : "N/A"}</li>
    </ul>
    <p>Description</p>
    <p>${bid.description || "No description provided."}</p>
    <p>Next Steps</p>
    <p>Please review the attached contract award document. Our team will coordinate kickoff activities and contractual formalities.</p>
    <p>Sincerely,<br/>O-BIS Management</p>
  </div>
  `.trim();
    return {
        subject,
        html
    };
}
async function sendContractAwardEmail(to, email, pdf) {
    const { transport, from } = mailer();
    const info = await transport.sendMail({
        from,
        to,
        subject: email.subject,
        html: email.html,
        attachments: [
            {
                filename: "contract-award.pdf",
                content: pdf
            }
        ]
    });
    return info.messageId;
}
}),
"[project]/app/api/bids/[id]/review/invite/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/jwt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bid$2d$review$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bid-review.ts [app-route] (ecmascript)");
;
;
;
;
function getAuthRole(request) {
    const auth = request.headers.get("authorization") || "";
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    if (!m) return null;
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(m[1]);
    if (!payload) return null;
    return {
        userId: payload.sub,
        role: payload.role
    };
}
async function POST(request, { params }) {
    try {
        const auth = getAuthRole(request);
        if (!auth || auth.role !== "manager" && auth.role !== "MANAGER") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forbidden"
            }, {
                status: 403
            });
        }
        const { id } = await params;
        const body = await request.json().catch(()=>({}));
        const ownerName = body.ownerName || "Owner";
        const timeZone = body.timeZone || "UTC";
        const meetingDate = body.meetingDate;
        const meetingTime = body.meetingTime;
        const meetUrl = body.meetUrl;
        const attendees = Array.isArray(body.attendees) ? body.attendees : [];
        const bid = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.findUnique({
            where: {
                id
            }
        });
        if (!bid) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Bid not found"
        }, {
            status: 404
        });
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id: bid.projectId
            }
        });
        if (!project) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
        if (bid.status !== "Reviewed") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Only shortlisted bids can be invited"
            }, {
                status: 400
            });
        }
        if ([
            "Closed",
            "Awarded",
            "Completed"
        ].includes(project.status)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invitations are disabled for closed or awarded projects"
            }, {
                status: 400
            });
        }
        const bidInput = {
            contactPerson: bid.bidderName,
            email: bid.email,
            projectName: project.title,
            companyName: bid.companyName || undefined,
            estimatedBudget: bid.amount,
            estimatedDuration: bid.duration,
            description: project.description || bid.message || undefined,
            meetingDate,
            meetingTime
        };
        let event;
        let finalMeetUrl = "";
        if (meetUrl && typeof meetUrl === "string") {
            const valid = /^https:\/\/meet\.google\.com\/[a-z0-9-]+(\?.*)?$/i.test(meetUrl);
            if (!valid) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid Google Meet link"
                }, {
                    status: 400
                });
            }
            finalMeetUrl = meetUrl;
            event = {
                eventId: "manual-link",
                hangoutLink: meetUrl,
                start: meetingDate || "",
                end: meetingTime || ""
            };
        } else {
            event = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bid$2d$review$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createGoogleMeetEvent"])(bidInput, ownerName, timeZone, attendees);
            finalMeetUrl = event.hangoutLink || event.htmlLink || "";
        }
        const email = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bid$2d$review$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInvitationEmail"])(bidInput, ownerName, timeZone, finalMeetUrl);
        const recipients = [
            bid.email,
            ...attendees
        ].filter(Boolean);
        const messageIds = [];
        for (const to of recipients){
            const msgId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bid$2d$review$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendInvitationEmail"])(to, email);
            messageIds.push(msgId);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            event,
            messageIds
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(e?.message || "Failed to send invitation")
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__60eb68fd._.js.map