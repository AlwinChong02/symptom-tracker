"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Symptom = {
  question: string;
  answer: string;
};

type AnalysisItem = {
  title: string;
  description: string;
};

type Analysis = {
  summary: string;
  suggested_causes: AnalysisItem[];
  treatment_plans: AnalysisItem[];
}

type HistoryEntry = {
  _id: string;
  createdAt: string;
  symptoms: Symptom[];
  analysis?: Analysis;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnalysis(null);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

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

  const AnalysisModal = ({ analysis, onClose }: { analysis: Analysis; onClose: () => void; }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative">
        <h2 className="text-2xl font-bold mb-4">Final Analysis</h2>
        <div className="text-gray-700 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <h4 className="font-semibold text-lg">Summary</h4>
            <p className="text-gray-600">{analysis.summary}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-lg">Suggested Causes</h4>
            <ul className="list-disc list-inside">
              {analysis.suggested_causes.map((cause, i) => (
                <li key={i}>
                  <strong>{cause.title}:</strong> {cause.description}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg">Treatment Plans</h4>
            <ul className="list-disc list-inside">
              {analysis.treatment_plans.map((plan, i) => (
                <li key={i}>
                  <strong>{plan.title}:</strong> {plan.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-full text-xl">
          &times;
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Symptom History</h1>
        {history.length > 0 ? (
          <div className="space-y-4">

            {/* Display Each History */}
            {history.map((entry) => (
              <div key={entry._id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleAccordion(entry._id)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-100 focus:outline-none"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{entry.symptoms[0]?.answer || 'Symptom Check'}</p>
                    <p className="text-sm text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`transform transition-transform duration-200 ${openAccordion === entry._id ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {/* Full Conversation */}
                {openAccordion === entry._id && (
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="font-semibold text-md mb-2 text-gray-700">Full Conversation:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 mb-4">
                      {entry.symptoms.map((symptom, index) => (
                        <li key={index}>
                          <span className="font-semibold">{symptom.question}</span>: {symptom.answer}
                        </li>
                      ))}
                    </ul>

                    {/* Final Analysis */}
                    {entry.analysis && (
                      <button
                        onClick={() => openModal(entry.analysis!)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                      >
                        View Final Analysis
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No symptom history found.</p>
        )}
      </div>
      {isModalOpen && selectedAnalysis && <AnalysisModal analysis={selectedAnalysis} onClose={closeModal} />}
    </div>
  );
}
