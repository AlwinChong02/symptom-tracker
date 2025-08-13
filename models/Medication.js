import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide the medication name.'],
  },
  dosage: {
    type: String,
    required: [true, 'Please provide the dosage.'],
  },
  frequency: {
    type: String, // e.g., 'Daily', 'Weekly', 'As Needed'
    required: [true, 'Please provide the frequency.'],
  },
  times: {
    type: [String], // e.g., ['08:00', '20:00']
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
