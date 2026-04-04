/**
 * Analyzer: Detect registry anomalies.
 * Catches dependency confusion attacks and registry hijacking.
 */

const OFFICIAL_REGISTRIES = [
  'https://registry.npmjs.org/',
  'https://registry.yarnpkg.com/',
];

/**
 * Analyze package registries for suspicious changes.
 * @param {Map<string, object>} current
 * @param {Map<string, object> | null} previous
 * @returns {{ findings: Array }}
 */
export function analyzeRegistries(current, previous) {
  const findings = [];

  for (const [name, pkg] of current) {
    if (!pkg.resolved) continue;

    // Check for non-standard registries
    const isOfficialRegistry = OFFICIAL_REGISTRIES.some(r => pkg.resolved.startsWith(r));

    if (!isOfficialRegistry) {
      // Check if it's a tarball URL (GitHub, etc.)
      const isTarball = pkg.resolved.includes('.tgz') || pkg.resolved.includes('.tar.gz');
      const isGitHub = pkg.resolved.includes('github.com');

      if (isTarball && !isGitHub) {
        findings.push({
          severity: 'critical',
          name,
          version: pkg.version,
          message: `Resolves from non-standard tarball URL`,
          detail: `URL: ${pkg.resolved}`,
        });
      } else if (!isGitHub) {
        findings.push({
          severity: 'warning',
          name,
          version: pkg.version,
          message: `Resolves from non-standard registry`,
          detail: `URL: ${pkg.resolved}`,
        });
      }
    }

    // Check for registry CHANGES (previous vs current)
    if (previous) {
      const prev = previous.get(name);
      if (prev && prev.resolved && pkg.resolved) {
        const prevDomain = extractDomain(prev.resolved);
        const currDomain = extractDomain(pkg.resolved);

        if (prevDomain && currDomain && prevDomain !== currDomain) {
          findings.push({
            severity: 'critical',
            name,
            version: pkg.version,
            message: `Registry changed from ${prevDomain} to ${currDomain}`,
            detail: `Previous: ${prev.resolved}\nCurrent: ${pkg.resolved}`,
          });
        }
      }
    }

    // Check for integrity hash changes without version changes
    if (previous) {
      const prev = previous.get(name);
      if (prev && prev.version === pkg.version && prev.integrity && pkg.integrity) {
        if (prev.integrity !== pkg.integrity) {
          findings.push({
            severity: 'critical',
            name,
            version: pkg.version,
            message: `Integrity hash changed without version change!`,
            detail: `This could indicate the package was republished with different content.\nPrevious: ${prev.integrity.substring(0, 30)}...\nCurrent: ${pkg.integrity.substring(0, 30)}...`,
          });
        }
      }
    }
  }

  return { findings };
}

/**
 * Extract domain from a URL.
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
