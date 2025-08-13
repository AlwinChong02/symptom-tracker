
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

type Symptom = {
  question: string;
  answer: string;
};

type HistoryEntry = {
  _id: string;
  createdAt: string;
  symptoms: Symptom[];
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/symptoms/gethistory');
        if (!res.ok) {
          throw new Error('Failed to fetch history.');
        }
        const { data } = await res.json();
        setHistory(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading history...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Symptom History</h1>
        {history.length > 0 ? (
          <div className="space-y-6">
            {history.map((entry) => (
              <div key={entry._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <strong className="text-lg text-gray-700">{new Date(entry.createdAt).toLocaleString()}</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                  {entry.symptoms.map((symptom: Symptom, index: number) => (
                    <li key={index}>
                      <span className="font-semibold">{symptom.question}</span>: {symptom.answer}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No symptom history found.</p>
        )}
      </div>
    </div>
  );
}
