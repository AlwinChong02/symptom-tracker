import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/User';
import { requireAdmin } from '../../../../../lib/adminAuth';

// GET single user (admin only)
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { name, email, role, phone, gender, birthdate, firstTime } = await req.json();

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (birthdate !== undefined) updateData.birthdate = birthdate ? new Date(birthdate) : null;
    if (firstTime !== undefined) updateData.firstTime = firstTime;

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
