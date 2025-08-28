"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import MessageDialog, { type MessageType } from '@/components/ui/MessageDialog';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MessageType>('info');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [redirectOnClose, setRedirectOnClose] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const { user } = await res.json();
        login(user);
        setDialogType('success');
        setDialogTitle('Login Successful');
        setDialogMessage('Welcome back! Redirecting to your dashboard.');
        setDialogOpen(true);
        setRedirectOnClose('/');
      } else {
        const data = await res.json();
        setDialogType('error');
        setDialogTitle('Login Failed');
        setDialogMessage(data.message || 'Something went wrong.');
        setDialogOpen(true);
      }
    } catch (error) {
      setDialogType('error');
      setDialogTitle('Login Error');
      setDialogMessage('An unexpected error occurred.');
      setDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6ECD9]">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
        <form onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
              Login
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
