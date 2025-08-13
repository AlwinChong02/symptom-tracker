// scripts/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Symptom from '../models/Symptom.js';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
// Load environment variables from .env.local with debugging
dotenv.config({ path: './.env', debug: true });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Symptom.deleteMany({});

    // --- Create Fake Users ---
    console.log('Creating fake users...');

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: bcrypt.hashSync('password123', salt),
      },
      {
        name: 'Bob Williams',
        email: 'bob@example.com',
        password: bcrypt.hashSync('password456', salt),
      }
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully.');

    // --- Create a Fake Initial Symptom Question ---
    console.log('Creating fake initial symptom question...');
    const initialSymptom = {
      question: 'What is your primary symptom?',
      isInitial: true,
      options: [
        { text: 'Headache' },
        { text: 'Fever' },
        { text: 'Cough' },
        { text: 'Fatigue' },
      ],
    };
    await Symptom.create(initialSymptom);
    console.log('Initial symptom seeded successfully.');

    console.log('\nDatabase seeding completed!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedData();
