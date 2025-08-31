import { useState, FormEvent } from 'react';
import { addUserSymptom } from '@/lib/api';
import { SymptomCategory } from '@/types/symptom';
import { MessageType } from '@/types/ui';

interface AddSymptomFormProps {
  onSymptomAdded: () => void;
  onShowDialog: (type: MessageType, message: string, title?: string) => void;
  onShowLoadingDialog: (loadingMessage: string) => void;
}

const categories: { value: SymptomCategory; label: string }[] = [
  { value: 'pain', label: 'Pain' },
  { value: 'digestive', label: 'Digestive' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'skin', label: 'Skin' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'other', label: 'Other' },
];

export default function AddSymptomForm({ onSymptomAdded, onShowDialog, onShowLoadingDialog }: AddSymptomFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SymptomCategory>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowDialog('error', 'Please enter a symptom name.');
      return;
    }

    onShowLoadingDialog('Adding symptom...');
    setIsSubmitting(true);
    try {
      await addUserSymptom({ name: name.trim(), description: description.trim() || undefined, category });
      onShowDialog('success', 'Symptom added successfully!');
      setName('');
      setDescription('');
      setCategory('other');
      onSymptomAdded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add symptom.';
      onShowDialog('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Add New Symptom</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptom Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Headache, Nausea, Back Pain"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SymptomCategory)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details about this symptom..."
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Symptom'}
        </button>
      </form>
    </div>
  );
}
