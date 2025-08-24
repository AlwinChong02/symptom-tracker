import mongoose from 'mongoose';

const SymptomHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  analysis: {
    summary: String,
    suggested_causes: [{ title: String, description: String }],
    treatment_plans: [{ title: String, description: String }],
  },
  symptoms: [
    {
      question: String,
      answer: String,
    },
  ],
  final_analysis: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SymptomHistory || mongoose.model('SymptomHistory', SymptomHistorySchema);
