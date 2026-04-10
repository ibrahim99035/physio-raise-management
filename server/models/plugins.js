import mongoose from 'mongoose';

export function softDeletePlugin(schema) {
  schema.add({
    isArchived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null }
  });

  schema.methods.archive = async function archive() {
    this.isArchived = true;
    this.archivedAt = new Date();
    await this.save();
  };

  schema.methods.restore = async function restore() {
    this.isArchived = false;
    this.archivedAt = null;
    await this.save();
  };

  schema.pre(/^find/, function findFilter(next) {
    const includeArchived = this.getOptions().includeArchived;
    if (!includeArchived) {
      this.where({ isArchived: false });
    }
    next();
  });
}

export const objectId = mongoose.Schema.Types.ObjectId;
