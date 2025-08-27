import { FC } from 'react';
import type { ReminderRecord } from '@/types/reminder';

interface MedicationListProps {
  medications: ReminderRecord[];
}

const MedicationList: FC<MedicationListProps> = ({ medications }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Medications</h2>
      {medications.length > 0 ? (
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med._id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{med.name}</p>
                <p className="text-sm text-gray-600">
                  {med.dosage} - {med.frequency}
                  {Array.isArray(med.times) && med.times.length > 0 && ` at ${med.times.join(', ')}`}
                </p>
                {med.startDate && (
                  <p className="text-xs text-gray-500">Start: {new Date(med.startDate).toLocaleDateString()}</p>
                )}
                {Array.isArray(med.daysOfWeek) && med.daysOfWeek.length > 0 && (
                  <p className="text-xs text-gray-500">Days: {med.daysOfWeek.join(', ')}</p>
                )}
              </div>
              {/* Placeholder for future actions like edit/delete */}
            </div>
          ))}
        </div>
      ) : (
        <p>You have not added any medications yet.</p>
      )}
    </div>
  );
};

export default MedicationList;
