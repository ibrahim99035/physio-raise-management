import { Service } from '../models/Service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listServices = asyncHandler(async (_req, res) => {
  const services = await Service.find({}).sort({ name: 1 });
  res.json(services);
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});

export const archiveService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).setOptions({ includeArchived: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  await service.archive();
  res.status(204).send();
});
