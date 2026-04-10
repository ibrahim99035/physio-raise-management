import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { Staff } from '../models/Staff.js';
import { Patient } from '../models/Patient.js';
import { Service } from '../models/Service.js';
import { Appointment } from '../models/Appointment.js';
import { Session } from '../models/Session.js';
import { Expense } from '../models/Expense.js';

dotenv.config();

const CREDENTIALS = [
  {
    name: 'Admin User',
    email: 'admin@clinic.local',
    password: 'Admin123!',
    roles: ['admin'],
    contactInfo: '+201000000001',
    salary: 7000,
    commission: 0
  },
  {
    name: 'Reception User',
    email: 'reception@clinic.local',
    password: 'Reception123!',
    roles: ['receptionist'],
    contactInfo: '+201000000002',
    salary: 3500,
    commission: 0
  },
  {
    name: 'Therapist One',
    email: 'therapist1@clinic.local',
    password: 'Therapist123!',
    roles: ['therapist'],
    contactInfo: '+201000000003',
    salary: 5000,
    commission: 110
  },
  {
    name: 'Therapist Two',
    email: 'therapist2@clinic.local',
    password: 'Therapist123!',
    roles: ['therapist'],
    contactInfo: '+201000000004',
    salary: 5200,
    commission: 120
  },
  {
    name: 'Therapist Three',
    email: 'therapist3@clinic.local',
    password: 'Therapist123!',
    roles: ['therapist'],
    contactInfo: '+201000000005',
    salary: 4800,
    commission: 100
  }
];

const SERVICE_FIXTURES = [
  { name: 'Initial Assessment', price: 350 },
  { name: 'Manual Therapy', price: 450 },
  { name: 'Posture Correction', price: 300 },
  { name: 'Sports Rehab', price: 550 },
  { name: 'Electrotherapy', price: 280 },
  { name: 'Dry Needling', price: 400 },
  { name: 'Home Program Review', price: 220 },
  { name: 'Neck & Back Session', price: 390 }
];

const PATIENT_FIXTURES = [
  { name: 'Mona Ibrahim', phone: '+201111111111', age: 29, gender: 'female', medicalHistory: 'Lower back pain' },
  { name: 'Hassan Ali', phone: '+201111111112', age: 41, gender: 'male', medicalHistory: 'Post shoulder strain' },
  { name: 'Nour Adel', phone: '+201111111113', age: 34, gender: 'female', medicalHistory: 'Neck stiffness from desk work' },
  { name: 'Karim Magdy', phone: '+201111111114', age: 26, gender: 'male', medicalHistory: 'Ankle sprain after football' },
  { name: 'Salma Fares', phone: '+201111111115', age: 37, gender: 'female', medicalHistory: 'Postpartum pelvic discomfort' },
  { name: 'Omar Samir', phone: '+201111111116', age: 45, gender: 'male', medicalHistory: 'Knee osteoarthritis' },
  { name: 'Lina Mostafa', phone: '+201111111117', age: 31, gender: 'female', medicalHistory: 'Sciatica episodes' },
  { name: 'Youssef Rami', phone: '+201111111118', age: 52, gender: 'male', medicalHistory: 'Frozen shoulder' },
  { name: 'Farah Nabil', phone: '+201111111119', age: 24, gender: 'female', medicalHistory: 'Post-gym lumbar strain' },
  { name: 'Ahmed Emad', phone: '+201111111120', age: 39, gender: 'male', medicalHistory: 'Cervical radiculopathy follow-up' },
  { name: 'Huda Khaled', phone: '+201111111121', age: 47, gender: 'female', medicalHistory: 'Chronic plantar fasciitis' },
  { name: 'Tamer Fathi', phone: '+201111111122', age: 33, gender: 'male', medicalHistory: 'Thoracic mobility restriction' }
];

const EXPENSE_FIXTURES = [
  { title: 'Clinic Rent', amount: 12000, category: 'Rent', notes: 'Monthly rent payment' },
  { title: 'Electricity Bill', amount: 1800, category: 'Utilities', notes: 'Power usage for March' },
  { title: 'Internet', amount: 650, category: 'Utilities', notes: 'Fiber subscription' },
  { title: 'Disposable Supplies', amount: 950, category: 'Supplies', notes: 'Tapes, gloves, sanitizers' },
  { title: 'Cleaning Service', amount: 1400, category: 'Maintenance', notes: 'Weekly deep cleaning' },
  { title: 'Reception Printer Ink', amount: 480, category: 'Office', notes: 'Ink cartridges' },
  { title: 'Marketing Boost', amount: 1600, category: 'Marketing', notes: 'Social ads campaign' },
  { title: 'Equipment Service', amount: 2200, category: 'Maintenance', notes: 'TENS device maintenance' },
  { title: 'Water', amount: 320, category: 'Utilities', notes: 'Water bill' },
  { title: 'Snacks & Water', amount: 410, category: 'Office', notes: 'Patient waiting area' },
  { title: 'New Towels', amount: 730, category: 'Supplies', notes: 'Treatment room linens' },
  { title: 'Accounting Fees', amount: 2000, category: 'Professional', notes: 'Monthly accounting services' }
];

async function upsertUser({ name, email, password, roles, contactInfo = '' }) {
  const passwordHash = await User.hashPassword(password);

  return User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      roles,
      contactInfo,
      isArchived: false,
      archivedAt: null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).setOptions({ includeArchived: true });
}

function dateDaysAgo(daysAgo) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function appointmentStartOffset(baseDate, dayOffset, hour, minute = 0) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/physion_raisemanagement';
  await connectDb(mongoUri);

  await Promise.all([
    Staff.deleteMany({}),
    Session.deleteMany({}),
    Appointment.deleteMany({}),
    Expense.deleteMany({}),
    Service.deleteMany({}),
    Patient.deleteMany({})
  ]);

  const users = [];
  for (const payload of CREDENTIALS) {
    users.push(await upsertUser(payload));
  }

  const therapists = users.filter((u) => (u.roles || []).includes('therapist'));

  await Promise.all(
    users.map((u, i) =>
      Staff.findOneAndUpdate(
        { user: u._id },
        {
          user: u._id,
          baseSalary: CREDENTIALS[i].salary,
          commissionPerSession: CREDENTIALS[i].commission,
          isArchived: false,
          archivedAt: null
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).setOptions({ includeArchived: true })
    )
  );

  const services = await Service.insertMany(SERVICE_FIXTURES);
  const patients = await Patient.insertMany(PATIENT_FIXTURES);

  const now = new Date();
  const appointmentPayloads = [];
  let counter = 0;

  for (let i = -10; i <= 9; i += 1) {
    const patient = patients[counter % patients.length];
    const service = services[counter % services.length];
    const therapist = therapists[counter % therapists.length];

    const startsAt = appointmentStartOffset(now, i, 10 + (counter % 4) * 2, counter % 2 === 0 ? 0 : 30);

    let status = 'scheduled';
    if (i < -4) status = 'completed';
    else if (i < -2) status = counter % 2 === 0 ? 'cancelled' : 'no-show';

    appointmentPayloads.push({
      patient: patient._id,
      therapists: [therapist._id],
      service: service._id,
      startsAt,
      durationMinutes: counter % 3 === 0 ? 45 : 60,
      notes: `Seed appointment #${counter + 1}`,
      status
    });

    counter += 1;
  }

  const appointments = await Appointment.insertMany(appointmentPayloads);

  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  await Session.insertMany(
    completedAppointments.map((a, i) => ({
      appointment: a._id,
      patient: a.patient,
      therapists: a.therapists,
      service: a.service,
      notes: `Completed session note #${i + 1}`
    }))
  );

  await Expense.insertMany(
    EXPENSE_FIXTURES.map((e, i) => ({
      ...e,
      date: dateDaysAgo(i * 3)
    }))
  );

  const therapistLine = therapists
    .map((t, i) => `${i + 1}) ${t.email} / ${CREDENTIALS.find((c) => c.email === t.email)?.password || 'Therapist123!'}`)
    .join('\n');

  console.log('✅ Seed complete.');
  console.log('Users:', await User.countDocuments({ isArchived: false }));
  console.log('Staff:', await Staff.countDocuments({ isArchived: false }));
  console.log('Patients:', await Patient.countDocuments({ isArchived: false }));
  console.log('Services:', await Service.countDocuments({ isArchived: false }));
  console.log('Appointments:', await Appointment.countDocuments({ isArchived: false }));
  console.log('Sessions:', await Session.countDocuments({ isArchived: false }));
  console.log('Expenses:', await Expense.countDocuments({ isArchived: false }));
  console.log('\nLogin credentials:');
  console.log('Admin      admin@clinic.local / Admin123!');
  console.log('Reception  reception@clinic.local / Reception123!');
  console.log(`Therapists\n${therapistLine}`);

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
