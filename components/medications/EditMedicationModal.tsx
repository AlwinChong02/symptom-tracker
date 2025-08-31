import { useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import type { ReminderRecord, Frequency, DayOfWeek } from '@/types/reminder';
import type { EditMedicationModalProps } from '@/types/medication';

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditMedicationModal({ medication, isOpen, onClose, onUpdate }: EditMedicationModalProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [times, setTimes] = useState<string[]>(['']);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (medication) {
      setName(medication.name || '');
      setDosage(medication.dosage || '');
      setFrequency(medication.frequency || 'Daily');
      setTimes(Array.isArray(medication.times) && medication.times.length > 0 ? medication.times : ['']);
      setDaysOfWeek(Array.isArray(medication.daysOfWeek) ? medication.daysOfWeek : []);
      setStartDate(medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : '');
    }
  }, [medication]);

  const handleTimeChange = useCallback((index: number, value: string) => {
    setTimes(prev => {
      const newTimes = [...prev];
      newTimes[index] = value;
      return newTimes;
    });
  }, []);

  const addTimeInput = useCallback(() => {
    setTimes(prev => [...prev, '']);
  }, []);

  const removeTimeInput = useCallback((index: number) => {
    setTimes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDayChange = useCallback((day: DayOfWeek) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedData = {
      name,
      dosage,
      frequency,
      times: times.filter(t => t.trim()),
      daysOfWeek,
      startDate: startDate || undefined,
    };
    onUpdate(updatedData);
  }, [name, dosage, frequency, times, daysOfWeek, startDate, onUpdate]);

  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Medication Reminder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Medication Name" 
              className="p-2 border rounded" 
              required 
            />
            <input 
              type="text" 
              value={dosage} 
              onChange={(e) => setDosage(e.target.value)} 
              placeholder="Dosage (e.g., 1 tablet)" 
              className="p-2 border rounded" 
              required 
            />
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
            <select 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value as Frequency)} 
              className="mt-1 block w-full p-2 border rounded"
            >
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
                    className={`p-2 border rounded-full text-sm transition-colors ${daysOfWeek.includes(day) ? 'bg-green-600 text-white border-green-600' : 'bg-gray-200 hover:bg-gray-300'}`}
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
                  <button 
                    type="button" 
                    onClick={() => removeTimeInput(index)} 
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addTimeInput} 
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              + Add another time
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Update Reminder
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
