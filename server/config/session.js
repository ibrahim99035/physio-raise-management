import session from 'express-session';
import MongoStore from 'connect-mongo';

const DEFAULT_SESSION_HOURS = 12;
const hoursFromEnv = Number(process.env.SESSION_MAX_AGE_HOURS || DEFAULT_SESSION_HOURS);
const sessionHours = Number.isFinite(hoursFromEnv) && hoursFromEnv > 0 ? hoursFromEnv : DEFAULT_SESSION_HOURS;
const maxAge = 1000 * 60 * 60 * sessionHours;
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
const hasMongoUri = Boolean(process.env.MONGO_URI);
const useMongoStore = !isTest && (process.env.SESSION_STORE === 'mongo' || (isProduction && hasMongoUri));

function normalizeCookieDomain(value) {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      return new URL(raw).hostname;
    } catch {
      return undefined;
    }
  }

  return raw;
}

const cookieDomain = normalizeCookieDomain(process.env.SESSION_COOKIE_DOMAIN);
const cookieSameSite = process.env.SESSION_COOKIE_SAMESITE || 'lax';

const store = useMongoStore
  ? MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/physion_raisemanagement',
      collectionName: 'sessions',
      ttl: Math.floor(maxAge / 1000)
    })
  : undefined;

if (store) {
  store.on('error', (error) => {
    console.error('Session store error:', error?.message || error);
  });
}

export const sessionMiddleware = session({
  name: process.env.SESSION_NAME || 'physion.sid',
  secret: process.env.SESSION_SECRET || 'unsafe-dev-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: isProduction,
    domain: cookieDomain,
    maxAge
  }
});
