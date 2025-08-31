"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WithAdminAuthProps {
  children: React.ReactNode;
}

export default function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAdminAccess = async () => {
        try {
          const response = await fetch('/api/admin/users');
          if (response.ok) {
            setIsAdmin(true);
          } else if (response.status === 403) {
            setIsAdmin(false);
            router.push('/');
          } else {
            setIsAdmin(false);
            router.push('/login');
          }
        } catch (error) {
          setIsAdmin(false);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };

      checkAdminAccess();
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Verifying admin access...</p>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700">You don't have admin privileges to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
