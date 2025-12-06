module.exports = [
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__70e9d341._.js.map