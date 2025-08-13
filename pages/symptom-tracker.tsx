import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getSymptomCheckResponse } from '../lib/api';

export default function SymptomTracker() {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionHistory, setSessionHistory] = useState<any>([]);
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const getNextQuestion = useCallback(async (history: any) => {
    setLoading(true);
    setError('');
    try {
      const data = await getSymptomCheckResponse(history);

      if (data.is_final) {
        setFinalAnalysis(data.analysis);
        const finalHistory = [...history, { question: 'Final Analysis', answer: data.analysis }];
        await saveHistory(finalHistory);
        setCurrentQuestion(null); // End session
      } else {
        setCurrentQuestion(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveHistory = async (finalHistory: any) => {
    try {
      const res = await fetch('/api/symptoms/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: finalHistory }),
      });

      if (!res.ok) throw new Error('Failed to save history.');
      // No alert needed, the UI will show the final analysis
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    getNextQuestion([]); // Fetch initial question on component mount
  }, []);

  const handleOptionClick = (optionText: string) => {
    const newHistory = [...sessionHistory, { question: currentQuestion.question, answer: optionText }];
    setSessionHistory(newHistory);
    getNextQuestion(newHistory);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>AI is thinking...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">AI Symptom Tracker</h1>
        {currentQuestion ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option: string, index: number) => (
                <button 
                  key={index}
                  onClick={() => handleOptionClick(option)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : finalAnalysis ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Final Analysis</h2>
            <div className="text-left whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">{finalAnalysis}</div>
            <button onClick={() => router.push('/history')} className="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              View Full History
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-700">Thank you. Your session has ended.</p>
            <button onClick={() => router.push('/history')} className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              View History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
