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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/file-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addBidInvitation",
    ()=>addBidInvitation,
    "addQuoteToProcurement",
    ()=>addQuoteToProcurement,
    "createBid",
    ()=>createBid,
    "createComplaint",
    ()=>createComplaint,
    "createDailyReport",
    ()=>createDailyReport,
    "createProject",
    ()=>createProject,
    "createRoleProfile",
    ()=>createRoleProfile,
    "createUser",
    ()=>createUser,
    "createVendorProfile",
    ()=>createVendorProfile,
    "deleteBidById",
    ()=>deleteBidById,
    "findUserByEmail",
    ()=>findUserByEmail,
    "findVendorProfileById",
    ()=>findVendorProfileById,
    "getBidById",
    ()=>getBidById,
    "getBidInvitations",
    ()=>getBidInvitations,
    "getBidInvitationsByBidId",
    ()=>getBidInvitationsByBidId,
    "getBids",
    ()=>getBids,
    "getBidsByProjectId",
    ()=>getBidsByProjectId,
    "getComplaints",
    ()=>getComplaints,
    "getComplaintsByManager",
    ()=>getComplaintsByManager,
    "getDailyReports",
    ()=>getDailyReports,
    "getDailyReportsByProjectId",
    ()=>getDailyReportsByProjectId,
    "getMilestones",
    ()=>getMilestones,
    "getMilestonesByProjectId",
    ()=>getMilestonesByProjectId,
    "getProcurementById",
    ()=>getProcurementById,
    "getProcurements",
    ()=>getProcurements,
    "getProjectById",
    ()=>getProjectById,
    "getProjects",
    ()=>getProjects,
    "getResetTokens",
    ()=>getResetTokens,
    "getUsers",
    ()=>getUsers,
    "getVendorProfiles",
    ()=>getVendorProfiles,
    "sanitizeUser",
    ()=>sanitizeUser,
    "saveBidInvitations",
    ()=>saveBidInvitations,
    "saveBids",
    ()=>saveBids,
    "saveComplaints",
    ()=>saveComplaints,
    "saveDailyReports",
    ()=>saveDailyReports,
    "saveMilestones",
    ()=>saveMilestones,
    "saveProcurements",
    ()=>saveProcurements,
    "saveProjects",
    ()=>saveProjects,
    "saveResetTokens",
    ()=>saveResetTokens,
    "saveVendorProfiles",
    ()=>saveVendorProfiles,
    "setProjectMilestones",
    ()=>setProjectMilestones,
    "updateBidById",
    ()=>updateBidById,
    "updateComplaintStatus",
    ()=>updateComplaintStatus,
    "updateMilestoneProgress",
    ()=>updateMilestoneProgress,
    "updateProjectById",
    ()=>updateProjectById,
    "updateUserPasswordById",
    ()=>updateUserPasswordById
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const dataDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data");
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
async function ensureDir() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].mkdir(dataDir, {
        recursive: true
    });
}
function filePath(name) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, `${name}.json`);
}
async function readJson(name, defaultValue) {
    await ensureDir();
    const fp = filePath(name);
    try {
        const buf = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].readFile(fp, "utf8");
        return JSON.parse(buf);
    } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ERR_MODULE_NOT_FOUND")) {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].writeFile(fp, JSON.stringify(defaultValue, null, 2), "utf8");
            return defaultValue;
        }
        throw e;
    }
}
async function writeJson(name, data) {
    await ensureDir();
    const fp = filePath(name);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].writeFile(fp, JSON.stringify(data, null, 2), "utf8");
}
async function getUsers() {
    return readJson("users", []);
}
async function findUserByEmail(email) {
    const users = await getUsers();
    return users.find((u)=>u.email.toLowerCase() === email.toLowerCase());
}
async function updateUserPasswordById(userId, newHash) {
    const users = await getUsers();
    const next = users.map((u)=>u.id === userId ? {
            ...u,
            passwordHash: newHash,
            updatedAt: new Date().toISOString()
        } : u);
    await writeJson("users", next);
    return next.find((u)=>u.id === userId);
}
async function getResetTokens() {
    return readJson("reset_tokens", []);
}
async function saveResetTokens(items) {
    await writeJson("reset_tokens", items);
}
async function createUser(user) {
    const users = await getUsers();
    const now = new Date();
    const iso = now.toISOString();
    const newUser = {
        ...user,
        id: `${Date.now()}`,
        createdAt: iso,
        updatedAt: iso
    };
    newUser.recordDate = fmtDate(now);
    newUser.recordTime = fmtTime(now);
    await writeJson("users", [
        newUser,
        ...users
    ]);
    return newUser;
}
function sanitizeUser(u) {
    const { passwordHash, ...rest } = u;
    return rest;
}
async function createRoleProfile(user) {
    const now = new Date();
    const iso = now.toISOString();
    const profile = {
        id: `${user.role}-${Date.now()}`,
        userId: user.id,
        email: user.email,
        companyName: user.company,
        createdAt: iso,
        updatedAt: iso
    };
    profile.recordDate = fmtDate(now);
    profile.recordTime = fmtTime(now);
    if (user.role === "vendor") {
        const arr = await readJson("vendor_profiles", []);
        await writeJson("vendor_profiles", [
            profile,
            ...arr
        ]);
        return;
    }
    if (user.role === "manager") {
        const arr = await readJson("managers", []);
        await writeJson("managers", [
            profile,
            ...arr
        ]);
        return;
    }
    if (user.role === "contractor") {
        const arr = await readJson("contractors", []);
        await writeJson("contractors", [
            profile,
            ...arr
        ]);
        return;
    }
}
async function getProcurements() {
    return readJson("public_procurements", []);
}
async function saveProcurements(items) {
    await writeJson("public_procurements", items);
}
async function getProcurementById(id) {
    const arr = await getProcurements();
    return arr.find((p)=>p.id === id);
}
async function addQuoteToProcurement(procurementId, quote) {
    const arr = await getProcurements();
    const next = arr.map((p)=>{
        if (p.id === procurementId) {
            const updated = {
                ...p,
                quotes: [
                    ...p.quotes || [],
                    quote
                ],
                status: "quoted"
            };
            return updated;
        }
        return p;
    });
    await saveProcurements(next);
    return next.find((p)=>p.id === procurementId);
}
async function getVendorProfiles() {
    return readJson("vendor_profiles", []);
}
async function saveVendorProfiles(items) {
    await writeJson("vendor_profiles", items);
}
async function findVendorProfileById(id) {
    const arr = await getVendorProfiles();
    return arr.find((v)=>v.id === id);
}
async function createVendorProfile(profile) {
    const arr = await getVendorProfiles();
    const next = [
        profile,
        ...arr
    ];
    await saveVendorProfiles(next);
    return profile;
}
async function getComplaints() {
    return readJson("contractor_complaints", []);
}
async function saveComplaints(items) {
    await writeJson("contractor_complaints", items);
}
async function createComplaint(input) {
    const arr = await getComplaints();
    const now = new Date();
    const iso = now.toISOString();
    const id = `complaint-${Date.now()}`;
    const complaint = {
        ...input,
        id,
        filedAt: iso
    };
    complaint.recordDate = fmtDate(now);
    complaint.recordTime = fmtTime(now);
    await saveComplaints([
        complaint,
        ...arr
    ]);
    return complaint;
}
async function updateComplaintStatus(id, status) {
    const arr = await getComplaints();
    const now = new Date();
    const next = arr.map((c)=>c.id === id ? {
            ...c,
            status,
            acknowledgedAt: status === "acknowledged" ? now.toISOString() : c.acknowledgedAt,
            recordDate: fmtDate(now),
            recordTime: fmtTime(now)
        } : c);
    await saveComplaints(next);
    return next.find((c)=>c.id === id);
}
async function getComplaintsByManager(managerId) {
    const arr = await getComplaints();
    return arr.filter((c)=>c.managerId === managerId);
}
async function getBids() {
    return readJson("bids", []);
}
async function saveBids(items) {
    await writeJson("bids", items);
}
async function getBidsByProjectId(projectId) {
    const arr = await getBids();
    return arr.filter((b)=>String(b.projectId) === String(projectId));
}
async function getBidById(id) {
    const arr = await getBids();
    return arr.find((b)=>b.id === id);
}
async function createBid(projectId, bid) {
    const arr = await getBids();
    const now = new Date();
    const iso = now.toISOString();
    const newBid = {
        ...bid,
        id: `bid-${Date.now()}`,
        projectId: String(projectId),
        status: "New",
        submittedAt: iso
    };
    newBid.recordDate = fmtDate(now);
    newBid.recordTime = fmtTime(now);
    await saveBids([
        newBid,
        ...arr
    ]);
    return newBid;
}
async function updateBidById(id, updates) {
    const arr = await getBids();
    const now = new Date();
    const next = arr.map((b)=>b.id === id ? {
            ...b,
            ...updates,
            recordDate: fmtDate(now),
            recordTime: fmtTime(now)
        } : b);
    await saveBids(next);
    return next.find((b)=>b.id === id);
}
async function deleteBidById(id) {
    const arr = await getBids();
    await saveBids(arr.filter((b)=>b.id !== id));
}
async function getBidInvitations() {
    return readJson("bidInvitations", []);
}
async function saveBidInvitations(items) {
    await writeJson("bidInvitations", items);
}
async function getBidInvitationsByBidId(bidId) {
    const arr = await getBidInvitations();
    return arr.filter((r)=>r.bidId === bidId);
}
async function addBidInvitation(record) {
    const arr = await getBidInvitations();
    const now = new Date();
    const iso = now.toISOString();
    const item = {
        ...record,
        id: `inv-${Date.now()}`,
        createdAt: iso,
        recordDate: fmtDate(now),
        recordTime: fmtTime(now)
    };
    await saveBidInvitations([
        item,
        ...arr
    ]);
    return item;
}
async function getProjects() {
    return readJson("projects", []);
}
async function saveProjects(items) {
    await writeJson("projects", items);
}
async function getProjectById(id) {
    const arr = await getProjects();
    return arr.find((p)=>String(p.id) === String(id));
}
async function createProject(project) {
    const arr = await getProjects();
    const id = Date.now();
    const now = new Date();
    const iso = now.toISOString();
    const newProject = {
        ...project,
        id,
        createdAt: iso
    };
    newProject.recordDate = fmtDate(now);
    newProject.recordTime = fmtTime(now);
    await saveProjects([
        newProject,
        ...arr
    ]);
    return newProject;
}
async function updateProjectById(id, updates) {
    const arr = await getProjects();
    const now = new Date();
    const next = arr.map((p)=>String(p.id) === String(id) ? {
            ...p,
            ...updates,
            recordDate: fmtDate(now),
            recordTime: fmtTime(now)
        } : p);
    await saveProjects(next);
    return next.find((p)=>String(p.id) === String(id));
}
async function getMilestones() {
    return readJson("milestones", []);
}
async function saveMilestones(items) {
    await writeJson("milestones", items);
}
async function getMilestonesByProjectId(projectId) {
    const arr = await getMilestones();
    return arr.filter((m)=>String(m.projectId) === String(projectId));
}
async function setProjectMilestones(projectId, items) {
    const existing = await getMilestones();
    const filtered = existing.filter((m)=>String(m.projectId) !== String(projectId));
    const nowItems = items.map((i)=>({
            id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            projectId: String(projectId),
            name: i.name,
            startDate: i.startDate,
            endDate: i.endDate,
            weight: i.weight,
            progress: 0,
            status: "Pending"
        }));
    await saveMilestones([
        ...nowItems,
        ...filtered
    ]);
    return nowItems;
}
async function updateMilestoneProgress(projectId, milestoneId, newProgress) {
    const arr = await getMilestones();
    const next = arr.map((m)=>{
        if (m.id === milestoneId && String(m.projectId) === String(projectId)) {
            const progress = Math.max(m.progress, Math.min(100, newProgress));
            const status = progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending";
            return {
                ...m,
                progress,
                status
            };
        }
        return m;
    });
    await saveMilestones(next);
    return next.find((m)=>m.id === milestoneId);
}
async function getDailyReports() {
    return readJson("daily_reports", []);
}
async function saveDailyReports(items) {
    await writeJson("daily_reports", items);
}
async function getDailyReportsByProjectId(projectId) {
    const arr = await getDailyReports();
    return arr.filter((r)=>String(r.projectId) === String(projectId));
}
async function createDailyReport(report) {
    const arr = await getDailyReports();
    const now = new Date();
    const newReport = {
        ...report,
        id: `dr-${Date.now()}`
    };
    newReport.recordDate = fmtDate(now);
    newReport.recordTime = fmtTime(now);
    await saveDailyReports([
        newReport,
        ...arr
    ]);
    return newReport;
}
}),
"[project]/app/api/projects/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$file$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/file-db.ts [app-route] (ecmascript)");
;
;
;
async function GET(_, { params }) {
    try {
        const { id } = await params;
        const p = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id
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
        if (!p) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not found"
            }, {
                status: 404
            });
        }
        let storage = null;
        try {
            storage = (await __turbopack_context__.A("[project]/lib/storage.ts [app-route] (ecmascript, async loader)")).createFirebaseStorageFromEnv();
        } catch  {}
        const docs = (async ()=>{
            const pick = (cat)=>p.files.find((f)=>String(f.category).toLowerCase() === cat);
            const nameFromPath = (path)=>{
                if (!path) return undefined;
                const base = path.split("/").pop() || "";
                const idx = base.indexOf("-");
                return idx >= 0 ? base.slice(idx + 1) : base;
            };
            const itb = pick("bidding_documents");
            const specs = pick("technical_proposals");
            const boq = pick("procurement_specifications");
            const financial = pick("financial_proposals");
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
            const itbInfo = await withUrl(itb);
            const specsInfo = await withUrl(specs);
            const boqInfo = await withUrl(boq);
            const financialInfo = await withUrl(financial);
            return {
                itb: itbInfo.name,
                itbUrl: itbInfo.url,
                specs: specsInfo.name,
                specsUrl: specsInfo.url,
                boq: boqInfo.name,
                boqUrl: boqInfo.url,
                financial: financialInfo.name,
                financialUrl: financialInfo.url
            };
        })();
        const item = {
            ...p,
            bids: Number(p._count?.bids || 0),
            budget: String(p.budget ?? ""),
            documents: await docs
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(item);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load project"
        }, {
            status: 500
        });
    }
}
async function PATCH(request, { params }) {
    try {
        const body = await request.json().catch(()=>({}));
        const cleanNum = (v)=>{
            const s = String(v ?? "");
            const n = Number(s.replace(/[^0-9.\-]/g, ""));
            return Number.isFinite(n) ? String(n) : undefined;
        };
        const allowedStatuses = new Set([
            "Published",
            "Bidding",
            "Closed",
            "Awarded",
            "In Progress",
            "Completed"
        ]);
        const updates = {};
        if (typeof body.status === "string" && allowedStatuses.has(body.status)) updates.status = body.status;
        if (typeof body.managerId === "string") updates.managerId = body.managerId || null;
        if (typeof body.contractorId === "string") updates.contractorId = body.contractorId || null;
        if (typeof body.title === "string") updates.title = body.title;
        if (typeof body.location === "string") updates.location = body.location;
        if (typeof body.budget !== "undefined") {
            const b = cleanNum(body.budget);
            updates.budget = b ?? null;
        }
        if (typeof body.category === "string") updates.category = body.category;
        if (typeof body.description === "string") updates.description = body.description;
        if (typeof body.bidDays !== "undefined") updates.bidDays = body.bidDays ? Number(body.bidDays) : null;
        if (typeof body.maxBids !== "undefined") updates.maxBids = body.maxBids ? Number(body.maxBids) : null;
        if (typeof body.acceptedBidDays !== "undefined") updates.acceptedBidDays = body.acceptedBidDays ? Number(body.acceptedBidDays) : null;
        try {
            const { id } = await params;
            const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.update({
                where: {
                    id
                },
                data: updates
            });
            const withCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
                where: {
                    id
                },
                include: {
                    _count: {
                        select: {
                            bids: true
                        }
                    }
                }
            });
            const item = {
                ...withCount,
                bids: Number(withCount?._count?.bids || 0),
                budget: String(withCount?.budget ?? "")
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(item);
        } catch (err) {
            const { id } = await params;
            try {
                const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$file$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateProjectById"])(id, updates);
                if (!updated) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to update project"
                }, {
                    status: 500
                });
                const item = {
                    ...updated,
                    bids: Number(updated.bids || 0),
                    budget: String(updated.budget ?? "")
                };
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(item);
            } catch (e) {
                console.error("PATCH /api/projects/", id, JSON.stringify({
                    body,
                    updates
                }), String(err?.message || err));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to update project"
                }, {
                    status: 500
                });
            }
        }
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update project"
        }, {
            status: 500
        });
    }
}
async function DELETE(_, { params }) {
    try {
        ;
        process.env.ALLOW_DELETE = "true";
        const { id } = await params;
        const proj = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id
            },
            include: {
                paymentRequests: true
            }
        });
        if (!proj) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
        if (proj.status === "Awarded" || proj.status === "Completed" || proj.contractorId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cannot delete awarded or completed projects"
            }, {
                status: 409
            });
        }
        const hasActivePayments = (proj.paymentRequests || []).some((p)=>String(p.status) !== "REJECTED");
        if (hasActivePayments) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cannot delete project with active payment requests"
            }, {
                status: 409
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bidInvitation.deleteMany({
            where: {
                projectId: id
            }
        });
        const procurements = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].procurementRequest.findMany({
            where: {
                projectId: id
            },
            select: {
                id: true
            }
        });
        const procurementIds = procurements.map((p)=>p.id);
        if (procurementIds.length) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vendorQuote.deleteMany({
                where: {
                    procurementId: {
                        in: procurementIds
                    }
                }
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dailyReport.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].milestone.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].paymentRequest.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].bid.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].procurementRequest.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].escrowWalletTransaction.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fileStorageRecord.deleteMany({
            where: {
                projectId: id
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.delete({
            where: {
                id
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to delete project"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__74217710._.js.map