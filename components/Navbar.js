"use client";

import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              SymptomChecker
            </Link>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-10">
            {user ? (
              <>
                <Link href="/symptom-checker" className="font-medium text-gray-500 hover:text-gray-900">Checker</Link>
                <Link href="/history" className="font-medium text-gray-500 hover:text-gray-900">History</Link>
                <Link href="/medication-reminders" className="font-medium text-gray-500 hover:text-gray-900">Reminders</Link>
                <button 
                  onClick={handleLogout} 
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="font-medium text-gray-500 hover:text-gray-900">Log in</Link>
                <Link href="/register" className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

