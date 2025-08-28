"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Navbar from '../../components/Navbar';
import MessageDialog, { type MessageType } from '@/components/ui/MessageDialog';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MessageType>('info');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [redirectOnClose, setRedirectOnClose] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, birthdate, phone, gender }),
      });

      if (res.ok) {
        setDialogType('success');
        setDialogTitle('Registration Successful');
        setDialogMessage('Your account has been created. Please log in.');
        setDialogOpen(true);
        setRedirectOnClose('/login');
      } else {
        const data = await res.json();
        setDialogType('error');
        setDialogTitle('Registration Failed');
        setDialogMessage(data.message || 'Something went wrong.');
        setDialogOpen(true);
      }
    } catch (error) {
      setDialogType('error');
      setDialogTitle('Registration Error');
      setDialogMessage('An unexpected error occurred.');
      setDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6ECD9]">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="birthdate" className="block text-gray-700 text-sm font-bold mb-2">Birthdate</label>
            <input
              type="date"
              id="birthdate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="+14155552671"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
            <select
              id="gender"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
              Register
            </button>
          </div>
        </form>
        </div>
      </div>
      <MessageDialog
        open={dialogOpen}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => {
          setDialogOpen(false);
          if (redirectOnClose) {
            const path = redirectOnClose;
            setRedirectOnClose(null);
            router.push(path);
          }
        }}
      />
    </div>
  );
}

