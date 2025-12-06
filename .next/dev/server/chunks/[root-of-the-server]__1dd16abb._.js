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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/security/bank.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptAccountNumber",
    ()=>decryptAccountNumber,
    "encryptAccountNumber",
    ()=>encryptAccountNumber,
    "maskAccountNumber",
    ()=>maskAccountNumber
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALGO = "aes-256-gcm";
function getKey() {
    const keyB64 = process.env.PAYMENT_ENCRYPTION_KEY || "";
    if (!keyB64) throw new Error("Missing PAYMENT_ENCRYPTION_KEY");
    const key = Buffer.from(keyB64, "base64");
    if (key.length !== 32) throw new Error("PAYMENT_ENCRYPTION_KEY must be 32 bytes base64");
    return key;
}
function encryptAccountNumber(accountNumber) {
    const key = getKey();
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(12);
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv(ALGO, key, iv);
    const enc = Buffer.concat([
        cipher.update(accountNumber, "utf8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([
        iv,
        tag,
        enc
    ]).toString("base64");
}
function decryptAccountNumber(encB64) {
    const key = getKey();
    const buf = Buffer.from(encB64, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([
        decipher.update(data),
        decipher.final()
    ]);
    return dec.toString("utf8");
}
function maskAccountNumber(encB64) {
    try {
        const dec = decryptAccountNumber(encB64);
        const last4 = dec.slice(-4);
        return `**** **** **** ${last4}`;
    } catch  {
        return "**** **** **** ****";
    }
}
}),
"[externals]/firebase-admin [external] (firebase-admin, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("firebase-admin", () => require("firebase-admin"));

module.exports = mod;
}),
"[project]/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseStorage",
    ()=>FirebaseStorage,
    "createFirebaseStorageFromEnv",
    ()=>createFirebaseStorageFromEnv
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs)");
;
const allowedMime = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "image/jpeg",
    "image/png"
]);
function sanitize(name) {
    return name.toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$|^\.|\.$/g, "");
}
function ts() {
    return new Date().toISOString().replace(/[^0-9]/g, "");
}
function buildPath(o) {
    const parts = [
        o.category
    ];
    if (o.projectId) parts.push(`project_${o.projectId}`);
    if (o.bidId) parts.push(`bid_${o.bidId}`);
    if (o.procurementId) parts.push(`proc_${o.procurementId}`);
    if (o.vendorId) parts.push(`vendor_${o.vendorId}`);
    if (o.userId) parts.push(`user_${o.userId}`);
    const name = `${ts()}-${sanitize(o.filename)}`;
    parts.push(name);
    return parts.join("/");
}
class FirebaseStorage {
    bucket;
    constructor(cfg){
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].apps.length) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].initializeApp({
                credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].credential.cert({
                    projectId: cfg.projectId,
                    clientEmail: cfg.clientEmail,
                    privateKey: cfg.privateKey.replace(/\\n/g, "\n")
                }),
                storageBucket: cfg.bucket
            });
        }
        this.bucket = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].storage().bucket(cfg.bucket);
    }
    async uploadBuffer(buf, opts) {
        if (!allowedMime.has(opts.contentType)) throw new Error("Unsupported content type");
        const path = buildPath(opts);
        const file = this.bucket.file(path);
        await file.save(buf, {
            contentType: opts.contentType,
            gzip: opts.gzip ?? true,
            resumable: false,
            metadata: {
                cacheControl: opts.cacheControl ?? "public, max-age=31536000",
                metadata: opts.metadata
            }
        });
        if (opts.makePublic) await file.makePublic();
        const [meta] = await file.getMetadata();
        const res = {
            path,
            size: Number(meta.size || 0),
            contentType: meta.contentType || opts.contentType,
            md5Hash: meta.md5Hash,
            generation: meta.generation ? String(meta.generation) : undefined,
            etag: meta.etag,
            mediaLink: meta.mediaLink,
            publicUrl: opts.makePublic ? this.getPublicUrl(path) : undefined
        };
        return res;
    }
    async uploadStream(readable, opts) {
        if (!allowedMime.has(opts.contentType)) throw new Error("Unsupported content type");
        const path = buildPath(opts);
        const file = this.bucket.file(path);
        const ws = file.createWriteStream({
            contentType: opts.contentType,
            gzip: opts.gzip ?? true,
            resumable: false,
            metadata: {
                cacheControl: opts.cacheControl ?? "public, max-age=31536000",
                metadata: opts.metadata
            }
        });
        return new Promise((resolve, reject)=>{
            ws.on("error", reject);
            ws.on("finish", async ()=>{
                try {
                    if (opts.makePublic) await file.makePublic();
                    const [meta] = await file.getMetadata();
                    resolve({
                        path,
                        size: Number(meta.size || 0),
                        contentType: meta.contentType || opts.contentType,
                        md5Hash: meta.md5Hash,
                        generation: meta.generation ? String(meta.generation) : undefined,
                        etag: meta.etag,
                        mediaLink: meta.mediaLink,
                        publicUrl: opts.makePublic ? this.getPublicUrl(path) : undefined
                    });
                } catch (e) {
                    reject(e);
                }
            });
            readable.pipe(ws);
        });
    }
    async getSignedUrl(path, expiresInSeconds = 3600) {
        const file = this.bucket.file(path);
        const options = {
            action: "read",
            expires: Date.now() + expiresInSeconds * 1000
        };
        const [url] = await file.getSignedUrl(options);
        return url;
    }
    getPublicUrl(path) {
        return `https://storage.googleapis.com/${this.bucket.name}/${path}`;
    }
    async delete(path) {
        const file = this.bucket.file(path);
        await file.delete({
            ignoreNotFound: true
        });
    }
    async exists(path) {
        const file = this.bucket.file(path);
        const [ok] = await file.exists();
        return ok;
    }
    async copy(srcPath, destPath) {
        const src = this.bucket.file(srcPath);
        const dest = this.bucket.file(destPath);
        await src.copy(dest);
    }
    async move(srcPath, destPath) {
        await this.copy(srcPath, destPath);
        await this.delete(srcPath);
    }
    async getMetadata(path) {
        const file = this.bucket.file(path);
        const [meta] = await file.getMetadata();
        return meta;
    }
}
function createFirebaseStorageFromEnv() {
    const projectId = process.env.FIREBASE_PROJECT_ID || "";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\r?\n/g, "\n");
    const bucket = process.env.FIREBASE_STORAGE_BUCKET || "";
    if (!projectId || !clientEmail || !privateKey || !bucket) throw new Error("Missing Firebase credentials");
    return new FirebaseStorage({
        projectId,
        clientEmail,
        privateKey,
        bucket
    });
}
;
}),
"[project]/lib/server/payment-requests.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateWalletBalance",
    ()=>calculateWalletBalance,
    "processPaymentRequest",
    ()=>processPaymentRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$bank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/security/bank.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-route] (ecmascript)");
;
;
;
async function processPaymentRequest(request, payload) {
    const ct = request.headers.get("content-type") || "";
    let data = {};
    let proofUrl = "";
    let proofMeta = {};
    if (ct.includes("multipart/form-data")) {
        const form = await request.formData();
        data = {
            projectId: form.get("projectId")?.toString(),
            amount: form.get("amount")?.toString(),
            bankName: form.get("bankName")?.toString(),
            branch: form.get("branch")?.toString(),
            accountType: form.get("accountType")?.toString(),
            accountNumber: form.get("accountNumber")?.toString()
        };
        const file = form.get("proof");
        if (file) {
            const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
            const buffer = Buffer.from(await file.arrayBuffer());
            const up = await storage.uploadBuffer(buffer, {
                category: "proof-of-delivery",
                filename: file.name || "proof",
                contentType: file.type || "application/octet-stream",
                projectId: data.projectId,
                userId: payload.sub
            });
            proofUrl = up.publicUrl || up.mediaLink || storage.getPublicUrl(up.path);
            proofMeta = {
                path: up.path,
                contentType: up.contentType,
                size: up.size
            };
        }
    } else {
        data = await request.json().catch(()=>({}));
        proofUrl = data.proofUrl || "";
        if (!proofUrl && typeof data.proofDataUrl === "string") {
            const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
            const b64 = data.proofDataUrl.split(",")[1];
            const buffer = Buffer.from(b64, "base64");
            const up = await storage.uploadBuffer(buffer, {
                category: "proof-of-delivery",
                filename: data.proofFilename || "proof",
                contentType: data.proofContentType || "application/octet-stream",
                projectId: data.projectId,
                userId: payload.sub
            });
            proofUrl = up.publicUrl || up.mediaLink || storage.getPublicUrl(up.path);
            proofMeta = {
                path: up.path,
                contentType: up.contentType,
                size: up.size
            };
        }
    }
    if (!data.amount || Number(data.amount) <= 0) throw new Error("Invalid amount");
    for (const k of [
        "bankName",
        "branch",
        "accountType",
        "accountNumber"
    ]){
        if (!data[k]) throw new Error(`Missing ${k}`);
    }
    if (!proofUrl) throw new Error("Proof of delivery is required");
    const encAcc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$security$2f$bank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptAccountNumber"])(String(data.accountNumber));
    const now = new Date();
    const y = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const recordDate = `${y}-${mm}-${d}`;
    const recordTime = `${h}:${min}`;
    const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].paymentRequest.create({
        data: {
            userId: payload.sub,
            userType: payload.role,
            projectId: data.projectId || null,
            amount: data.amount,
            bankName: data.bankName,
            branch: data.branch,
            accountType: data.accountType,
            accountNumberEnc: encAcc,
            proofUrl,
            proofPath: proofMeta.path,
            proofContentType: proofMeta.contentType,
            proofSize: proofMeta.size,
            recordDate,
            recordTime
        }
    });
    return created;
}
async function calculateWalletBalance(userId) {
    const [creditsAgg, debitsAgg] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].escrowWalletTransaction.aggregate({
            where: {
                userId,
                type: {
                    in: [
                        "received",
                        "refunded"
                    ]
                }
            },
            _sum: {
                amount: true
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].escrowWalletTransaction.aggregate({
            where: {
                userId,
                type: {
                    in: [
                        "requested",
                        "withdrawn"
                    ]
                }
            },
            _sum: {
                amount: true
            }
        })
    ]);
    const credits = Number(creditsAgg._sum.amount || 0);
    const debits = Number(debitsAgg._sum.amount || 0);
    return credits - debits;
}
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
"[project]/app/api/wallet/[userId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$payment$2d$requests$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/payment-requests.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/jwt.ts [app-route] (ecmascript)");
;
;
;
;
function isAuthorized(payload, userId) {
    if (!payload) return false;
    if (payload.sub === userId) return true;
    if (payload.role === "manager") return true;
    return false;
}
async function GET(request, { params }) {
    try {
        const auth = request.headers.get("authorization") || "";
        const m = /^Bearer\s+(.+)$/i.exec(auth);
        if (!m) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(m[1]);
        const { userId } = await params;
        if (!isAuthorized(payload, userId)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Forbidden"
        }, {
            status: 403
        });
        const [balance, pendingAgg] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$payment$2d$requests$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateWalletBalance"])(userId),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].paymentRequest.aggregate({
                where: {
                    userId,
                    status: "PENDING"
                },
                _sum: {
                    amount: true
                }
            })
        ]);
        const pending = Number(pendingAgg._sum.amount || 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            userId,
            balance,
            pending
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(e?.message || "Failed to load wallet summary")
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1dd16abb._.js.map