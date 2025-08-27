import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Medication from '../../../models/Reminder';
import { getUserIdFromRequest } from '../../../lib/auth'; // Hypothetical auth utility
import User from '../../../models/User';
import { sendEmail } from '../../../lib/email';

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

// GET all medications for a user
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
    const { name, dosage, frequency, times, daysOfWeek, startDate } = await req.json();

    if (!name || !dosage || !frequency || !times) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    if (frequency === 'Weekly' && (!daysOfWeek || daysOfWeek.length === 0)) {
      return NextResponse.json({ success: false, message: 'Days of the week are required for weekly frequency.' }, { status: 400 });
    }

    const medication = await Medication.create({
      user: userId,
      name,
      dosage,
      frequency,
      times,
      daysOfWeek: frequency === 'Weekly' ? daysOfWeek : [],
      startDate: startDate ? new Date(startDate) : undefined,
    });
    // Send Email confirmation (best-effort)
    try {
      const user = await User.findById(userId).select('name email');
      if (user?.email) {
        const timeList = Array.isArray(times) ? times.join(', ') : String(times || '');
        const weekly = frequency === 'Weekly' && Array.isArray(daysOfWeek) && daysOfWeek.length > 0 ? ` on ${daysOfWeek.join(', ')}` : '';
        const when = frequency === 'Daily' ? `daily at ${timeList}` : frequency === 'Weekly' ? `weekly${weekly} at ${timeList}` : `at ${timeList}`;
        const subject = `Medication reminder created: ${name}`;
        const text = `Hi ${user.name || ''}, your medication reminder has been created.\n\nName: ${name}\nDosage: ${dosage}\nSchedule: ${when}`;
        const html = `<p>Hi ${user.name || ''}, your medication reminder has been created.</p><ul><li><b>Name:</b> ${name}</li><li><b>Dosage:</b> ${dosage}</li><li><b>Schedule:</b> ${when}</li></ul>`;
        await sendEmail({ to: user.email, subject, text, html });
      }
    } catch (e) {
      console.error('Email notify failed:', e);
    }

    return NextResponse.json({ success: true, data: medication }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create medication.' }, { status: 400 });
  }
}
