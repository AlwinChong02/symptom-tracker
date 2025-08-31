import { FC } from 'react';
import type { UserSymptom } from '@/types/symptom';

interface SymptomListProps {
  symptoms: UserSymptom[];
  onEdit?: (symptom: UserSymptom) => void;
  onDelete?: (id: string) => void;
}

const categoryColors = {
  pain: 'bg-red-100 text-red-800',
  digestive: 'bg-orange-100 text-orange-800',
  respiratory: 'bg-blue-100 text-blue-800',
  neurological: 'bg-purple-100 text-purple-800',
  skin: 'bg-pink-100 text-pink-800',
  mental_health: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};

const SymptomList: FC<SymptomListProps> = ({ symptoms, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Symptoms</h2>
      {symptoms.length > 0 ? (
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <div key={symptom._id} className="p-4 border rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{symptom.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[symptom.category]}`}>
                    {symptom.category.replace('_', ' ')}
                  </span>
                </div>
                {symptom.description && (
                  <p className="text-sm text-gray-600 mb-2">{symptom.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  Added: {new Date(symptom.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(symptom)}
                    className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(symptom._id)}
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
        <p className="text-gray-500">No symptoms added yet. Add your first symptom to start tracking.</p>
      )}
    </div>
  );
};

export default SymptomList;
