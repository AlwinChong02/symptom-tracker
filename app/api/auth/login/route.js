import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please provide email and password.' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 400 });
    }


    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        birthdate: user.birthdate ? user.birthdate.toISOString() : null,
        role: user.role || 'user',
      } 
    });
  } catch (error) {

    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

