import session from 'express-session';
import MongoStore from 'connect-mongo';

const maxAge = 1000 * 60 * 60 * 8;
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
const hasMongoUri = Boolean(process.env.MONGO_URI);
const useMongoStore = !isTest && (process.env.SESSION_STORE === 'mongo' || (isProduction && hasMongoUri));
const cookieDomain = process.env.SESSION_COOKIE_DOMAIN || undefined;
const cookieSameSite = isProduction ? 'none' : 'lax';

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
