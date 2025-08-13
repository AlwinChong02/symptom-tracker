import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // No token logic, always logged out (or implement new logic)
    setIsLoggedIn(false);
  }, [router.asPath]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              {/* Website Logo */}
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">AI Symptom Tracker</span>
              </Link>
            </div>
            {/* Primary Navbar items */}
            <div className="hidden md:flex items-center space-x-1">
              {isLoggedIn && (
                <>
                  <Link href="/symptom-tracker" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Symptom Tracker</Link>
                  <Link href="/history" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">History</Link>
                  <Link href="/medications" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Medications</Link>
                </>
              )}
            </div>
          </div>
          {/* Secondary Navbar items */}
          <div className="hidden md:flex items-center space-x-3 ">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300">Logout</button>
            ) : (
              <>
                <Link href="/login" className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-200 transition duration-300">Log In</Link>
                <Link href="/register" className="py-2 px-2 font-medium text-white bg-green-500 rounded hover:bg-green-400 transition duration-300">Sign Up</Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="outline-none mobile-menu-button">
              {/* Add mobile menu icon here */}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
