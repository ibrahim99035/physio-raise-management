import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { sessionMiddleware } from './config/session.js';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import sessionRoutes from './routes/sessions.js';
import serviceRoutes from './routes/services.js';
import staffRoutes from './routes/staff.js';
import financeRoutes from './routes/finance.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'physion-raise-management', date: new Date().toISOString() });
});

app.use(express.static(path.join(rootDir, 'client/public')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'client/public/index.html'));
});

export default app;
