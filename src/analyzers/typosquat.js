/**
 * Analyzer: Detect typosquatted package names.
 * Uses Levenshtein distance + pattern matching against popular npm packages.
 */

import { levenshtein, checkTyposquatPatterns } from '../utils/levenshtein.js';

// Top 200 most popular npm packages (curated list)
const POPULAR_PACKAGES = [
  // Frameworks & runtimes
  'react', 'react-dom', 'next', 'vue', 'angular', 'svelte', 'express', 'fastify', 'koa', 'hapi',
  'nuxt', 'gatsby', 'remix', 'astro', 'solid-js', 'preact', 'lit', 'ember-source',

  // Build tools
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel', 'turbo', 'tsup', 'swc',
  'babel-core', '@babel/core', '@babel/preset-env', '@babel/preset-react',

  // Utilities
  'lodash', 'underscore', 'ramda', 'rxjs', 'date-fns', 'moment', 'dayjs', 'luxon',
  'uuid', 'nanoid', 'crypto-js', 'bcrypt', 'bcryptjs', 'jsonwebtoken', 'jose',
  'dotenv', 'cross-env', 'zod', 'yup', 'joi', 'ajv',

  // HTTP & networking
  'axios', 'node-fetch', 'got', 'undici', 'superagent', 'ky', 'ofetch',
  'cors', 'helmet', 'cookie-parser', 'body-parser', 'compression', 'morgan',

  // Database
  'mongoose', 'sequelize', 'knex', 'prisma', '@prisma/client', 'drizzle-orm',
  'pg', 'mysql2', 'sqlite3', 'better-sqlite3', 'redis', 'ioredis', 'mongodb',
  'typeorm', 'mikro-orm',

  // Testing
  'jest', 'mocha', 'chai', 'vitest', 'cypress', 'playwright', 'puppeteer',
  '@testing-library/react', '@testing-library/jest-dom', 'sinon', 'supertest', 'nock',

  // CLI & output
  'chalk', 'ora', 'inquirer', 'commander', 'yargs', 'meow', 'minimist',
  'cli-table3', 'boxen', 'figures', 'listr2', 'progress',

  // TypeScript
  'typescript', 'ts-node', 'tsx', '@types/node', '@types/react', '@types/jest',

  // Code quality
  'eslint', 'prettier', 'biome', 'stylelint', 'husky', 'lint-staged',
  'commitlint', '@commitlint/cli',

  // CSS
  'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'less', 'styled-components',
  '@emotion/react', '@emotion/styled', 'css-loader', 'style-loader',

  // File system & process
  'fs-extra', 'glob', 'globby', 'chokidar', 'rimraf', 'del', 'mkdirp',
  'execa', 'shelljs', 'cross-spawn', 'concurrently', 'nodemon', 'pm2',

  // Logging
  'winston', 'pino', 'bunyan', 'debug', 'consola', 'loglevel',

  // Misc popular
  'socket.io', 'ws', 'graphql', 'apollo-server', '@apollo/client',
  'sharp', 'jimp', 'pdf-lib', 'handlebars', 'ejs', 'pug', 'nunjucks',
  'cheerio', 'jsdom', 'puppeteer-core', 'marked', 'markdown-it', 'highlight.js',
  'i18next', 'next-auth', 'passport', 'express-session', 'connect-redis',
  'multer', 'formidable', 'busboy', 'aws-sdk', '@aws-sdk/client-s3',
  'firebase', 'firebase-admin', 'stripe', 'nodemailer', 'bull', 'bullmq',
  'amqplib', 'kafkajs', 'cron', 'node-cron',

  // Security
  'helmet', 'rate-limiter-flexible', 'express-rate-limit', 'csurf', 'hpp',
  'xss', 'sanitize-html', 'dompurify',
];

/**
 * Check if a package name looks like a typosquat of a popular package.
 * @param {string} name - Package name to check
 * @returns {{ isTyposquat: boolean, similarTo: string | null, distance: number | null, pattern: string | null }}
 */
export function detectTyposquat(name) {
  // Skip if it IS a popular package
  if (POPULAR_PACKAGES.includes(name)) {
    return { isTyposquat: false, similarTo: null, distance: null, pattern: null };
  }

  // Check pattern-based matches first (more specific)
  for (const popular of POPULAR_PACKAGES) {
    const patternResult = checkTyposquatPatterns(name, popular);
    if (patternResult.match) {
      return {
        isTyposquat: true,
        similarTo: popular,
        distance: null,
        pattern: patternResult.pattern,
      };
    }
  }

  // Check Levenshtein distance
  for (const popular of POPULAR_PACKAGES) {
    // Only compare packages of similar length to reduce false positives
    if (Math.abs(name.length - popular.length) > 2) continue;

    const distance = levenshtein(name, popular);

    // Strict threshold: distance of 1 for short names, 2 for longer ones
    const threshold = popular.length <= 5 ? 1 : 2;

    if (distance > 0 && distance <= threshold) {
      return {
        isTyposquat: true,
        similarTo: popular,
        distance,
        pattern: `edit distance ${distance}`,
      };
    }
  }

  return { isTyposquat: false, similarTo: null, distance: null, pattern: null };
}

/**
 * Analyze all packages for typosquatting.
 * @param {Map<string, object>} packages
 * @returns {{ findings: Array }}
 */
export function analyzeTyposquats(packages) {
  const findings = [];

  for (const [name, pkg] of packages) {
    const result = detectTyposquat(name);

    if (result.isTyposquat) {
      findings.push({
        severity: 'critical',
        name,
        version: pkg.version,
        message: `Possible typosquat of "${result.similarTo}" (${result.pattern})`,
        detail: result.distance !== null
          ? `Levenshtein distance: ${result.distance}`
          : `Pattern: ${result.pattern}`,
      });
    }
  }

  return { findings };
}
