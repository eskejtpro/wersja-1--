import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import https from 'node:https';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

export const APP_VERSION = '2.24.0';
export const API_VERSION = '1';
export const SCHEMA_VERSION = 1;

type JsonObject = Record<string, unknown>;
type GymData = JsonObject;

interface ServerConfig {
  username: string;
  passwordHash: string;
  sessionTtlMs: number;
  loginWindowMs: number;
  maxLoginAttempts: number;
  maxBodyBytes: string;
  bindHost: string;
  port: number;
  deviceId: string;
  dataFile: string;
  updateManifestPath?: string;
  httpsEnabled: boolean;
  tlsCertFile?: string;
  tlsKeyFile?: string;
  allowInsecureLocalhost: boolean;
}

interface AppOptions {
  config?: Partial<ServerConfig>;
  now?: () => number;
}

interface Session {
  tokenHash: string;
  expiresAt: number;
  createdAt: number;
}

interface LoginAttempt {
  count: number;
  windowStartedAt: number;
  blockedUntil: number;
}

const capabilities = [
  'auth_session',
  'gymdata_validation',
  'sync_status',
  'heuristic_local_agent',
  'update_metadata_only',
];

const defaultConfig = (env: NodeJS.ProcessEnv): ServerConfig => ({
  username: env.GYMTRACKER_USERNAME || 'local',
  passwordHash: env.GYMTRACKER_PASSWORD_HASH || '',
  sessionTtlMs: boundedInt(env.GYMTRACKER_SESSION_TTL_MS, 8 * 60 * 60 * 1000, 60_000, 7 * 24 * 60 * 60 * 1000),
  loginWindowMs: boundedInt(env.GYMTRACKER_LOGIN_WINDOW_MS, 15 * 60 * 1000, 10_000, 24 * 60 * 60 * 1000),
  maxLoginAttempts: boundedInt(env.GYMTRACKER_MAX_LOGIN_ATTEMPTS, 5, 1, 100),
  maxBodyBytes: env.GYMTRACKER_MAX_BODY || '256kb',
  bindHost: '0.0.0.0',
  port: 3000,
  deviceId: env.GYMTRACKER_DEVICE_ID || 'local-server',
  dataFile: env.GYMTRACKER_DATA_FILE || defaultDataFile(),
  updateManifestPath: env.GYMTRACKER_UPDATE_MANIFEST || undefined,
  httpsEnabled: env.GYMTRACKER_HTTPS === '1',
  tlsCertFile: env.GYMTRACKER_TLS_CERT_FILE || undefined,
  tlsKeyFile: env.GYMTRACKER_TLS_KEY_FILE || undefined,
  allowInsecureLocalhost: true,
});

function defaultDataFile(): string {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return path.join(localAppData, 'GymTracker', 'server_data.json');
}

function boundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function readCredentials(config: ServerConfig): { username: string; passwordHash: string } {
  if (config.passwordHash) return { username: config.username, passwordHash: config.passwordHash };
  const filePath = process.env.GYMTRACKER_AUTH_FILE;
  if (!filePath) return { username: config.username, passwordHash: '' };
  try {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')) as JsonObject;
    return {
      username: typeof parsed.username === 'string' ? parsed.username : config.username,
      passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : '',
    };
  } catch {
    return { username: config.username, passwordHash: '' };
  }
}

function verifyPassword(password: string, encoded: string): boolean {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, nText, rText, pText, salt, expected] = parts;
  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || !salt || !expected) return false;
  try {
    const actual = crypto.scryptSync(password, salt, Buffer.from(expected, 'hex').length, { N: n, r, p }).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function createPasswordHash(password: string): string {
  const n = 16_384;
  const r = 8;
  const p = 1;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32, { N: n, r, p }).toString('hex');
  return `scrypt$${n}$${r}$${p}$${salt}$${hash}`;
}

function tokenDigest(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 10_000;
}

function validateGymData(value: unknown): string[] {
  if (!isObject(value)) return ['data must be an object'];
  const errors: string[] = [];
  if (!isObject(value.settings)) errors.push('settings must be an object');
  if (!Array.isArray(value.weeks)) errors.push('weeks must be an array');
  if (!Array.isArray(value.bodyWeights)) errors.push('bodyWeights must be an array');
  if (Array.isArray(value.weeks)) {
    value.weeks.forEach((week, wi) => {
      if (!isObject(week)) return errors.push(`weeks[${wi}] must be an object`);
      if (!isString(week.id) || !isString(week.name) || !isFiniteNumber(week.number) || !Array.isArray(week.days)) {
        errors.push(`weeks[${wi}] has invalid id, name, number or days`);
      }
      if (Array.isArray(week.days)) week.days.forEach((day, di) => {
        if (!isObject(day) || !isString(day.id) || !isString(day.name) || !Array.isArray(day.exercises)) {
          errors.push(`weeks[${wi}].days[${di}] is invalid`);
        }
      });
    });
  }
  if (Array.isArray(value.bodyWeights)) value.bodyWeights.forEach((entry, index) => {
    if (!isObject(entry) || !isString(entry.id) || !isString(entry.date) || !isFiniteNumber(entry.weight) || !isString(entry.notes)) {
      errors.push(`bodyWeights[${index}] is invalid`);
    }
  });
  if (errors.length > 20) return [...errors.slice(0, 20), 'too many validation errors'];
  return errors;
}

function contentHash(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

interface StoredState {
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  contentHash: string;
  data: GymData;
}

function writeAtomically(filePath: string, value: StoredState): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(value), { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

function readStoredState(filePath: string): StoredState | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as JsonObject;
    if (
      parsed.schemaVersion !== SCHEMA_VERSION ||
      typeof parsed.revision !== 'number' ||
      !Number.isInteger(parsed.revision) ||
      parsed.revision < 1 ||
      typeof parsed.updatedAt !== 'string' ||
      typeof parsed.contentHash !== 'string' ||
      !('data' in parsed)
    ) {
      throw new Error('invalid envelope');
    }
    const errors = validateGymData(parsed.data);
    if (errors.length || parsed.contentHash !== contentHash(parsed.data)) throw new Error('invalid data');
    return {
      schemaVersion: SCHEMA_VERSION,
      revision: parsed.revision as number,
      updatedAt: parsed.updatedAt,
      contentHash: parsed.contentHash,
      data: parsed.data as GymData,
    };
  } catch {
    throw httpError(503, 'data_store_unavailable');
  }
}

interface UpdateManifestEntry extends JsonObject {
  version: string;
  packageUrl: string;
  sha256: string;
  sizeBytes: number;
  minSupportedVersion: string;
}

function isValidSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

function isValidPackageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'file:';
  } catch {
    return false;
  }
}

function isValidManifestEntry(value: unknown): value is UpdateManifestEntry {
  return isObject(value)
    && typeof value.version === 'string'
    && isValidPackageUrl(value.packageUrl)
    && isValidSha256(value.sha256)
    && typeof value.sizeBytes === 'number'
    && Number.isSafeInteger(value.sizeBytes)
    && value.sizeBytes >= 0
    && typeof value.minSupportedVersion === 'string';
}

function readManifest(config: ServerConfig): UpdateManifestEntry[] {
  if (!config.updateManifestPath) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(config.updateManifestPath), 'utf8')) as unknown;
    const entries = Array.isArray(parsed) ? parsed : (isObject(parsed) && Array.isArray(parsed.releases) ? parsed.releases : []);
    return entries.filter(isValidManifestEntry);
  } catch {
    return [];
  }
}

function httpError(status: number, message: string, details?: unknown): Error & { status: number; details?: unknown } {
  const error = new Error(message) as Error & { status: number; details?: unknown };
  error.status = status;
  error.details = details;
  return error;
}

function limitedAgentAnalysis(input: unknown): JsonObject {
  if (!isObject(input)) throw httpError(400, 'agent payload must be an object');
  const weeks = Array.isArray(input.weeks) ? input.weeks.slice(0, 52) : [];
  const query = typeof input.query === 'string' ? input.query.slice(0, 500) : '';
  let sessions = 0;
  let tonnage = 0;
  let bestE1rm = 0;
  let lastWeekExercises = 0;
  weeks.forEach((week) => {
    if (!isObject(week) || !Array.isArray(week.days)) return;
    week.days.forEach((day) => {
      if (!isObject(day) || !Array.isArray(day.exercises)) return;
      const exercises = day.exercises.filter(isObject);
      if (exercises.length) sessions += 1;
      if (weeks.indexOf(week) === weeks.length - 1) lastWeekExercises += exercises.length;
      exercises.forEach((exercise) => {
        const sets = isFiniteNumber(exercise.sets) ? exercise.sets : 0;
        const reps = isFiniteNumber(exercise.reps) ? exercise.reps : 0;
        const weight = isFiniteNumber(exercise.weight) ? exercise.weight : 0;
        tonnage += sets * reps * weight;
        bestE1rm = Math.max(bestE1rm, weight * (1 + reps / 30));
      });
    });
  });
  const hasData = sessions > 0 || tonnage > 0;
  const summary = !hasData
    ? 'Brak wystarczających danych do analizy.'
    : `Przeanalizowano ${sessions} aktywnych sesji; szacowany tonaż wynosi ${Math.round(tonnage)} kg.`;
  const recommendations = !hasData
    ? ['Przekaż ograniczony wycinek tygodni i ćwiczeń, aby obliczyć trend.']
    : [
        bestE1rm > 0 ? `Najlepszy szacowany e1RM w przekazanym wycinku: ${Math.round(bestE1rm)} kg.` : 'Brak danych e1RM.',
        lastWeekExercises === 0 ? 'Ostatni przekazany tydzień nie zawiera ćwiczeń.' : 'Kontynuuj regularne rejestrowanie wykonanych serii.',
      ];
  return {
    mode: 'heuristic_local',
    status: hasData ? 'ok' : 'no_data',
    summary: query ? `${summary} Zapytanie: ${query}` : summary,
    recommendations,
    warnings: hasData ? [] : ['Analiza jest ograniczona przez brak danych.'],
    confidence: hasData ? 0.62 : 0.05,
    dataUsed: { weeks: weeks.length, sessions, tonnageKg: Math.round(tonnage), fields: ['weeks.days.exercises'] },
  };
}

export function createApp(options: AppOptions = {}) {
  const now = options.now || Date.now;
  const config = { ...defaultConfig(process.env), ...options.config };
  const app = express();
  const sessions = new Map<string, Session>();
  const attempts = new Map<string, LoginAttempt>();
  let storedState: StoredState | null = null;
  let dataStoreError: (Error & { status: number }) | null = null;
  try {
    storedState = readStoredState(config.dataFile);
  } catch (error) {
    dataStoreError = error as Error & { status: number };
  }

  if (config.bindHost !== '127.0.0.1' && config.bindHost !== 'localhost' && !config.httpsEnabled) {
    console.warn('[server] LAN bind selected without HTTPS; use only on a trusted network.');
  }

  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    hsts: config.httpsEnabled ? undefined : false,
  }));
  app.use(express.json({ limit: config.maxBodyBytes, strict: true }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const origin = req.headers.origin;
    const isAllowedOrigin = origin && (
      origin === 'http://localhost:3000' ||
      origin === 'https://localhost' ||
      origin === 'http://localhost' ||
      origin === 'capacitor://localhost' ||
      /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)
    );
    if (origin && isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  const requireSession = (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const session = token ? sessions.get(tokenDigest(token)) : undefined;
    if (!session || session.expiresAt <= now()) {
      if (session) sessions.delete(session.tokenHash);
      return res.status(401).json({ error: 'unauthorized' });
    }
    next();
  };

  app.get('/api/health', (_req, res) => res.json({
    status: dataStoreError ? 'degraded' : 'ok',
    app: 'GymTracker Pro',
    version: APP_VERSION,
    apiVersion: API_VERSION,
    capabilities,
    timestamp: new Date(now()).toISOString(),
  }));
  app.get('/api/version', (_req, res) => res.json({
    appVersion: APP_VERSION,
    apiVersion: API_VERSION,
    schemaVersion: SCHEMA_VERSION,
    status: 'ok',
    capabilities,
  }));

  app.post('/api/auth/login', (req, res) => {
    const ip = req.ip || 'unknown';
    const current = attempts.get(ip) || { count: 0, windowStartedAt: now(), blockedUntil: 0 };
    if (current.blockedUntil > now()) return res.status(429).json({ error: 'too_many_attempts' });
    if (now() - current.windowStartedAt > config.loginWindowMs) {
      current.count = 0;
      current.windowStartedAt = now();
    }
    const username = typeof req.body?.username === 'string' ? req.body.username : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const credentials = readCredentials(config);
    const valid = constantTimeEqual(username, credentials.username) && Boolean(credentials.passwordHash) && verifyPassword(password, credentials.passwordHash);
    if (!valid) {
      current.count += 1;
      if (current.count >= config.maxLoginAttempts) current.blockedUntil = now() + config.loginWindowMs;
      attempts.set(ip, current);
      return res.status(current.blockedUntil > now() ? 429 : 401).json({ error: current.blockedUntil > now() ? 'too_many_attempts' : 'invalid_credentials' });
    }
    attempts.delete(ip);
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = tokenDigest(token);
    sessions.set(tokenHash, { tokenHash, createdAt: now(), expiresAt: now() + config.sessionTtlMs });
    return res.json({ token, tokenType: 'Bearer', expiresIn: config.sessionTtlMs });
  });
  app.post('/api/auth/logout', requireSession, (req, res) => {
    const token = (req.header('authorization') || '').slice(7);
    sessions.delete(tokenDigest(token));
    res.status(204).send();
  });

  app.get('/api/data', requireSession, (_req, res) => {
    if (dataStoreError) return res.status(503).json({ error: 'data_store_unavailable' });
    if (!storedState) return res.status(404).json({ error: 'data_unavailable' });
    res.json(storedState);
  });
  app.post('/api/data', requireSession, (req, res) => {
    const body = req.body as JsonObject;
    if (body.schemaVersion !== SCHEMA_VERSION || !('data' in body)) {
      return res.status(400).json({ error: 'unsupported_schema_version', expected: SCHEMA_VERSION });
    }
    const errors = validateGymData(body.data);
    if (errors.length) return res.status(422).json({ error: 'invalid_gym_data', details: errors });
    if (dataStoreError) return res.status(503).json({ error: 'data_store_unavailable' });
    const expectedRevision = body.revision;
    const expectedHash = body.contentHash;
    if (storedState && (!Number.isInteger(expectedRevision) || typeof expectedHash !== 'string')) {
      return res.status(409).json({
        error: 'conflict',
        reason: 'revision_required',
        revision: storedState.revision,
        contentHash: storedState.contentHash,
      });
    }
    if (storedState && (expectedRevision !== storedState.revision || expectedHash !== storedState.contentHash)) {
      return res.status(409).json({
        error: 'conflict',
        reason: 'stale_revision',
        revision: storedState.revision,
        contentHash: storedState.contentHash,
      });
    }
    const nextState: StoredState = {
      schemaVersion: SCHEMA_VERSION,
      revision: (storedState?.revision || 0) + 1,
      updatedAt: new Date(now()).toISOString(),
      contentHash: contentHash(body.data),
      data: body.data as GymData,
    };
    try {
      writeAtomically(config.dataFile, nextState);
      storedState = nextState;
      return res.status(201).json(nextState);
    } catch {
      return res.status(503).json({ error: 'data_store_unavailable' });
    }
  });

  app.get('/api/sync/status', requireSession, (_req, res) => res.json({
    status: 'online',
    revision: storedState?.revision || 0,
    updatedAt: storedState?.updatedAt || null,
    contentHash: storedState?.contentHash || null,
    deviceId: config.deviceId,
    offline: false,
    online: true,
  }));

  app.get('/api/update/check', (req, res) => {
    const currentVersion = typeof req.query.currentVersion === 'string' ? req.query.currentVersion : APP_VERSION;
    const channel = typeof req.query.channel === 'string' ? req.query.channel : 'stable';
    const releases = readManifest(config).filter((release) => release.channel === channel || !release.channel);
    if (!releases.length) return res.json({ status: 'unavailable_not_configured', updateAvailable: false, currentVersion });
    const latest = releases[0];
    const latestVersion = typeof latest.version === 'string' ? latest.version : currentVersion;
    return res.json({ status: latestVersion === currentVersion ? 'up_to_date' : 'available', updateAvailable: latestVersion !== currentVersion, currentVersion, latestVersion, update: latestVersion !== currentVersion ? latest : null });
  });
  app.get('/api/update/history', (_req, res) => {
    const releases = readManifest(config);
    res.json({ status: releases.length ? 'available' : 'unavailable_not_configured', releases });
  });
  app.get('/api/update/download/:version', (_req, res) => res.status(503).json({ error: 'unavailable_not_configured', message: 'Update packages are not served by this local server.' }));
  app.post('/api/update/apply', (_req, res) => res.status(503).json({ error: 'unavailable_not_configured' }));
  app.post('/api/update/rollback', (_req, res) => res.status(503).json({ error: 'unavailable_not_configured' }));

  app.post('/api/agent/analyze', requireSession, (req, res) => {
    try {
      res.json({ ...limitedAgentAnalysis(req.body), provider: 'local_heuristic', externalCalls: false });
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const typed = error as { status: number; message: string };
        return res.status(typed.status).json({ error: typed.message });
      }
      return res.status(400).json({ error: 'invalid_agent_payload' });
    }
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) return res.status(400).json({ error: 'invalid_json' });
    if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') return res.status(413).json({ error: 'body_too_large' });
    console.error('[server] request failed');
    return res.status(500).json({ error: 'internal_server_error' });
  });
  return { app, config };
}

export async function startServer() {
  const { app, config } = createApp();
  const loopback = config.bindHost === '127.0.0.1' || config.bindHost === 'localhost' || config.bindHost === '::1';
  const hasTlsFiles = Boolean(config.tlsCertFile && config.tlsKeyFile);
  if (!hasTlsFiles && !config.allowInsecureLocalhost) {
    console.warn('[server] Running in HTTP mode without TLS credentials.');
  }
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  const listener = hasTlsFiles
    ? https.createServer({
        cert: fs.readFileSync(path.resolve(config.tlsCertFile as string)),
        key: fs.readFileSync(path.resolve(config.tlsKeyFile as string)),
      }, app)
    : app;
  return listener.listen(config.port, config.bindHost, () => {
    const protocol = hasTlsFiles ? 'https' : 'http';
    console.log(`GymTracker Pro server listening on ${protocol}://${config.bindHost}:${config.port}`);
  });
}

if (process.env.GYMTRACKER_NO_AUTOSTART !== '1') {
  startServer().catch((err) => {
    console.error('[server] Failed to start server:', err?.message || err);
    process.exitCode = 1;
  });
}
