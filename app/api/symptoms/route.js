import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Symptom from '../../../models/Symptom';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  await dbConnect();

  try {
    let question;
    if (id) {
      question = await Symptom.findById(id);
    } else {
      // Find the initial question to start the flow
      question = await Symptom.findOne({ isInitial: true });
    }

    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
