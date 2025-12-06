import admin from "firebase-admin"
import type { Bucket } from "@google-cloud/storage"

export type StorageCategory =
  | "bidding-documents"
  | "technical-proposals"
  | "financial-proposals"
  | "procurement-specifications"
  | "vendor-quotations"
  | "contracts"
  | "progress-photos"
  | "proof-of-delivery"

export type FirebaseConfig = {
  projectId: string
  clientEmail: string
  privateKey: string
  bucket: string
}

export type UploadOptions = {
  category: StorageCategory
  filename: string
  contentType: string
  projectId?: string
  bidId?: string
  procurementId?: string
  vendorId?: string
  userId?: string
  cacheControl?: string
  makePublic?: boolean
  gzip?: boolean
  metadata?: Record<string, string>
}

export type UploadResult = {
  path: string
  size: number
  contentType: string
  md5Hash?: string
  generation?: string
  etag?: string
  mediaLink?: string
  publicUrl?: string
  signedUrl?: string
}

const allowedMime = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/png",
])

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|^\.|\.$/g, "")
}

function ts(): string {
  return new Date().toISOString().replace(/[^0-9]/g, "")
}

function buildPath(o: UploadOptions): string {
  const parts: string[] = [o.category]
  if (o.projectId) parts.push(`project_${o.projectId}`)
  if (o.bidId) parts.push(`bid_${o.bidId}`)
  if (o.procurementId) parts.push(`proc_${o.procurementId}`)
  if (o.vendorId) parts.push(`vendor_${o.vendorId}`)
  if (o.userId) parts.push(`user_${o.userId}`)
  const name = `${ts()}-${sanitize(o.filename)}`
  parts.push(name)
  return parts.join("/")
}

class FirebaseStorage {
  private bucket: Bucket

  constructor(cfg: FirebaseConfig) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: cfg.projectId,
          clientEmail: cfg.clientEmail,
          privateKey: cfg.privateKey.replace(/\\n/g, "\n"),
        }),
        storageBucket: cfg.bucket,
      })
    }
    this.bucket = admin.storage().bucket(cfg.bucket)
  }

  async uploadBuffer(buf: Buffer, opts: UploadOptions): Promise<UploadResult> {
    if (!allowedMime.has(opts.contentType)) throw new Error("Unsupported content type")
    const path = buildPath(opts)
    const file = this.bucket.file(path)
    await file.save(buf, {
      contentType: opts.contentType,
      gzip: opts.gzip ?? true,
      resumable: false,
      metadata: { cacheControl: opts.cacheControl ?? "public, max-age=31536000", metadata: opts.metadata },
    })
    if (opts.makePublic) await file.makePublic()
    const [meta] = await file.getMetadata()
    const res: UploadResult = {
      path,
      size: Number(meta.size || 0),
      contentType: meta.contentType || opts.contentType,
      md5Hash: meta.md5Hash,
      generation: meta.generation ? String(meta.generation) : undefined,
      etag: meta.etag,
      mediaLink: meta.mediaLink,
      publicUrl: opts.makePublic ? this.getPublicUrl(path) : undefined,
    }
    return res
  }

  async uploadStream(readable: NodeJS.ReadableStream, opts: UploadOptions): Promise<UploadResult> {
    if (!allowedMime.has(opts.contentType)) throw new Error("Unsupported content type")
    const path = buildPath(opts)
    const file = this.bucket.file(path)
    const ws = file.createWriteStream({
      contentType: opts.contentType,
      gzip: opts.gzip ?? true,
      resumable: false,
      metadata: { cacheControl: opts.cacheControl ?? "public, max-age=31536000", metadata: opts.metadata },
    })
    return new Promise<UploadResult>((resolve, reject) => {
      ws.on("error", reject)
      ws.on("finish", async () => {
        try {
          if (opts.makePublic) await file.makePublic()
          const [meta] = await file.getMetadata()
          resolve({
            path,
            size: Number(meta.size || 0),
            contentType: meta.contentType || opts.contentType,
            md5Hash: meta.md5Hash,
            generation: meta.generation ? String(meta.generation) : undefined,
            etag: meta.etag,
            mediaLink: meta.mediaLink,
            publicUrl: opts.makePublic ? this.getPublicUrl(path) : undefined,
          })
        } catch (e) {
          reject(e)
        }
      })
      readable.pipe(ws)
    })
  }

  async getSignedUrl(path: string, expiresInSeconds: number = 3600): Promise<string> {
    const file = this.bucket.file(path)
    const options = { action: "read", expires: Date.now() + expiresInSeconds * 1000 } as any
    const [url] = await file.getSignedUrl(options)
    return url
  }

  getPublicUrl(path: string): string {
    return `https://storage.googleapis.com/${this.bucket.name}/${path}`
  }

  async delete(path: string): Promise<void> {
    const file = this.bucket.file(path)
    await file.delete({ ignoreNotFound: true })
  }

  async exists(path: string): Promise<boolean> {
    const file = this.bucket.file(path)
    const [ok] = await file.exists()
    return ok
  }

  async copy(srcPath: string, destPath: string): Promise<void> {
    const src = this.bucket.file(srcPath)
    const dest = this.bucket.file(destPath)
    await src.copy(dest)
  }

  async move(srcPath: string, destPath: string): Promise<void> {
    await this.copy(srcPath, destPath)
    await this.delete(srcPath)
  }

  async getMetadata(path: string): Promise<Record<string, unknown>> {
    const file = this.bucket.file(path)
    const [meta] = await file.getMetadata()
    return meta
  }
}

export function createFirebaseStorageFromEnv(): FirebaseStorage {
  const projectId = process.env.FIREBASE_PROJECT_ID || ""
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || ""
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\r?\n/g, "\n")
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || ""
  if (!projectId || !clientEmail || !privateKey || !bucket) throw new Error("Missing Firebase credentials")
  return new FirebaseStorage({ projectId, clientEmail, privateKey, bucket })
}

export { FirebaseStorage }
