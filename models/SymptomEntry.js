import mongoose from 'mongoose';

const SymptomEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSymptom',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // HH:MM format
    required: true,
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  notes: {
    type: String,
    trim: true,
  },
  triggers: [{
    type: String,
    trim: true,
  }],
  duration: {
    type: String, // e.g., "30 minutes", "2 hours"
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SymptomEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
SymptomEntrySchema.index({ user: 1, symptom: 1, date: -1 });
SymptomEntrySchema.index({ user: 1, date: -1 });

export default mongoose.models.SymptomEntry || mongoose.model('SymptomEntry', SymptomEntrySchema);
