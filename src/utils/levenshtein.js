/**
 * Levenshtein distance — measures string similarity for typosquat detection.
 * Pure JS, no dependencies. ~20 lines of actual logic.
 */

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check common typosquat patterns beyond simple edit distance.
 */
export function checkTyposquatPatterns(name, target) {
  // Hyphen/underscore swaps: "lodash" vs "lo-dash"
  const normalizedName = name.replace(/[-_]/g, '');
  const normalizedTarget = target.replace(/[-_]/g, '');
  if (normalizedName === normalizedTarget && name !== target) {
    return { match: true, pattern: 'hyphen/underscore swap' };
  }

  // Scope confusion: "@babel/core" vs "babel-core"
  const unscopedName = name.replace(/^@[^/]+\//, '');
  const unscopedTarget = target.replace(/^@[^/]+\//, '');
  if (unscopedName === unscopedTarget && name !== target) {
    return { match: true, pattern: 'scope confusion' };
  }

  // Character substitution: "1" for "l", "0" for "o", "rn" for "m"
  const substitutions = [
    [/l/g, '1'], [/1/g, 'l'],
    [/o/g, '0'], [/0/g, 'o'],
    [/rn/g, 'm'], [/m/g, 'rn'],
  ];

  for (const [pattern, replacement] of substitutions) {
    if (name.replace(pattern, replacement) === target) {
      return { match: true, pattern: 'character substitution' };
    }
  }

  return { match: false, pattern: null };
}
