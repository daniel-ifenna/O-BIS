type CacheItem<T> = {
  value: T
  expiresAt: number
}

// Global cache map
// Note: In serverless (Vercel), this cache is per-lambda instance and might be cleared often.
// For persistent caching, Redis is recommended. But this meets the "in-memory" requirement for this task.
const cache = new Map<string, CacheItem<any>>()

export function getCache<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    return null
  }
  return item.value
}

export function setCache<T>(key: string, value: T, ttlSeconds: number = 60) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

export function clearCache(keyPrefix?: string) {
  if (keyPrefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) cache.delete(key)
    }
  } else {
    cache.clear()
  }
}
