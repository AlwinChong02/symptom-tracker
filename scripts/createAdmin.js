const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema (copy from the model)
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Try to upgrade the first user to admin
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    if (firstUser) {
      await User.findByIdAndUpdate(firstUser._id, { role: 'admin' });
      console.log('✅ First user upgraded to admin:', firstUser.email);
      console.log('Please log out and log back in to access admin features.');
    } else {
      // Create new admin user if no users exist
      const adminEmail = 'admin@symptomtracker.com';
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const adminUser = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        firstTime: false,
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
