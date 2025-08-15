import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Medication from '../../../models/Medication';
import { getUserIdFromRequest } from '../../../lib/auth'; // Hypothetical auth utility

async function getUserId(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return null;
    }
    return userId;
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  await dbConnect();
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const medications = await Medication.find({ user: userId }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: medications });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch medications.' }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { name, dosage, frequency, times } = await req.json();
    if (!name || !dosage || !frequency || !times) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    const medication = await Medication.create({
      user: userId,
      name,
      dosage,
      frequency,
      times,
    });
    return NextResponse.json({ success: true, data: medication }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create medication.' }, { status: 400 });
  }
}
