import dbConnect from '../../../lib/dbConnect';
import Symptom from '../../../models/Symptom';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        let question;
        if (id) {
          question = await Symptom.findById(id);
        } else {
          // Find the initial question to start the flow
          question = await Symptom.findOne({ isInitial: true });
        }

        if (!question) {
          return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.status(200).json({ success: true, data: question });
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
