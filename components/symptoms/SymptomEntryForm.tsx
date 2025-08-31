import { useState, FormEvent } from 'react';
import { addSymptomEntry } from '@/lib/api';
import { UserSymptom } from '@/types/symptom';
import { MessageType } from '@/types/ui';

interface SymptomEntryFormProps {
  symptoms: UserSymptom[];
  onEntryAdded: () => void;
  onShowDialog: (type: MessageType, message: string, title?: string) => void;
  onShowLoadingDialog: (loadingMessage: string) => void;
}

export default function SymptomEntryForm({ symptoms, onEntryAdded, onShowDialog, onShowLoadingDialog }: SymptomEntryFormProps) {
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSymptom || !date || !time || severity < 1 || severity > 10) {
      onShowDialog('error', 'Please fill in all required fields with valid values.');
      return;
    }

    onShowLoadingDialog('Logging symptom entry...');
    setIsSubmitting(true);
    try {
      const triggerArray = triggers.split(',').map(t => t.trim()).filter(t => t);
      
      await addSymptomEntry({
        symptom: selectedSymptom,
        date,
        time,
        severity,
        notes: notes.trim() || undefined,
        triggers: triggerArray.length > 0 ? triggerArray : undefined,
        duration: duration.trim() || undefined,
      });
      onShowDialog('success', 'Symptom entry logged successfully!');
      // Reset form
      setSelectedSymptom('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setSeverity(5);
      setNotes('');
      setTriggers('');
      setDuration('');
      onEntryAdded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log symptom entry.';
      onShowDialog('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (symptoms.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          Please add at least one symptom before creating entries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Log Symptom Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptom *
            </label>
            <select
              value={selectedSymptom}
              onChange={(e) => setSelectedSymptom(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a symptom</option>
              {symptoms.map((symptom) => (
                <option key={symptom._id} value={symptom._id}>
                  {symptom.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity: {severity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={isSubmitting}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mild (1)</span>
            <span>Moderate (5)</span>
            <span>Severe (10)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Optional)
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 30 minutes, 2 hours"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triggers (Optional)
            </label>
            <input
              type="text"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="e.g., stress, food, weather (comma-separated)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this symptom occurrence..."
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedSymptom}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          {isSubmitting ? 'Adding Entry...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
}
