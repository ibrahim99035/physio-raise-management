import session from 'express-session';
import MongoStore from 'connect-mongo';

const maxAge = 1000 * 60 * 60 * 8;
const isTest = process.env.NODE_ENV === 'test';
const useMongoStore = process.env.SESSION_STORE === 'mongo' && !isTest;

const store = useMongoStore
  ? MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/physion_raisemanagement',
      collectionName: 'sessions'
    })
  : undefined;

export const sessionMiddleware = session({
  name: process.env.SESSION_NAME || 'physion.sid',
  secret: process.env.SESSION_SECRET || 'unsafe-dev-secret',
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge
  }
});
