import dbConnect from '../../../lib/dbConnect';
import SymptomHistory from '../../../models/SymptomHistory';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();



  switch (method) {
    case 'GET':
      try {
        // Return all histories (no user filtering)
        const histories = await SymptomHistory.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: histories });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
