/**
 * Analyzer: Detect packages with install scripts.
 * Install scripts (preinstall, install, postinstall) are the primary
 * execution vector for supply chain attacks.
 */

// Packages that legitimately use install scripts
const KNOWN_SAFE_INSTALL_SCRIPTS = new Set([
  // Native addons that need compilation
  'esbuild', '@esbuild/linux-x64', '@esbuild/darwin-arm64', '@esbuild/darwin-x64',
  '@esbuild/win32-x64', '@esbuild/linux-arm64',
  'sharp', 'canvas', 'node-gyp',
  'bcrypt', 'argon2', 'sodium-native',
  'better-sqlite3', 'sqlite3',
  'fsevents',
  'electron',
  'node-sass',
  'cpu-features',
  '@swc/core',
  'protobufjs',
  'grpc', '@grpc/grpc-js',
  'puppeteer', 'puppeteer-core',
  'playwright', 'playwright-core',
  '@playwright/test',
  'cypress',

  // Tools that download binaries
  'turbo',
  '@biomejs/biome',
  'prisma', '@prisma/client', '@prisma/engines',
  'flow-bin',
  'gifsicle', 'optipng-bin', 'pngquant-bin', 'jpegtran-bin',

  // Well-known packages with legitimate postinstall
  'husky',
  'core-js', 'core-js-pure',
  'lmdb',
  'msgpackr-extract',
  '@parcel/watcher',
  'dtrace-provider',
]);

/**
 * Analyze packages for install scripts.
 * @param {Map<string, object>} packages
 * @returns {{ findings: Array }}
 */
export function analyzeInstallScripts(packages) {
  const findings = [];

  for (const [name, pkg] of packages) {
    if (!pkg.hasInstallScripts) continue;

    // Check if it matches a known-safe package (also match scoped variants)
    const baseName = name.replace(/^@[^/]+\//, '');
    const isKnownSafe = KNOWN_SAFE_INSTALL_SCRIPTS.has(name) ||
                        KNOWN_SAFE_INSTALL_SCRIPTS.has(baseName);

    if (isKnownSafe) {
      continue; // Skip known-safe packages
    }

    findings.push({
      severity: 'warning',
      name,
      version: pkg.version,
      message: `Has install scripts (preinstall/install/postinstall)`,
      detail: `Install scripts can execute arbitrary code during \`npm install\`. Verify this package is trusted.`,
    });
  }

  return { findings };
}
