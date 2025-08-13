import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        let user = await User.findOne({ email });

        if (user) {
          return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
          name,
          email,
          password: hashedPassword,
        });

        res.status(201).json({ success: true, data: user });
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
