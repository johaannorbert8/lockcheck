/**
 * Lightweight semver utilities.
 * No need for the full `semver` package — we only need parsing and comparison.
 */

/**
 * Parse a semver string into parts.
 * @param {string} version - e.g. "4.17.21", "^4.17.21", "~1.2.3"
 * @returns {{ major: number, minor: number, patch: number, raw: string } | null}
 */
export function parseSemver(version) {
  if (!version) return null;

  // Strip any leading range characters
  const cleaned = version.replace(/^[~^>=<\s]+/, '');
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: cleaned,
  };
}

/**
 * Describe the type and magnitude of a version change.
 * @param {string} from - Previous version
 * @param {string} to - New version
 * @returns {{ type: string, magnitude: string, suspicious: boolean, reason: string }}
 */
export function analyzeVersionChange(from, to) {
  const prev = parseSemver(from);
  const next = parseSemver(to);

  if (!prev || !next) {
    return { type: 'unknown', magnitude: 'unknown', suspicious: true, reason: 'Unparseable version' };
  }

  // Same version
  if (prev.major === next.major && prev.minor === next.minor && prev.patch === next.patch) {
    return { type: 'none', magnitude: 'none', suspicious: false, reason: 'No change' };
  }

  // Downgrade
  if (
    next.major < prev.major ||
    (next.major === prev.major && next.minor < prev.minor) ||
    (next.major === prev.major && next.minor === prev.minor && next.patch < prev.patch)
  ) {
    return { type: 'downgrade', magnitude: 'suspicious', suspicious: true, reason: `Downgraded from ${from} to ${to}` };
  }

  // Major version jump
  if (next.major > prev.major) {
    const majorDiff = next.major - prev.major;
    if (majorDiff > 2) {
      return { type: 'major', magnitude: 'extreme', suspicious: true, reason: `Major version jumped by ${majorDiff} (${from} → ${to})` };
    }
    return { type: 'major', magnitude: 'large', suspicious: false, reason: `Major upgrade (${from} → ${to})` };
  }

  // Minor version jump
  if (next.minor > prev.minor) {
    const minorDiff = next.minor - prev.minor;
    if (minorDiff > 20) {
      return { type: 'minor', magnitude: 'extreme', suspicious: true, reason: `Minor version jumped by ${minorDiff} (${from} → ${to})` };
    }
    return { type: 'minor', magnitude: 'normal', suspicious: false, reason: `Minor upgrade (${from} → ${to})` };
  }

  // Patch version jump
  const patchDiff = next.patch - prev.patch;
  if (patchDiff > 50) {
    return { type: 'patch', magnitude: 'extreme', suspicious: true, reason: `Patch version jumped by ${patchDiff} (${from} → ${to})` };
  }

  return { type: 'patch', magnitude: 'normal', suspicious: false, reason: `Patch upgrade (${from} → ${to})` };
}
