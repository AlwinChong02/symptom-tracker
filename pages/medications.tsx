import { useState, useEffect, useCallback } from 'react';
import AddMedicationForm from '../components/medications/AddMedicationForm';
import MedicationList from '../components/medications/MedicationList';
import { getMedications } from '../lib/api';

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getMedications();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading medications...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Error: {error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Medication Reminders</h1>
        <AddMedicationForm onMedicationAdded={fetchMedications} />
        <MedicationList medications={medications} />
      </div>
    </div>
  );
}
