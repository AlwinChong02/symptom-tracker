import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomHistory from '../../../../models/SymptomHistory';

export async function GET(req) {
  await dbConnect();

  try {
    // Return all histories (no user filtering)
    const histories = await SymptomHistory.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: histories });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
