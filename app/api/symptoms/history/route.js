import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomHistory from '../../../../models/SymptomHistory';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function POST(req) {
  await dbConnect();

  try {
    const { symptoms, analysis } = await req.json();
    const userId = await getUserIdFromRequest(req);

    const history = await SymptomHistory.create({
      user: userId,
      symptoms,
      analysis,
    });
    return NextResponse.json({ success: true, data: history }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
