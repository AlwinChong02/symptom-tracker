import { FC } from 'react';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
}

interface MedicationListProps {
  medications: Medication[];
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
                <p className="text-sm text-gray-600">{med.dosage} - {med.frequency} at {Array.isArray(med.times) ? med.times.join(', ') : ''}</p>
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
