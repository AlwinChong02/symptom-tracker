import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import UserSymptom from '../../../models/UserSymptom';
import { getUserIdFromRequest } from '../../../lib/auth';

export async function GET(req) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const symptoms = await UserSymptom.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: symptoms });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch symptoms.' }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { name, description, category } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Symptom name is required.' }, { status: 400 });
    }

    // Check if symptom already exists for this user
    const existingSymptom = await UserSymptom.findOne({ 
      user: userId, 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true 
    });

    if (existingSymptom) {
      return NextResponse.json({ success: false, message: 'A symptom with this name already exists.' }, { status: 400 });
    }

    const symptom = new UserSymptom({
      user: userId,
      name: name.trim(),
      description: description?.trim(),
      category: category || 'other',
    });

    await symptom.save();
    return NextResponse.json({ success: true, data: symptom });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create symptom.' }, { status: 400 });
  }
}
