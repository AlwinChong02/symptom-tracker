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
    <header className="barlow fixed top-4 left-0 right-0 z-50">
      <div className="mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur shadow-lg rounded-2xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SymptomChecker
              </Link>
            </div>
            <nav className="hidden md:flex md:items-center md:space-x-10">
              {user ? (
                <>
                  <Link href="/symptom-checker" className="font-medium text-gray-600 hover:text-gray-900">Checker</Link>
                  <Link href="/history" className="font-medium text-gray-600 hover:text-gray-900">History</Link>
                  <Link href="/medications" className="font-medium text-gray-600 hover:text-gray-900">Reminders</Link>
                  <Link href="/find-clinic" className="font-medium text-gray-600 hover:text-gray-900">Find Clinic</Link>
                  <Link href="/profile" className="font-medium text-gray-600 hover:text-gray-900">Profile</Link>
                  <button 
                    onClick={handleLogout} 
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="font-medium text-gray-600 hover:text-gray-900">Log in</Link>
                  <Link href="/find-clinic" className="font-medium text-gray-600 hover:text-gray-900">Find Clinic</Link>
                  <Link href="/register" className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

