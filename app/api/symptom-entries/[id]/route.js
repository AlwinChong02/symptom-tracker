import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomEntry from '../../../../models/SymptomEntry';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function PUT(req, { params }) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { date, time, severity, notes, triggers, duration } = await req.json();

    if (severity !== undefined && (severity < 1 || severity > 10)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Severity must be between 1 and 10.' 
      }, { status: 400 });
    }

    const entry = await SymptomEntry.findOneAndUpdate(
      { _id: id, user: userId },
      { 
        date: date ? new Date(date) : undefined,
        time,
        severity,
        notes: notes?.trim(),
        triggers: triggers?.filter(t => t.trim()).map(t => t.trim()),
        duration: duration?.trim(),
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('symptom', 'name category');

    if (!entry) {
      return NextResponse.json({ success: false, message: 'Symptom entry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update symptom entry.' }, { status: 400 });
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
    
    const entry = await SymptomEntry.findOneAndDelete({ _id: id, user: userId });

    if (!entry) {
      return NextResponse.json({ success: false, message: 'Symptom entry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Symptom entry deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete symptom entry.' }, { status: 400 });
  }
}
