import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../lib/adminAuth';

// GET all users (admin only)
export async function GET(req) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(searchQuery);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(req) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { name, email, password, role = 'user', phone, gender, birthdate } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists.' },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email,
      password,
      role,
      firstTime: false
    };

    if (phone) userData.phone = phone;
    if (gender) userData.gender = gender;
    if (birthdate) userData.birthdate = new Date(birthdate);

    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
