/**
 * npm Registry API client.
 * Uses native fetch() — requires Node 18+.
 * Handles rate limiting, timeouts, and failures gracefully.
 */

const NPM_REGISTRY = 'https://registry.npmjs.org';
const TIMEOUT_MS = 5000;
const MAX_CONCURRENT = 5;

/**
 * Fetch package metadata from the npm registry.
 * @param {string} packageName
 * @returns {Promise<{
 *   name: string,
 *   publishedAt: string | null,
 *   weeklyDownloads: number | null,
 *   maintainerCount: number,
 *   hasPostinstall: boolean,
 *   latestVersion: string | null,
 *   deprecated: boolean,
 * } | null>}
 */
export async function fetchPackageMeta(packageName) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const encodedName = encodeURIComponent(packageName).replace('%40', '@');
    const res = await fetch(`${NPM_REGISTRY}/${encodedName}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const latestVersion = data['dist-tags']?.latest;
    const latestMeta = latestVersion ? data.versions?.[latestVersion] : null;
    const timeEntry = data.time?.[latestVersion];

    return {
      name: data.name,
      publishedAt: timeEntry || null,
      maintainerCount: data.maintainers?.length || 0,
      hasPostinstall: !!(latestMeta?.scripts?.postinstall || latestMeta?.scripts?.preinstall || latestMeta?.scripts?.install),
      latestVersion,
      deprecated: !!latestMeta?.deprecated,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch weekly download count for a package.
 * @param {string} packageName
 * @returns {Promise<number | null>}
 */
export async function fetchDownloads(packageName) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const encodedName = encodeURIComponent(packageName).replace('%40', '@');
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    return data.downloads ?? null;
  } catch {
    return null;
  }
}

/**
 * Batch fetch metadata for multiple packages with concurrency control.
 * @param {string[]} packageNames
 * @param {(name: string, result: any) => void} onResult
 * @returns {Promise<Map<string, any>>}
 */
export async function batchFetchMeta(packageNames, onResult) {
  const results = new Map();
  const queue = [...packageNames];

  async function worker() {
    while (queue.length > 0) {
      const name = queue.shift();
      if (!name) break;

      const [meta, downloads] = await Promise.all([
        fetchPackageMeta(name),
        fetchDownloads(name),
      ]);

      const result = meta
        ? { ...meta, weeklyDownloads: downloads }
        : { name, weeklyDownloads: downloads, error: true };

      results.set(name, result);
      if (onResult) onResult(name, result);
    }
  }

  // Run workers with concurrency limit
  const workers = Array.from({ length: Math.min(MAX_CONCURRENT, packageNames.length) }, () => worker());
  await Promise.all(workers);

  return results;
}
