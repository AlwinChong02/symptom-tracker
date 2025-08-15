"use client";

import { useState } from 'react';
import ClinicMap from '../../components/clinics/ClinicMap';

export default function FindClinicPage() {
  const [error, setError] = useState('');

  // In a real app, you might fetch the user's location here
  // and pass it to the ClinicMap component.

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Find a Clinic Near You</h1>
        <p className="mb-4 text-gray-600">
          To use this feature, please ensure you have a Google Maps API key configured in your environment variables.
        </p>
        
        {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <ClinicMap onError={setError} />
        </div>
      </div>
    </div>
  );
}
