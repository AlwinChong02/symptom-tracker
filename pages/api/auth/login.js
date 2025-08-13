import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
          return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

  // JWT code removed. Just return user info or success.
  res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
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
