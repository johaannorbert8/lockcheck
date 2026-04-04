/**
 * Analyzer: Check package freshness via npm registry API.
 * Flags packages that are suspiciously new or have very low downloads.
 * Requires network access — skipped with --no-network flag.
 */

import { batchFetchMeta } from '../utils/registry.js';

const FRESH_THRESHOLD_DAYS = 7;
const LOW_DOWNLOADS_THRESHOLD = 100;

/**
 * Analyze package freshness for new or changed packages.
 * @param {Map<string, object>} current
 * @param {Map<string, object> | null} previous
 * @param {{ onProgress?: (name: string) => void }} options
 * @returns {Promise<{ findings: Array }>}
 */
export async function analyzeFreshness(current, previous, options = {}) {
  const findings = [];

  // Only check NEW packages or packages with version changes
  const packagesToCheck = [];

  for (const [name, pkg] of current) {
    const prev = previous?.get(name);
    if (!prev || prev.version !== pkg.version) {
      packagesToCheck.push(name);
    }
  }

  if (packagesToCheck.length === 0) {
    return { findings };
  }

  // Batch fetch from registry
  const metaMap = await batchFetchMeta(packagesToCheck, (name) => {
    if (options.onProgress) options.onProgress(name);
  });

  for (const [name, meta] of metaMap) {
    if (meta.error) continue;

    const pkg = current.get(name);

    // Check publish date
    if (meta.publishedAt) {
      const publishDate = new Date(meta.publishedAt);
      const daysAgo = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysAgo < FRESH_THRESHOLD_DAYS) {
        findings.push({
          severity: 'warning',
          name,
          version: pkg?.version || 'unknown',
          message: `Published ${Math.round(daysAgo)} day(s) ago`,
          detail: `New packages should be reviewed carefully. Published: ${publishDate.toISOString().split('T')[0]}`,
        });
      }
    }

    // Check download count
    if (meta.weeklyDownloads !== null && meta.weeklyDownloads < LOW_DOWNLOADS_THRESHOLD) {
      findings.push({
        severity: meta.weeklyDownloads < 10 ? 'critical' : 'warning',
        name,
        version: pkg?.version || 'unknown',
        message: `Very low download count: ${meta.weeklyDownloads.toLocaleString()} weekly downloads`,
        detail: `Low-download packages are higher risk for supply chain attacks.`,
      });
    }

    // Check maintainer count
    if (meta.maintainerCount <= 1 && meta.weeklyDownloads !== null && meta.weeklyDownloads < 1000) {
      findings.push({
        severity: 'info',
        name,
        version: pkg?.version || 'unknown',
        message: `Single maintainer with low downloads`,
        detail: `Packages with a single maintainer are more susceptible to account takeover.`,
      });
    }

    // Check if deprecated
    if (meta.deprecated) {
      const deprecationMsg = typeof meta.deprecated === 'string' && meta.deprecated.trim()
        ? meta.deprecated.trim()
        : 'No deprecation message provided.';
      findings.push({
        severity: 'warning',
        name,
        version: pkg?.version || 'unknown',
        message: `Package is deprecated: ${deprecationMsg}`,
        detail: `Deprecated packages may have known vulnerabilities and should be replaced. Consider migrating to an actively maintained alternative.`,
      });
    }
  }

  return { findings };
}
