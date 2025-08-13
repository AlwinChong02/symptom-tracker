import mongoose from 'mongoose';

const SymptomHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptoms: [
    {
      question: String,
      answer: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SymptomHistory || mongoose.model('SymptomHistory', SymptomHistorySchema);
