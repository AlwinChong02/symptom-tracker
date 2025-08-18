import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  await dbConnect();

  // THIS IS A TEMPORARY AND INSECURE WORKAROUND
  // TODO: Re-implement proper authentication
  const userId = "6674b5b77079a489d738f613"; // Hardcoded user ID for testing

  try {

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: 'Please provide current and new passwords.' }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect current password.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully.' });

  } catch (error) {
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
