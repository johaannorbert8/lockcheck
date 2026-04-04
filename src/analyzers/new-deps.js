/**
 * Analyzer: Detect NEW dependencies that weren't in the previous snapshot.
 * This is the most important check — new deps are the primary attack vector.
 */

/**
 * @param {Map<string, object>} current - Current lockfile packages
 * @param {Map<string, object> | null} previous - Previous snapshot packages
 * @returns {{ findings: Array<{ severity: string, name: string, version: string, message: string }> }}
 */
export function analyzeNewDeps(current, previous) {
  const findings = [];

  if (!previous) {
    return {
      findings: [{
        severity: 'info',
        name: 'lockcheck',
        version: '-',
        message: `First scan: ${current.size} packages recorded as baseline. Future scans will diff against this.`,
      }],
      isFirstRun: true,
    };
  }

  for (const [name, pkg] of current) {
    if (!previous.has(name)) {
      findings.push({
        severity: 'warning',
        name,
        version: pkg.version,
        message: `New dependency added: ${name}@${pkg.version}`,
        detail: pkg.dev ? '(dev dependency)' : '(production dependency)',
      });
    }
  }

  // Also check for REMOVED packages (could indicate hijacking by replacement)
  for (const [name] of previous) {
    if (!current.has(name)) {
      findings.push({
        severity: 'info',
        name,
        version: '-',
        message: `Dependency removed: ${name}`,
      });
    }
  }

  return { findings, isFirstRun: false };
}
