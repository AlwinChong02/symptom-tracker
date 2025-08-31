import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Medication from '../../../../models/Reminder';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function PUT(req, { params }) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const update = await req.json();

    // Ensure only allowed fields are updated
    const allowed = ['name', 'dosage', 'frequency', 'times', 'daysOfWeek', 'startDate', 'active'];
    const payload = {};
    for (const key of allowed) {
      if (key in update) payload[key] = update[key];
    }

    if (payload.frequency === 'Weekly' && (!Array.isArray(payload.daysOfWeek) || payload.daysOfWeek.length === 0)) {
      return NextResponse.json({ success: false, message: 'Days of the week are required for weekly frequency.' }, { status: 400 });
    }

    if ('startDate' in payload && payload.startDate) {
      payload.startDate = new Date(payload.startDate);
    }

    const med = await Medication.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: payload },
      { new: true }
    );

    if (!med) {
      return NextResponse.json({ success: false, message: 'Medication not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: med });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update medication.' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const med = await Medication.findOneAndDelete({ _id: id, user: userId });
    if (!med) {
      return NextResponse.json({ success: false, message: 'Medication not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Medication deleted.' });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to delete medication.' }, { status: 400 });
  }
}
