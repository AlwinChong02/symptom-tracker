import dbConnect from '../../../lib/dbConnect';
import SymptomHistory from '../../../models/SymptomHistory';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();



  switch (method) {
    case 'POST':
      try {
        const { symptoms } = req.body;
        // Create history without user association
        const history = await SymptomHistory.create({
          symptoms,
        });
        res.status(201).json({ success: true, data: history });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
