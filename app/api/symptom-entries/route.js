import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import SymptomEntry from '../../../models/SymptomEntry';
import UserSymptom from '../../../models/UserSymptom';
import { getUserIdFromRequest } from '../../../lib/auth';

export async function GET(req) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const symptomId = searchParams.get('symptom');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit')) || 100;

  try {
    let query = { user: userId };
    
    if (symptomId) {
      query.symptom = symptomId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await SymptomEntry.find(query)
      .populate('symptom', 'name category')
      .sort({ date: -1, time: -1 })
      .limit(limit);
    
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch symptom entries.' }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { symptom, date, time, severity, notes, triggers, duration } = await req.json();

    if (!symptom || !date || !time || severity === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: 'Symptom, date, time, and severity are required.' 
      }, { status: 400 });
    }

    if (severity < 1 || severity > 10) {
      return NextResponse.json({ 
        success: false, 
        message: 'Severity must be between 1 and 10.' 
      }, { status: 400 });
    }

    // Verify the symptom belongs to the user
    const userSymptom = await UserSymptom.findOne({ _id: symptom, user: userId, isActive: true });
    if (!userSymptom) {
      return NextResponse.json({ success: false, message: 'Invalid symptom.' }, { status: 400 });
    }

    const entry = new SymptomEntry({
      user: userId,
      symptom,
      date: new Date(date),
      time,
      severity,
      notes: notes?.trim(),
      triggers: triggers?.filter(t => t.trim()).map(t => t.trim()),
      duration: duration?.trim(),
    });

    await entry.save();
    
    // Populate the symptom data for response
    await entry.populate('symptom', 'name category');
    
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create symptom entry.' }, { status: 400 });
  }
}
