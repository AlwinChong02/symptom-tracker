import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  await dbConnect();

  const userId = await getUserIdFromRequest(request as any);
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const user = await User.findById(userId).select('name email birthdate phone gender');
  if (!user) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    birthdate: user.birthdate ? user.birthdate.toISOString() : null,
    phone: user.phone || '',
    gender: user.gender || '',
  });
}

export async function PUT(request: Request) {
  await dbConnect();

  const userId = await getUserIdFromRequest(request as any);
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { name, birthdate, phone, gender, currentPassword, newPassword } = await request.json();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Update basic fields if provided
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof birthdate === 'string' && birthdate) user.birthdate = new Date(birthdate);
    if (typeof phone === 'string' && phone) {
      const phoneRegex = /^\+?[0-9]{7,15}$/u;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ message: 'Please provide a valid phone number with country code (e.g., +14155552671).' }, { status: 400 });
      }
      user.phone = phone;
    }
    if (typeof gender === 'string' && gender) {
      const allowedGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
      if (!allowedGenders.includes(gender)) {
        return NextResponse.json({ message: 'Invalid gender selection.' }, { status: 400 });
      }
      user.gender = gender;
    }

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Please provide current password to set a new password.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Incorrect current password.' }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    return NextResponse.json({ message: 'Profile updated successfully.' });

  } catch (error) {
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

