import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();

  try {
    const { name, email, password, birthdate, phone, gender } = await req.json();

    if (!name || !email || !password || !birthdate || !phone || !gender) {
      return NextResponse.json({ success: false, message: 'Please provide name, email, password, birthdate, phone, and gender.' }, { status: 400 });
    }

    // Light validation
    const phoneRegex = /^\+?[0-9]{7,15}$/u;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: 'Please provide a valid phone number with country code (e.g., +14155552671).' }, { status: 400 });
    }

    const allowedGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    if (!allowedGenders.includes(gender)) {
      return NextResponse.json({ success: false, message: 'Invalid gender selection.' }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (user) {
      return NextResponse.json({ success: false, message: 'User already exists.' }, { status: 400 });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      phone,
      gender,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

