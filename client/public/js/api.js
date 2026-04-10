const defaultHeaders = {
  'Content-Type': 'application/json'
};

const API_CACHE_PREFIX = 'physion:api:';
const API_CACHE_TTL_MS = 60 * 1000;

function cacheKey(path) {
  return `${API_CACHE_PREFIX}${path}`;
}

function getCached(path) {
  try {
    const raw = localStorage.getItem(cacheKey(path));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.expiresAt || Date.now() > entry.expiresAt) {
      localStorage.removeItem(cacheKey(path));
      return null;
    }
    return entry.payload;
  } catch {
    return null;
  }
}

function setCached(path, payload) {
  try {
    localStorage.setItem(
      cacheKey(path),
      JSON.stringify({
        expiresAt: Date.now() + API_CACHE_TTL_MS,
        payload
      })
    );
  } catch {
    // ignore storage quota errors
  }
}

function clearApiCache() {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(API_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

export async function api(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const useCache = method === 'GET' && options.cache !== false;

  if (useCache) {
    const cached = getCached(path);
    if (cached !== null) {
      return cached;
    }
  }

  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson) {
      throw new Error(payload?.message || 'Request failed');
    }
    throw new Error(`Request failed (${response.status})`);
  }

  if (useCache) {
    setCached(path, payload);
  } else if (method !== 'GET') {
    clearApiCache();
  }

  return payload;
}
