"use client";

import { useState, useCallback } from 'react';
import ClinicMap from '../../components/clinics/ClinicMap';

export default function FindClinicPage() {
  const [error, setError] = useState('');

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Find a Clinic Near You</h1>
        <p className="mb-6 text-gray-700">
          This map uses your device location and Google Places to show nearby clinics.
        </p>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-sm">
          <ClinicMap onError={handleError} />
        </div>
      </div>
    </div>
  );
}
