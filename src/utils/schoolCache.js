/**
 * Client-side cache for school reference data (programs, modules, subjects, etc.).
 * Uses localStorage with TTL. Refetch and overwrite when expired or invalidated.
 */

const CACHE_PREFIX = "school:";
const TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get cached data or fetch from API. Overwrites cache if expired.
 * @param {string} key - Cache key: "programs" | "modules" | "subjects" | "yearGroups" | "classLevels"
 * @param {string} apiPath - API path to fetch (e.g. "/programs")
 * @param {function} fetcher - Async function: (path) => Promise<data>
 * @returns {Promise<any>} - The data (from cache or fresh)
 */
export async function getCachedOrFetch(key, apiPath, fetcher) {
  const storageKey = CACHE_PREFIX + key;
  const raw = localStorage.getItem(storageKey);

  if (raw) {
    try {
      const { data, savedAt } = JSON.parse(raw);
      if (Date.now() - savedAt < TTL_MS) {
        return data;
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Expired or missing: refetch and overwrite
  const data = await fetcher(apiPath);
  const toStore = { data, savedAt: Date.now() };
  localStorage.setItem(storageKey, JSON.stringify(toStore));
  return data;
}

/**
 * Invalidate cache for a key. Next getCachedOrFetch will refetch.
 * Call after: create/update/delete program, module, subject, etc.
 * @param {string} [key] - Key to invalidate. If omitted, clears all school cache.
 */
export function invalidateCache(key) {
  if (key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  } else {
    const keys = ["programs", "modules", "subjects", "yearGroups", "classLevels"];
    keys.forEach((k) => localStorage.removeItem(CACHE_PREFIX + k));
  }
}

/**
 * Clear all school cache. Call on logout.
 */
export function clearAllCache() {
  invalidateCache();
}
