import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomHistory from '../../../../models/SymptomHistory';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function GET(req) {
  await dbConnect();

  try {
    const userId = await getUserIdFromRequest(req);
    const histories = await SymptomHistory.find({ user: userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: histories });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
