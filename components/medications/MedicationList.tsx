import { FC } from 'react';
import type { MedicationListProps } from '@/types/medication';

const MedicationList: FC<MedicationListProps> = ({ medications, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Medications</h2>
      {medications.length > 0 ? (
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med._id} className="p-4 rounded-lg flex justify-between items-center">
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
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(med)}
                    className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(med._id)}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
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
