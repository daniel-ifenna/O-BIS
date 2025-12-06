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
"[project]/lib/auth/reset.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "consumeResetToken",
    ()=>consumeResetToken,
    "consumeVerificationToken",
    ()=>consumeVerificationToken,
    "issueResetToken",
    ()=>issueResetToken,
    "issueVerificationToken",
    ()=>issueVerificationToken,
    "validateResetToken",
    ()=>validateResetToken,
    "validateVerificationToken",
    ()=>validateVerificationToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
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
async function issueResetToken(userId, expiresIn = process.env.JWT_EXPIRES_IN || "24h") {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("Missing JWT_SECRET");
    const now = new Date();
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.sign({
        sub: userId,
        type: "password_reset"
    }, secret, {
        expiresIn
    });
    const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.decode(token);
    const expMs = decoded?.exp ? decoded.exp * 1000 : now.getTime() + 24 * 60 * 60 * 1000;
    const expiresAt = new Date(expMs).toISOString();
    const recordDate = fmtDate(now);
    const recordTime = fmtTime(now);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.create({
        data: {
            token,
            userId,
            issuedAt: now,
            expiresAt: new Date(expiresAt),
            used: false,
            recordDate,
            recordTime
        }
    });
    return {
        token,
        recordDate,
        recordTime,
        expiresAt
    };
}
async function validateResetToken(token) {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return {
        valid: false,
        reason: "Missing JWT_SECRET"
    };
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.verify(token, secret);
        if (payload?.type !== "password_reset") return {
            valid: false,
            reason: "Invalid token type"
        };
        const rec = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.findUnique({
            where: {
                token
            }
        });
        if (!rec) return {
            valid: false,
            reason: "Token not found"
        };
        if (rec.used) return {
            valid: false,
            reason: "Token already used"
        };
        if (new Date(rec.expiresAt).getTime() < Date.now()) return {
            valid: false,
            reason: "Token expired"
        };
        return {
            valid: true,
            userId: rec.userId
        };
    } catch (e) {
        return {
            valid: false,
            reason: e?.message || "Invalid token"
        };
    }
}
async function consumeResetToken(token) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.update({
        where: {
            token
        },
        data: {
            used: true
        }
    });
}
async function issueVerificationToken(userId, expiresIn = process.env.JWT_EXPIRES_IN || "24h") {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("Missing JWT_SECRET");
    const now = new Date();
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.sign({
        sub: userId,
        type: "email_verification"
    }, secret, {
        expiresIn
    });
    const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.decode(token);
    const expMs = decoded?.exp ? decoded.exp * 1000 : now.getTime() + 24 * 60 * 60 * 1000;
    const expiresAt = new Date(expMs).toISOString();
    const recordDate = fmtDate(now);
    const recordTime = fmtTime(now);
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].emailVerificationToken;
    const alt = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken;
    if (m && typeof m.create === "function") {
        await m.create({
            data: {
                token,
                userId,
                issuedAt: now,
                expiresAt: new Date(expiresAt),
                used: false,
                recordDate,
                recordTime
            }
        });
    } else if (alt && typeof alt.create === "function") {
        await alt.create({
            data: {
                token,
                userId,
                issuedAt: now,
                expiresAt: new Date(expiresAt),
                used: false,
                recordDate,
                recordTime
            }
        });
    } else {
        throw new Error("Verification token storage unavailable");
    }
    return {
        token,
        recordDate,
        recordTime,
        expiresAt
    };
}
async function validateVerificationToken(token) {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return {
        valid: false,
        reason: "Missing JWT_SECRET"
    };
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__.verify(token, secret);
        if (payload?.type !== "email_verification") return {
            valid: false,
            reason: "Invalid token type"
        };
        const m = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].emailVerificationToken;
        const alt = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken;
        const rec = m && typeof m.findUnique === "function" ? await m.findUnique({
            where: {
                token
            }
        }) : alt && typeof alt.findUnique === "function" ? await alt.findUnique({
            where: {
                token
            }
        }) : null;
        if (!rec) return {
            valid: false,
            reason: "Token not found"
        };
        if (rec.used) return {
            valid: false,
            reason: "Token already used"
        };
        if (new Date(rec.expiresAt).getTime() < Date.now()) return {
            valid: false,
            reason: "Token expired"
        };
        return {
            valid: true,
            userId: rec.userId
        };
    } catch (e) {
        return {
            valid: false,
            reason: e?.message || "Invalid token"
        };
    }
}
async function consumeVerificationToken(token) {
    const m = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].emailVerificationToken;
    const alt = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken;
    if (m && typeof m.update === "function") {
        await m.update({
            where: {
                token
            },
            data: {
                used: true
            }
        });
        return;
    }
    if (alt && typeof alt.update === "function") {
        await alt.update({
            where: {
                token
            },
            data: {
                used: true
            }
        });
        return;
    }
    throw new Error("Verification token storage unavailable");
}
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

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
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/lib/email-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailService",
    ()=>EmailService,
    "emailService",
    ()=>emailService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/StandardFonts.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
class EmailService {
    transporter = null;
    isVerified = false;
    constructor(){
        void this.initializeTransporter();
    }
    async initializeTransporter() {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT || 0);
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        if (smtpHost && smtpPort && smtpUser && smtpPass) {
            this.transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000
            });
        } else if (gmailUser && gmailPass) {
            this.transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
                service: "gmail",
                auth: {
                    user: gmailUser,
                    pass: gmailPass
                }
            });
        } else {
            console.warn("[EmailService] Email service not configured (missing SMTP/Gmail envs).");
            // In development/test, we might proceed without a transporter, but warn.
            return;
        }
        // Fire-and-forget verification to avoid blocking cold starts or timing out requests
        // if the SMTP server is slow to greet.
        this.transporter.verify().then(()=>{
            this.isVerified = true;
            console.log("[EmailService] SMTP verified successfully");
        }).catch((err)=>{
            console.error("[EmailService] SMTP verification failed:", err);
            this.isVerified = false;
        });
    }
    getStatus() {
        return {
            ready: Boolean(this.transporter)
        };
    }
    buildHtmlTemplate(params) {
        const pre = params.preheader || params.title;
        const href = this.resolveUrl(params.ctaUrl);
        const cta = params.ctaText && href ? `<a href="${href}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">${params.ctaText}</a>` : "";
        const note = params.footerNote ? `<p style="margin:16px 0;color:#6b7280">${params.footerNote}</p>` : "";
        const greet = params.greeting ? `<p style="margin:0 0 12px 0">${params.greeting}</p>` : "";
        return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Inter,Arial,sans-serif;color:#1f2937">
  <div style="display:none;max-height:0;overflow:hidden">${pre}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7">
    <tr>
      <td align="center" style="padding:24px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb">
          <tr>
            <td style="padding:24px;border-bottom:1px solid #e5e7eb">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:8px;background:#ea580c"></div>
                <div style="font-weight:700;color:#0f172a">Open-Eye Africa Technologies – O-BIS</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px">
              <h2 style="margin:0 0 8px 0;color:#0f172a">${params.title}</h2>
              ${greet}
              ${params.bodyHtml}
              ${cta}
              ${note}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px">
              © ${new Date().getFullYear()} Open-Eye Africa Technologies. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>`;
    }
    resolveUrl(u) {
        if (!u) return undefined;
        const s = String(u).trim();
        if (!s) return undefined;
        if (/^https?:\/\//i.test(s)) return s;
        if (s.startsWith("/")) {
            const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) || process.env.BASE_URL || "http://localhost:3000";
            return `${base}${s}`;
        }
        return s;
    }
    // ... (omitted) ...
    async sendEmail(params) {
        // We attempt to send even if verification hasn't finished or failed, 
        // because sometimes verify() is flaky on serverless but sendMail() works.
        if (!this.transporter) {
            console.warn("[EmailService] Cannot send email: Transporter not initialized");
            return false;
        }
        try {
            const isFullDoc = /^\s*<!DOCTYPE html>/i.test(params.html);
            const htmlOut = isFullDoc ? params.html : this.buildHtmlTemplate({
                title: params.subject,
                bodyHtml: params.html
            });
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.GMAIL_USER,
                to: params.to,
                subject: params.subject,
                html: htmlOut
            });
            console.log(`[EmailService] Email sent to ${params.to}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Failed to send email to ${params.to}:`, err);
            return false;
        }
    }
    async sendContractAwardEmail(params) {
        if (!this.transporter) return false;
        // ... (rest of the function)
        const formatNaira = (v)=>`NGN ${new Intl.NumberFormat("en-NG", {
                maximumFractionDigits: 0
            }).format(v)}`;
        const ctaText = params.isPasswordSetup ? "Log In" : undefined;
        const ctaUrl = params.isPasswordSetup ? params.loginUrl : undefined;
        const credsBlock = !params.isPasswordSetup && params.loginEmail && params.tempPassword ? `<div style="margin-top:8px"><div style="font-weight:600;color:#1f2937">Login Email: ${params.loginEmail}</div><div style="color:#1f2937">Temporary Password: ${params.tempPassword}</div></div>` : "";
        const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${params.companyName},</p>
              <p style="margin:0 0 12px 0">Your bid has been approved for <strong>${params.projectName}</strong>.</p>
              <div style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa">
                <div style="margin:4px 0"><span style="color:#6b7280">Budget:</span> <span style="font-weight:600">${formatNaira(params.estimatedBudget)}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Duration:</span> <span style="font-weight:600">${params.estimatedDuration} days</span></div>
              </div>
              ${credsBlock}
              <p style="margin:16px 0">Attached is your contract document.</p>`;
        const htmlContent = this.buildHtmlTemplate({
            preheader: `Contract Award – ${params.projectName}`,
            title: `Contract Award Notification – ${params.projectName}`,
            bodyHtml,
            ctaText,
            ctaUrl
        });
        try {
            const attachments = params.contractPdfBuffer ? [
                {
                    filename: `Contract_Award_${params.projectName.replace(/\s+/g, "_")}.pdf`,
                    content: params.contractPdfBuffer,
                    contentType: "application/pdf"
                }
            ] : [];
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.GMAIL_USER,
                to: params.to,
                subject: `Contract Award - ${params.projectName}`,
                html: htmlContent,
                attachments
            });
            console.log(`[EmailService] Contract award email sent to ${params.to}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Failed to send contract award email to ${params.to}:`, err);
            return false;
        }
    }
    async sendMeetingInviteEmail(params) {
        if (!this.transporter) return false;
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.GMAIL_USER,
                to: params.to,
                subject: params.subject,
                html: params.html,
                attachments: [
                    {
                        filename: "meeting-invite.ics",
                        content: params.icsContent,
                        contentType: "text/calendar; charset=utf-8; method=REQUEST"
                    }
                ]
            });
            console.log(`[EmailService] Meeting invite sent to ${params.to}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Failed to send meeting invite to ${params.to}:`, err);
            return false;
        }
    }
    async sendPasswordResetEmail(email, name, resetUrl) {
        if (!this.transporter) return false;
        const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${name},</p>
              <p style="margin:0 0 12px 0">Click the button below to reset your password.</p>
              <p style="margin:0 0 12px 0;color:#6b7280">This link will expire in 24 hours.</p>`;
        const html = this.buildHtmlTemplate({
            preheader: "Password Reset",
            title: "Password Reset",
            bodyHtml,
            ctaText: "Reset Password",
            ctaUrl: resetUrl
        });
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.GMAIL_USER,
                to: email,
                subject: "Password Reset Request",
                html
            });
            console.log(`[EmailService] Password reset email sent to ${email}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Failed to send password reset email to ${email}:`, err);
            return false;
        }
    }
    async sendVerificationEmail(email, name, verifyUrl) {
        if (!this.transporter) return false;
        const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${name},</p>
              <p style="margin:0 0 12px 0">Please confirm your email address to activate your account.</p>
              <p style="margin:16px 0;color:#6b7280">This link will expire in 24 hours.</p>`;
        const html = this.buildHtmlTemplate({
            preheader: "Verify your email",
            title: "Verify your email",
            bodyHtml,
            ctaText: "Verify Email",
            ctaUrl: verifyUrl
        });
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.GMAIL_USER,
                to: email,
                subject: "Verify your email",
                html
            });
            console.log(`[EmailService] Verification email sent to ${email}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Failed to send verification email to ${email}:`, err);
            return false;
        }
    }
    async generateContractAwardPDF(bid, ownerName, projectTitle) {
        const pdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PDFDocument"].create();
        let page = pdf.addPage([
            595.28,
            841.89
        ]);
        const font = await pdf.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StandardFonts"].TimesRoman);
        const margin = 40;
        const primaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.9176, 0.3451, 0.0471);
        const textColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.1216, 0.1608, 0.2157);
        const lightGray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.4196, 0.4549, 0.5020);
        let width = page.getSize().width;
        let height = page.getSize().height;
        let contentWidth = width - margin * 2;
        let cursorY = height - margin;
        const lineSize = 12;
        const lineGap = Math.round(lineSize * 0.3);
        const newPage = ()=>{
            page = pdf.addPage([
                595.28,
                841.89
            ]);
            width = page.getSize().width;
            height = page.getSize().height;
            contentWidth = width - margin * 2;
            cursorY = height - margin;
        };
        const ensureSpace = (needed)=>{
            if (cursorY - needed < margin) newPage();
        };
        const drawJustifiedLine = (words, size, color, justify)=>{
            ensureSpace(size + lineGap);
            let x = margin;
            const spaceW = font.widthOfTextAtSize(" ", size);
            const wordWidths = words.map((w)=>font.widthOfTextAtSize(w, size));
            const totalWords = wordWidths.reduce((a, b)=>a + b, 0);
            const gaps = Math.max(words.length - 1, 0);
            const baseTotalSpaces = gaps * spaceW;
            const remaining = contentWidth - (totalWords + baseTotalSpaces);
            const extra = justify && gaps > 0 && remaining > 0 ? remaining / gaps : 0;
            for(let i = 0; i < words.length; i++){
                const w = words[i];
                page.drawText(w, {
                    x,
                    y: cursorY - size,
                    size,
                    font,
                    color
                });
                x += wordWidths[i];
                if (i < words.length - 1) x += spaceW + extra;
            }
            cursorY -= size + lineGap;
        };
        const wrapToLines = (t, size)=>{
            const words = String(t).split(/\s+/).filter(Boolean);
            const lines = [];
            let cur = [];
            let curWidth = 0;
            const spaceW = font.widthOfTextAtSize(" ", size);
            for (const w of words){
                const wWidth = font.widthOfTextAtSize(w, size);
                const testWidth = curWidth + (cur.length ? spaceW : 0) + wWidth;
                if (testWidth <= contentWidth) {
                    cur.push(w);
                    curWidth = testWidth;
                } else {
                    if (cur.length) lines.push(cur.join(" "));
                    cur = [
                        w
                    ];
                    curWidth = wWidth;
                }
            }
            if (cur.length) lines.push(cur.join(" "));
            return lines.map((ln)=>ln.trim());
        };
        const awardDate = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        const budgetNum = Number(bid.amount || 0);
        const formatNaira = (v)=>`NGN ${new Intl.NumberFormat("en-NG", {
                maximumFractionDigits: 0
            }).format(v)}`;
        const budgetFmt = formatNaira(budgetNum);
        const amountInWords = (n)=>{
            const units = [
                "zero",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "ten",
                "eleven",
                "twelve",
                "thirteen",
                "fourteen",
                "fifteen",
                "sixteen",
                "seventeen",
                "eighteen",
                "nineteen"
            ];
            const tens = [
                "",
                "",
                "twenty",
                "thirty",
                "forty",
                "fifty",
                "sixty",
                "seventy",
                "eighty",
                "ninety"
            ];
            const toWords = (x)=>{
                if (x < 20) return units[x];
                if (x < 100) return `${tens[Math.floor(x / 10)]}${x % 10 ? "-" + units[x % 10] : ""}`;
                if (x < 1000) return `${units[Math.floor(x / 100)]} hundred${x % 100 ? " and " + toWords(x % 100) : ""}`;
                if (x < 1000000) return `${toWords(Math.floor(x / 1000))} thousand${x % 1000 ? " " + toWords(x % 1000) : ""}`;
                if (x < 1000000000) return `${toWords(Math.floor(x / 1000000))} million${x % 1000000 ? " " + toWords(x % 1000000) : ""}`;
                return `${toWords(Math.floor(x / 1000000000))} billion${x % 1000000000 ? " " + toWords(x % 1000000000) : ""}`;
            };
            return toWords(Math.floor(n));
        };
        ensureSpace(22 + 10);
        page.drawText("CONTRACT AWARD AGREEMENT", {
            x: margin,
            y: cursorY - 22,
            size: 22,
            font,
            color: primaryColor
        });
        cursorY -= 22 + 10;
        const sub = `(Issued electronically through the ${process.env.NEXT_PUBLIC_PLATFORM_NAME || "O-BIS"} Construction Management System)`;
        const subLines = wrapToLines(sub, 10);
        for(let i = 0; i < subLines.length; i++){
            const words = subLines[i].split(/\s+/);
            drawJustifiedLine(words, 10, lightGray, false);
        }
        cursorY -= 6;
        try {
            const fallback = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "public", "icon.svg.png");
            const logoPath = process.env.COMPANY_LOGO_PATH || fallback;
            const fs = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
            const buf = await fs.readFile(logoPath);
            let img;
            if (/\.png$/i.test(logoPath)) img = await pdf.embedPng(buf);
            else img = await pdf.embedJpg(buf);
            const logoMargin = 20;
            const iw = 64;
            const ih = 64;
            const lx = width - logoMargin - iw;
            const ly = height - logoMargin - ih;
            page.drawImage(img, {
                x: lx,
                y: ly,
                width: iw,
                height: ih
            });
        } catch  {}
        const templateRaw = process.env.CONTRACT_TEMPLATE_TEXT || "Client: {{CLIENT_NAME}}\nAuthorized Manager: {{AUTHORIZED_MANAGER}}\nContractor: {{CONTRACTOR_NAME}}\nRecitals: This Agreement is generated on {{AWARD_DATE}} for {{PROJECT_TITLE}}.\nScope: The Contractor shall execute all work associated with {{PROJECT_TITLE}}.\nContract Sum: {{CONTRACT_SUM}} ({{CONTRACT_SUM_WORDS}}).\nDuration: {{CONTRACT_DURATION}} days.\nPayment Terms: Based on verified milestones.\nObligations: Maintain standards; mobilize resources; safety compliance; provide updates.\nChange Orders: Variations must be approved in-platform.\nTermination: For non-performance or non-compliance.\nAcceptance: Digital acceptance is legally binding.\nExecution: Auto-generated and binding without physical signatures.\nAuthorized By: {{AUTHORIZED_MANAGER}}\nAccepted By: {{CONTRACTOR_NAME}}";
        const replacements = {
            "{{CLIENT_NAME}}": String(process.env.COMPANY_NAME || bid.companyName || "Client"),
            "{{COMPANY_ADDRESS}}": String(process.env.COMPANY_ADDRESS || ""),
            "{{COMPANY_EMAIL}}": String(process.env.COMPANY_EMAIL || bid.email || ""),
            "{{AUTHORIZED_MANAGER}}": String(process.env.MANAGER_NAME || ownerName || "Manager"),
            "{{CONTRACTOR_NAME}}": String(bid.bidderName || "Contractor"),
            "{{PROJECT_TITLE}}": String(projectTitle || "Project"),
            "{{CONTRACT_SUM}}": String(budgetFmt),
            "{{CONTRACT_SUM_WORDS}}": String(amountInWords(budgetNum)),
            "{{CONTRACT_DURATION}}": String(bid.duration || 0),
            "{{AWARD_DATE}}": String(awardDate),
            "{{PLATFORM_NAME}}": String(process.env.NEXT_PUBLIC_PLATFORM_NAME || "O-BIS")
        };
        let templateText = templateRaw;
        for (const k of Object.keys(replacements)){
            templateText = templateText.split(k).join(replacements[k]);
        }
        const sanitizeText = (s)=>{
            return s.replace(/\u20A6/g, "NGN ").replace(/[^\x00-\x7F]+/g, "");
        };
        templateText = sanitizeText(templateText);
        const blocks = String(templateText).split(/\n{2,}/);
        for (const b of blocks){
            const lines = wrapToLines(sanitizeText(b), lineSize);
            if (!lines.length) continue;
            const firstLineWords = lines[0].split(/\s+/);
            const firstLineHeight = lineSize + lineGap;
            if (cursorY - firstLineHeight < margin) newPage();
            for(let i = 0; i < lines.length; i++){
                const words = lines[i].split(/\s+/);
                const justify = i < lines.length - 1;
                drawJustifiedLine(words, lineSize, textColor, justify);
            }
            cursorY -= Math.max(lineGap, 8);
        }
        const mName = String(process.env.MANAGER_NAME || ownerName || "Manager");
        const cName = String(bid.bidderName || "Contractor");
        const sigBlockHeight = 160;
        ensureSpace(sigBlockHeight);
        page.drawText("IN WITNESS WHEREOF", {
            x: margin,
            y: cursorY - 18,
            size: 18,
            font,
            color: primaryColor
        });
        cursorY -= 18 + 14;
        const colW = (contentWidth - 20) / 2;
        const leftX = margin;
        const rightX = margin + colW + 20;
        page.drawText("Authorized By:", {
            x: leftX,
            y: cursorY - lineSize,
            size: lineSize,
            font,
            color: textColor
        });
        cursorY -= lineSize + lineGap;
        page.drawText(mName, {
            x: leftX,
            y: cursorY - lineSize,
            size: lineSize,
            font,
            color: textColor
        });
        const sigYLeft = cursorY - lineSize - 6;
        page.drawRectangle({
            x: leftX,
            y: sigYLeft,
            width: colW - 20,
            height: 1,
            color: lightGray
        });
        cursorY = sigYLeft - 14;
        page.drawText("Signature", {
            x: leftX,
            y: cursorY - 10,
            size: 10,
            font,
            color: lightGray
        });
        const tempY = cursorY;
        cursorY = tempY + lineSize + 4;
        page.drawText("Accepted By:", {
            x: rightX,
            y: tempY - lineSize,
            size: lineSize,
            font,
            color: textColor
        });
        page.drawText(cName, {
            x: rightX,
            y: tempY - lineSize - lineSize - lineGap,
            size: lineSize,
            font,
            color: textColor
        });
        const sigYRight = tempY - lineSize - lineSize - lineGap - 6;
        page.drawRectangle({
            x: rightX,
            y: sigYRight,
            width: colW - 20,
            height: 1,
            color: lightGray
        });
        page.drawText("Signature", {
            x: rightX,
            y: sigYRight - 14,
            size: 10,
            font,
            color: lightGray
        });
        const out = await pdf.save();
        return Buffer.from(out);
    }
    async generateSimplePDF(_, __, ___) {
        const pdf = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PDFDocument"].create();
        const page = pdf.addPage([
            595.28,
            841.89
        ]);
        const font = await pdf.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StandardFonts"].Helvetica);
        page.drawText("Contract Award", {
            x: 40,
            y: page.getSize().height - 60,
            size: 20,
            font,
            color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.9176, 0.3451, 0.0471)
        });
        const out = await pdf.save();
        return Buffer.from(out);
    }
}
const emailService = new EmailService();
}),
"[project]/app/api/auth/password/request/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$reset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/reset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email-service.ts [app-route] (ecmascript)");
;
;
;
;
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
async function POST(request) {
    try {
        const body = await request.json();
        const email = String(body?.email || "").trim().toLowerCase();
        if (!email) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Email is required"
        }, {
            status: 400
        });
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email
            }
        });
        // Always respond success to avoid account enumeration
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
        const { token, recordDate, recordTime } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$reset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["issueResetToken"])(user.id);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${new URL(request.url).origin}`;
        const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
        const es = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmailService"]();
        await es.sendPasswordResetEmail(user.email, user.name, resetUrl);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            recordDate,
            recordTime
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(e?.message || "Failed to process request")
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__05e6eea5._.js.map