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
"[project]/app/api/bids/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.findMany({
            orderBy: {
                submittedAt: "desc"
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(items);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load bids"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fcd8a2bb._.js.map