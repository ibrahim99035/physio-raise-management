import { Patient } from '../models/Patient.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPatients = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ]
      }
    : {};

  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json(patients);
});

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

export const archivePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).setOptions({ includeArchived: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  await patient.archive();
  res.status(204).send();
});
