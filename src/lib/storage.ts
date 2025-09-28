const STORAGE_EMULATOR_HOSTS = new Set(['127.0.0.1', 'localhost'])

export function isEmulatorStorageUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return STORAGE_EMULATOR_HOSTS.has(parsed.hostname)
  } catch (err) {
    return false
  }
}

export function normalizeStorageUrl(url?: string | null): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    if (!STORAGE_EMULATOR_HOSTS.has(parsed.hostname)) {
      return url
    }
    parsed.protocol = 'https:'
    parsed.hostname = 'firebasestorage.googleapis.com'
    parsed.port = ''
    return parsed.toString()
  } catch (err) {
    return url
  }
}

export function extractStoragePath(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    const pathMatch = parsed.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)$/)
    if (!pathMatch) {
      return undefined
    }
    return decodeURIComponent(pathMatch[1])
  } catch (err) {
    return undefined
  }
}
