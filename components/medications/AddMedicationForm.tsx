import { useState, ChangeEvent, FormEvent } from 'react';
import { addMedication } from '../../lib/api';
import type { Frequency, DayOfWeek } from '@/types/reminder';

interface AddMedicationFormProps {
  onMedicationAdded: () => void; // Callback to refresh the list
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AddMedicationForm({ onMedicationAdded, onSuccess, onError }: AddMedicationFormProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [times, setTimes] = useState(['']);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addTimeInput = () => {
    setTimes([...times, '']);
  };

  const removeTimeInput = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleDayChange = (day: DayOfWeek) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await addMedication({
        name,
        dosage,
        frequency,
        times: times.filter(t => t), // Filter out empty time strings
        daysOfWeek,
        startDate: startDate || undefined,
      });
      // Reset form
      setName('');
      setDosage('');
      setFrequency('Daily');
      setTimes(['']);
      setDaysOfWeek([]);
      setStartDate('');
      onMedicationAdded(); // Trigger refresh
      onSuccess?.('Medication reminder added successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(msg);
      onError?.(msg);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Add New Medication Reminder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication Name" className="p-2 border rounded" required />
          <input type="text" name="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g., 1 tablet)" className="p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Frequency</label>
          <select name="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="mt-1 block w-full p-2 border rounded">
            <option>Daily</option>
            <option>Weekly</option>
            <option>As Needed</option>
          </select>
        </div>

        {frequency === 'Weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Days</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {days.map(day => (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`p-2 border rounded text-sm ${daysOfWeek.includes(day) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Times</label>
          {times.map((time, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="p-2 border rounded w-full"
                required
              />
              {times.length > 1 && (
                <button type="button" onClick={() => removeTimeInput(index)} className="p-2 bg-red-500 text-white rounded">
                  &times;
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTimeInput} className="mt-2 text-sm text-blue-500 hover:underline">
            + Add another time
          </button>
        </div>

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Reminder</button>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}
