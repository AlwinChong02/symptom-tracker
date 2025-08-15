import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomHistory from '../../../../models/SymptomHistory';

export async function POST(req) {
  await dbConnect();

  try {
    const { symptoms } = await req.json();
    // Create history without user association
    const history = await SymptomHistory.create({
      symptoms,
    });
    return NextResponse.json({ success: true, data: history }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
