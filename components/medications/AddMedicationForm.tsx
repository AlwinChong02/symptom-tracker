import { useState, ChangeEvent, FormEvent } from 'react';
import { addMedication } from '../../lib/api';

interface AddMedicationFormProps {
  onMedicationAdded: () => void; // Callback to refresh the list
}

export default function AddMedicationForm({ onMedicationAdded }: AddMedicationFormProps) {
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', times: '' });
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMed({ ...newMed, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await addMedication({ 
        ...newMed, 
        times: newMed.times.split(',').map(t => t.trim())
      });
      setNewMed({ name: '', dosage: '', frequency: '', times: '' }); // Clear form
      onMedicationAdded(); // Trigger refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Add New Medication</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" value={newMed.name} onChange={handleChange} placeholder="Medication Name" className="p-2 border rounded" required />
          <input type="text" name="dosage" value={newMed.dosage} onChange={handleChange} placeholder="Dosage (e.g., 1 tablet)" className="p-2 border rounded" required />
          <input type="text" name="frequency" value={newMed.frequency} onChange={handleChange} placeholder="Frequency (e.g., Daily)" className="p-2 border rounded" required />
          <input type="text" name="times" value={newMed.times} onChange={handleChange} placeholder="Times (e.g., 08:00, 20:00)" className="p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Reminder</button>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}
