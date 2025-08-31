import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import UserSymptom from '../../../../models/UserSymptom';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function PUT(req, { params }) {
  await dbConnect();
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { name, description, category, isActive } = await req.json();

    const symptom = await UserSymptom.findOneAndUpdate(
      { _id: id, user: userId },
      { 
        name: name?.trim(),
        description: description?.trim(),
        category,
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!symptom) {
      return NextResponse.json({ success: false, message: 'Symptom not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: symptom });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update symptom.' }, { status: 400 });
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
    
    // Soft delete by setting isActive to false
    const symptom = await UserSymptom.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!symptom) {
      return NextResponse.json({ success: false, message: 'Symptom not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Symptom deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete symptom.' }, { status: 400 });
  }
}
