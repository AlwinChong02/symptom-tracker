import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  nextQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Symptom',
    default: null, // No next question means this is an end path
  },
});

const SymptomSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  isInitial: {
    type: Boolean,
    default: false, // Flag to easily find the starting question
  },
  options: {
    type: [OptionSchema],
    required: true,
  },
});

export default mongoose.models.Symptom || mongoose.model('Symptom', SymptomSchema);
