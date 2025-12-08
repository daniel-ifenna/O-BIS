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
"[project]/app/api/projects/[id]/bids/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-route] (ecmascript)");
;
;
;
async function POST(request, { params }) {
    try {
        const body = await request.json();
        const required = [
            "bidderName",
            "companyName",
            "email",
            "amount",
            "duration"
        ];
        for (const k of required)if (!body[k]) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `${k} is required`
        }, {
            status: 400
        });
        const uploads = body.uploads || {};
        const requireUploads = String(process.env.REQUIRE_BID_UPLOADS || "").toLowerCase() === "true";
        const proposalDocs = uploads?.proposal;
        if (requireUploads) {
            if (!Array.isArray(proposalDocs) || proposalDocs.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "proposal upload is required"
                }, {
                    status: 400
                });
            }
        }
        const isUuid = (s)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
        const { id } = await params;
        let project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id
            }
        }).catch(()=>null);
        if (!project && !isUuid(id)) {
            try {
                const alt = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
                    where: {
                        title: {
                            equals: id,
                            mode: "insensitive"
                        }
                    }
                });
                if (alt) project = alt;
            } catch  {}
        }
        if (!project) {
            try {
                const latest = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
                    orderBy: {
                        createdAt: "desc"
                    }
                });
                if (latest) project = latest;
            } catch  {}
        }
        if (!project) {
            try {
                const { getProjectById } = await __turbopack_context__.A("[project]/lib/file-db.ts [app-route] (ecmascript, async loader)");
                const fileProj = await getProjectById(id);
                if (fileProj) project = fileProj;
            } catch  {}
        }
        if (!project) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
        if ([
            "Closed",
            "Awarded",
            "Completed"
        ].includes(project.status)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Bidding closed"
            }, {
                status: 403
            });
        }
        const maxBids = Number(project.maxBids || 0);
        if (maxBids > 0) {
            const countDb = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.count({
                where: {
                    projectId: id
                }
            }).catch(()=>0);
            const currentCount = countDb;
            if (currentCount >= maxBids) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Submission limit reached"
                }, {
                    status: 403
                });
            }
        }
        const bidDays = Number(project.bidDays || 0);
        if (bidDays > 0 && project.createdAt) {
            const closeDate = new Date(new Date(project.createdAt).getTime() + bidDays * 24 * 60 * 60 * 1000);
            if (new Date() > closeDate) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Submission window ended"
            }, {
                status: 403
            });
        }
        const rawAmount = String(body.amount);
        const amountStr = rawAmount.replace(/[^0-9.]/g, "");
        if (!amountStr || isNaN(Number(amountStr))) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "amount must be numeric"
        }, {
            status: 400
        });
        const durationNum = Number(String(body.duration));
        if (!Number.isFinite(durationNum) || durationNum <= 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "duration must be a positive number"
        }, {
            status: 400
        });
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const h = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const recordDate = `${y}-${m}-${d}`;
        const recordTime = `${h}:${min}`;
        let contractorId = null;
        if (typeof body.contractorId === "string" && body.contractorId && body.contractorId !== "public") {
            try {
                const exists = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contractor.findUnique({
                    where: {
                        id: body.contractorId
                    }
                });
                if (exists) contractorId = body.contractorId;
            } catch  {}
        }
        const targetProjectId = project?.id || id;
        try {
            const createdDb = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.create({
                data: {
                    projectId: targetProjectId,
                    contractorId,
                    bidderName: String(body.bidderName),
                    companyName: String(body.companyName),
                    email: String(body.email),
                    phone: body.phone ? String(body.phone) : null,
                    address: body.address ? String(body.address) : null,
                    amount: String(amountStr),
                    duration: durationNum,
                    message: body.message || null,
                    status: "New",
                    recordDate,
                    recordTime
                }
            });
            // Persist uploads (data URLs) into storage and FileStorageRecord
            {
                console.log("DEBUG: Processing uploads for bid", createdDb.id, "Keys:", Object.keys(body.uploads || {}));
                const storage = (()=>{
                    try {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
                    } catch  {
                        return null;
                    }
                })();
                const saveArray = async (label, category, arr)=>{
                    if (!Array.isArray(arr)) return [];
                    const urls = [];
                    for(let i = 0; i < arr.length; i++){
                        const v = arr[i];
                        if (typeof v !== "string") continue;
                        const m = /^data:([^;]+);base64,(.+)$/i.exec(v);
                        if (!m) continue;
                        const contentType = m[1];
                        const base64 = m[2];
                        const buffer = (()=>{
                            try {
                                return Buffer.from(base64, "base64");
                            } catch  {
                                return Buffer.from("");
                            }
                        })();
                        try {
                            if (storage) {
                                const up = await storage.uploadBuffer(buffer, {
                                    category,
                                    filename: `${label}_${i + 1}.pdf`,
                                    contentType,
                                    projectId: targetProjectId,
                                    bidId: createdDb.id,
                                    makePublic: true
                                });
                                const publicUrl = up.publicUrl || storage.getPublicUrl(up.path);
                                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.create({
                                    data: {
                                        category: category.replace(/-/g, "_"),
                                        url: publicUrl,
                                        path: up.path,
                                        contentType: up.contentType,
                                        size: up.size,
                                        projectId: targetProjectId,
                                        bidId: createdDb.id,
                                        recordDate,
                                        recordTime
                                    }
                                });
                                urls.push(publicUrl);
                            } else {
                                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.create({
                                    data: {
                                        category: category.replace(/-/g, "_"),
                                        url: v,
                                        path: `${label}_${i + 1}.pdf`,
                                        contentType,
                                        size: buffer.length || 0,
                                        projectId: targetProjectId,
                                        bidId: createdDb.id,
                                        recordDate,
                                        recordTime
                                    }
                                });
                                urls.push(v);
                            }
                        } catch (err) {
                            console.error("File create error (falling back to local):", err);
                            // Fallback: Create record with base64 data
                            try {
                                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.create({
                                    data: {
                                        category: category.replace(/-/g, "_"),
                                        url: v,
                                        path: `${label}_${i + 1}.pdf`,
                                        contentType,
                                        size: buffer.length || 0,
                                        projectId: targetProjectId,
                                        bidId: createdDb.id,
                                        recordDate,
                                        recordTime
                                    }
                                });
                            } catch (dbErr) {
                                console.error("Failed to create fallback file record:", dbErr);
                            }
                            urls.push(v);
                        }
                    }
                    return urls;
                };
                const uploadsObj = body.uploads || {};
                const uploadedProposal = await saveArray("proposal", "technical-proposals", uploadsObj.proposal);
                const uploadedProfile = await saveArray("profile", "technical-proposals", uploadsObj.profile);
                const uploadedSpecs = await saveArray("specs", "procurement-specifications", uploadsObj.specs);
                const uploadedTax = await saveArray("tax", "financial-proposals", uploadsObj.tax);
                const uploadedBond = await saveArray("bond", "financial-proposals", uploadsObj.bond);
                const uploadedAdditional = await saveArray("additional", "technical-proposals", uploadsObj.additional);
                createdDb.uploads = {
                    proposal: uploadedProposal,
                    profile: uploadedProfile,
                    specs: uploadedSpecs,
                    tax: uploadedTax,
                    bond: uploadedBond,
                    additional: uploadedAdditional
                };
                createdDb.subcontractors = Array.isArray(body.subcontractors) ? body.subcontractors : [];
            }
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.update({
                    where: {
                        id: targetProjectId
                    },
                    data: {
                        status: project.status === "Published" ? "Bidding" : project.status
                    }
                });
            } catch  {}
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(createdDb, {
                status: 201
            });
        } catch (e) {
            // Fallback to file DB when Prisma is unavailable
            try {
                const { createBid, saveBids } = await __turbopack_context__.A("[project]/lib/file-db.ts [app-route] (ecmascript, async loader)");
                const createdFile = await createBid(targetProjectId, {
                    bidderName: String(body.bidderName),
                    companyName: String(body.companyName),
                    email: String(body.email),
                    phone: body.phone ? String(body.phone) : "",
                    address: body.address ? String(body.address) : "",
                    amount: String(amountStr),
                    duration: durationNum,
                    message: body.message || "",
                    contractorId: String(body.contractorId || "")
                });
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(createdFile, {
                    status: 201
                });
            } catch (err) {
                console.error("POST /api/projects/", id, "bids", JSON.stringify({
                    body
                }), String(e?.message || e));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to submit bid"
                }, {
                    status: 500
                });
            }
        }
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to submit bid"
        }, {
            status: 500
        });
    }
}
async function GET(_, { params }) {
    try {
        const { id } = await params;
        const storage = (()=>{
            try {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFirebaseStorageFromEnv"])();
            } catch  {
                return null;
            }
        })();
        const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.findMany({
            where: {
                projectId: id
            },
            orderBy: {
                submittedAt: "desc"
            },
            include: {
                files: true
            }
        });
        const nameFromPath = (path)=>{
            if (!path) return "";
            const base = path.split("/").pop() || "";
            const idx = base.indexOf("-");
            return idx >= 0 ? base.slice(idx + 1) : base;
        };
        const withUrl = (rec)=>{
            let url = rec.url;
            if (!url && rec.path && storage) {
                try {
                    url = storage.getPublicUrl(rec.path);
                } catch  {}
            }
            return url;
        };
        const mapped = items.map((b)=>{
            const uploads = {
                proposal: [],
                profile: [],
                specs: [],
                tax: [],
                bond: [],
                additional: []
            };
            for (const f of b.files || []){
                const name = nameFromPath(f.path).toLowerCase();
                const url = withUrl(f);
                if (!url) continue;
                if (name.startsWith("proposal")) uploads.proposal.push(url);
                else if (name.startsWith("profile")) uploads.profile.push(url);
                else if (name.startsWith("specs")) uploads.specs.push(url);
                else if (name.startsWith("tax")) uploads.tax.push(url);
                else if (name.startsWith("bond")) uploads.bond.push(url);
                else if (name.startsWith("additional")) uploads.additional.push(url);
            }
            return {
                ...b,
                uploads
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mapped);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load project bids"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1dad4a7f._.js.map