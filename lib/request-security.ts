const requestWindowMs = 10 * 60 * 1000
const requestBuckets = new Map<string, { count: number; expiresAt: number }>()
const claimedKeys = new Map<string, number>()

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isRateLimited(request: Request, key: string, limit: number) {
  const now = Date.now()
  for (const [bucketKey, bucket] of requestBuckets) {
    if (bucket.expiresAt <= now) requestBuckets.delete(bucketKey)
  }

  const address = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const bucketKey = `${key}:${address}`
  const bucket = requestBuckets.get(bucketKey)

  if (!bucket || bucket.expiresAt <= now) {
    requestBuckets.set(bucketKey, { count: 1, expiresAt: now + requestWindowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > limit
}

export function claimOnce(key: string, ttlMs = requestWindowMs) {
  const now = Date.now()
  for (const [claimedKey, expiresAt] of claimedKeys) {
    if (expiresAt <= now) claimedKeys.delete(claimedKey)
  }
  if (claimedKeys.has(key)) return false
  claimedKeys.set(key, now + ttlMs)
  return true
}

export function releaseClaim(key: string) {
  claimedKeys.delete(key)
}
