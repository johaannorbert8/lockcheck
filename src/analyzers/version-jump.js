/**
 * Analyzer: Detect suspicious version jumps.
 * Catches version manipulation attacks where a package is hijacked
 * and published with an abnormal version number.
 */

import { analyzeVersionChange } from '../utils/semver.js';

/**
 * @param {Map<string, object>} current
 * @param {Map<string, object> | null} previous
 * @returns {{ findings: Array }}
 */
export function analyzeVersionJumps(current, previous) {
  const findings = [];

  if (!previous) return { findings };

  for (const [name, pkg] of current) {
    const prev = previous.get(name);
    if (!prev) continue; // New dep — handled by new-deps analyzer

    if (prev.version === pkg.version) continue;

    const analysis = analyzeVersionChange(prev.version, pkg.version);

    if (analysis.suspicious) {
      findings.push({
        severity: analysis.magnitude === 'extreme' ? 'critical' : 'warning',
        name,
        version: `${prev.version} → ${pkg.version}`,
        message: analysis.reason,
        detail: `Change type: ${analysis.type}`,
      });
    }
  }

  return { findings };
}
