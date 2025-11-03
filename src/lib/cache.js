/**
 * Cache utilities for Next.js 16+
 * Uses HTTP Cache-Control headers and Next.js caching strategies
 */

// Simple in-memory cache with TTL (Time To Live) for client-side use
const cache = new Map();

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any} Cached value or null
 */
export function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;

  // Check if expired
  if (item.expiresAt && Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

/**
 * Set cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 3600)
 */
export function setCached(key, value, ttlSeconds = 3600) {
  cache.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

/**
 * Clear cache by pattern
 * @param {string} pattern - Regex pattern to match keys
 */
export function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }

  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Cache control header presets for Next.js 16+
 */
export const CACHE_PRESETS = {
  // Static content - cache for 24 hours
  STATIC: 'public, s-maxage=86400, stale-while-revalidate=604800',
  
  // Dynamic content - cache for 1 hour
  DYNAMIC: 'public, s-maxage=3600, stale-while-revalidate=86400',
  
  // Short-lived - cache for 10 minutes
  SHORT: 'public, s-maxage=600, stale-while-revalidate=3600',
  
  // No cache - always fresh
  NO_CACHE: 'public, max-age=0, must-revalidate',
  
  // Private cache - for authenticated users
  PRIVATE: 'private, max-age=3600, stale-while-revalidate=86400',
};

/**
 * Create cache headers for API responses
 * @param {string} preset - Cache preset name
 * @returns {Headers} Headers object with cache control
 */
export function createCacheHeaders(preset = 'DYNAMIC') {
  const headers = new Headers();
  headers.set('Cache-Control', CACHE_PRESETS[preset] || CACHE_PRESETS.DYNAMIC);
  return headers;
}
