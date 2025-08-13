import dbConnect from '../../../lib/dbConnect';
import Medication from '../../../models/Medication';
import { getUserIdFromRequest } from '../../../lib/auth'; // Hypothetical auth utility

async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  let userId;
  try {
    // In a real app, you would get the user ID from a verified session or token.
    // For this example, we'll use a placeholder function.
    userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }

  switch (method) {
    case 'GET':
      try {
        const medications = await Medication.find({ user: userId }).sort({ name: 1 });
        res.status(200).json({ success: true, data: medications });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to fetch medications.' });
      }
      break;
    case 'POST':
      try {
        const { name, dosage, frequency, times } = req.body;
        if (!name || !dosage || !frequency || !times) {
          return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        const medication = await Medication.create({
          user: userId,
          name,
          dosage,
          frequency,
          times,
        });
        res.status(201).json({ success: true, data: medication });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create medication.' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

export default handler;
