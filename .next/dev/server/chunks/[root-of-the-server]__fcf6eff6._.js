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
"[project]/app/api/projects/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/jwt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    try {
        const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                _count: {
                    select: {
                        bids: true
                    }
                },
                files: true
            }
        });
        let storage = null;
        try {
            storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
        } catch  {}
        const mapped = await Promise.all(items.map(async (p)=>{
            const pick = (cat)=>p.files?.find((f)=>String(f.category).toLowerCase() === cat);
            const nameFromPath = (path)=>{
                if (!path) return undefined;
                const base = path.split("/").pop() || "";
                const idx = base.indexOf("-");
                return idx >= 0 ? base.slice(idx + 1) : base;
            };
            const withUrl = async (rec)=>{
                if (!rec) return {
                    name: undefined,
                    url: undefined
                };
                const name = nameFromPath(rec.path);
                let url = rec.url;
                if (!url && rec.path && storage) {
                    try {
                        url = await storage.getSignedUrl(rec.path, 3600);
                    } catch  {
                        try {
                            url = storage.getPublicUrl(rec.path);
                        } catch  {}
                    }
                }
                return {
                    name,
                    url
                };
            };
            const itbRec = pick("bidding_documents");
            const specsRec = pick("technical_proposals");
            const boqRec = pick("procurement_specifications");
            const financialRec = pick("financial_proposals");
            const itbInfo = await withUrl(itbRec);
            const specsInfo = await withUrl(specsRec);
            const boqInfo = await withUrl(boqRec);
            const financialInfo = await withUrl(financialRec);
            const documents = {
                itb: itbInfo.name,
                itbUrl: itbInfo.url,
                specs: specsInfo.name,
                specsUrl: specsInfo.url,
                boq: boqInfo.name,
                boqUrl: boqInfo.url,
                financial: financialInfo.name,
                financialUrl: financialInfo.url
            };
            return {
                ...p,
                id: p.id,
                title: p.title,
                location: p.location,
                budget: String(p.budget ?? ""),
                status: p.status,
                bids: Number(p._count?.bids || 0),
                documents
            };
        }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mapped);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load projects"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const body = await request.json();
    try {
        const required = [
            "title",
            "location",
            "budget"
        ];
        for (const k of required)if (!body[k]) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `${k} is required`
        }, {
            status: 400
        });
        const cleanNum = (v)=>{
            const s = String(v ?? "");
            const n = Number(s.replace(/[^0-9.\-]/g, ""));
            return Number.isFinite(n) ? String(n) : undefined;
        };
        const auth = request.headers.get("authorization") || "";
        const bearerMatch = /^Bearer\s+(.+)$/i.exec(auth);
        const payload = bearerMatch ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(bearerMatch[1]) : null;
        let managerId = null;
        if (payload && payload.role === "manager") {
            try {
                const mgr = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].manager.findUnique({
                    where: {
                        userId: payload.sub
                    }
                });
                managerId = mgr?.id || null;
            } catch  {}
        }
        const now = new Date();
        const y = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const h = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const recordDate = `${y}-${mm}-${d}`;
        const recordTime = `${h}:${min}`;
        const budgetClean = cleanNum(body.budget);
        if (budgetClean == null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid budget"
            }, {
                status: 400
            });
        }
        const estimatedClean = body.estimatedCost != null ? cleanNum(body.estimatedCost) : undefined;
        if (body.estimatedCost != null && estimatedClean == null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid estimatedCost"
            }, {
                status: 400
            });
        }
        const contingencyClean = body.contingency != null ? cleanNum(body.contingency) : undefined;
        if (body.contingency != null && contingencyClean == null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid contingency"
            }, {
                status: 400
            });
        }
        const contingencyPercentClean = body.contingencyPercent != null ? cleanNum(body.contingencyPercent) : undefined;
        if (body.contingencyPercent != null && contingencyPercentClean == null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid contingencyPercent"
            }, {
                status: 400
            });
        }
        const retentionPercentClean = body.retentionPercent != null ? cleanNum(body.retentionPercent) : undefined;
        if (body.retentionPercent != null && retentionPercentClean == null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid retentionPercent"
            }, {
                status: 400
            });
        }
        let resolvedManagerId = managerId;
        if (!resolvedManagerId && body.managerId) {
            try {
                const mgrById = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].manager.findUnique({
                    where: {
                        id: String(body.managerId)
                    }
                });
                if (mgrById) {
                    resolvedManagerId = mgrById.id;
                } else {
                    const mgrByUser = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].manager.findUnique({
                        where: {
                            userId: String(body.managerId)
                        }
                    });
                    resolvedManagerId = mgrByUser?.id || null;
                }
            } catch  {}
        }
        let created = null;
        let mapped = null;
        try {
            created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.create({
                data: {
                    title: String(body.title),
                    location: String(body.location),
                    budget: budgetClean,
                    status: body.status || "Published",
                    bidsCount: Number(body.bids ?? 0),
                    estimatedCost: estimatedClean ?? null,
                    contingency: contingencyClean ?? null,
                    contingencyPercent: contingencyPercentClean ?? null,
                    paymentSchedule: body.paymentSchedule || null,
                    paymentTerms: body.paymentTerms || null,
                    retentionPercent: retentionPercentClean ?? null,
                    category: body.category || null,
                    description: body.detailedDescription || body.description || null,
                    clientName: body.clientName || null,
                    clientCompany: body.clientCompany || null,
                    bidDays: body.bidDays ? Number(body.bidDays) : null,
                    maxBids: body.maxBids ? Number(body.maxBids) : null,
                    managerId: resolvedManagerId,
                    contractorId: body.contractorId || null,
                    recordDate,
                    recordTime
                }
            });
            mapped = {
                ...created,
                bids: Number(created.bidsCount || 0),
                budget: String(created.budget ?? "")
            };
        } catch  {
            const { createProject } = await __turbopack_context__.A("[project]/lib/file-db.ts [app-route] (ecmascript, async loader)");
            const createdFile = await createProject({
                title: String(body.title),
                location: String(body.location),
                budget: String(budgetClean),
                status: body.status || "Published",
                bids: Number(body.bids ?? 0),
                estimatedCost: String(estimatedClean ?? ""),
                contingency: String(contingencyClean ?? ""),
                contingencyPercent: String(contingencyPercentClean ?? ""),
                paymentSchedule: body.paymentSchedule || "",
                paymentTerms: body.paymentTerms || "",
                retentionPercent: String(retentionPercentClean ?? ""),
                category: body.category || undefined,
                description: body.detailedDescription || body.description || undefined,
                detailedDescription: body.detailedDescription || undefined,
                managerId: resolvedManagerId || payload?.sub || "manager-1",
                contractorId: body.contractorId || undefined,
                bidDays: body.bidDays ? Number(body.bidDays) : undefined,
                maxBids: body.maxBids ? Number(body.maxBids) : undefined,
                clientName: body.clientName || undefined,
                clientCompany: body.clientCompany || undefined,
                documents: {}
            });
            mapped = {
                ...createdFile,
                budget: String(createdFile.budget ?? "")
            };
        }
        try {
            const docsInput = body.documents || {};
            const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
            const now2 = new Date();
            const yy = now2.getFullYear();
            const mm2 = String(now2.getMonth() + 1).padStart(2, "0");
            const dd2 = String(now2.getDate()).padStart(2, "0");
            const hh2 = String(now2.getHours()).padStart(2, "0");
            const mn2 = String(now2.getMinutes()).padStart(2, "0");
            const recordDate2 = `${yy}-${mm2}-${dd2}`;
            const recordTime2 = `${hh2}:${mn2}`;
            const nameAndUrl = async (label, url, defaultCatHyphen)=>{
                if (!url || typeof url !== "string") return undefined;
                if (!url.startsWith("data:")) return undefined;
                const match = /^data:([^;]+);base64,(.+)$/i.exec(url);
                if (!match) return undefined;
                const contentType = match[1];
                const base64 = match[2];
                const buffer = Buffer.from(base64, "base64");
                const catHyphen = defaultCatHyphen || "bidding-documents";
                const catDb = String(catHyphen).replace(/-/g, "_");
                try {
                    const result = await storage.uploadBuffer(buffer, {
                        category: catHyphen,
                        filename: `${label}.pdf`,
                        contentType,
                        projectId: created.id,
                        makePublic: true
                    });
                    const urlPublic = result.publicUrl || storage.getPublicUrl(result.path);
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.create({
                        data: {
                            category: catDb,
                            url: urlPublic,
                            path: result.path,
                            contentType,
                            size: result.size,
                            projectId: created.id,
                            recordDate: recordDate2,
                            recordTime: recordTime2
                        }
                    });
                    return {
                        name: `${label}.pdf`,
                        url: urlPublic
                    };
                } catch  {
                    const fakePath = `data-url/${created.id}/${label}.pdf`;
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.create({
                        data: {
                            category: catDb,
                            url,
                            path: fakePath,
                            contentType,
                            size: buffer.length,
                            projectId: created.id,
                            recordDate: recordDate2,
                            recordTime: recordTime2
                        }
                    });
                    return {
                        name: `${label}.pdf`,
                        url
                    };
                }
            };
            const itb = await nameAndUrl("itb", docsInput.itbUrl, "bidding-documents");
            const specs = await nameAndUrl("specs", docsInput.specsUrl, "technical-proposals");
            const boq = await nameAndUrl("boq", docsInput.boqUrl, "procurement-specifications");
            const financial = await nameAndUrl("financial", docsInput.financialUrl, "financial-proposals");
            mapped.documents = {
                itb: itb?.name,
                itbUrl: itb?.url,
                specs: specs?.name,
                specsUrl: specs?.url,
                boq: boq?.name,
                boqUrl: boq?.url,
                financial: financial?.name,
                financialUrl: financial?.url
            };
        } catch  {}
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mapped, {
            status: 201
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(e?.message || "Failed to create project")
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fcf6eff6._.js.map