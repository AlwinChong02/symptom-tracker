import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  firstTime: {
    type: Boolean,
    default: true,
  },
  birthdate: {
    type: Date,
  },
  phone: {
    type: String,
    match: [/^\+?[0-9]{7,15}$/u, 'Please provide a valid phone number (include country code, e.g., +14155552671).'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
