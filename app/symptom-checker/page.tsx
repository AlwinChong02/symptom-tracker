"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSymptomCheckResponse } from '../../lib/api';
import withAuth from '../../components/auth/withAuth';
import { useAuth } from '../../lib/authContext';

// --- Type Definitions ---
interface ChatItem {
  from: 'ai' | 'user';
  text: string;
  question?: string;
}

interface SuggestedCause {
  name: string;
  description: string;  
}

interface TreatmentPlan {
  action: string;
  details: string;
}

interface FinalAnalysisResponse {
  is_final: boolean;
  question?: string;
  options?: string[];
  summary?: string;
  suggested_causes?: SuggestedCause[];
  treatment_plans?: TreatmentPlan[];
}

// --- Icon Components ---
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3.044a12.02 12.02 0 009-3.044c0-3.313-1.323-6.313-3.432-8.568z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const SummaryCard = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-xl font-bold text-gray-800 ml-3">{title}</h2>
    </div>
    <div>{children}</div>
  </div>
);

const AiBubble = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
    <div className="flex flex-col w-full max-w-md leading-1.5 p-4 bg-white rounded-xl shadow-md">
      <p className="text-sm font-normal text-gray-800">{text}</p>
    </div>
  </div>
);

const UserBubble = ({ text }: { text: string }) => (
  <div className="flex items-start justify-end gap-3 mb-4">
    <div className="flex flex-col w-full max-w-md leading-1.5 p-4 bg-indigo-600 text-white rounded-xl shadow-md">
      <p className="text-sm font-normal">{text}</p>
    </div>
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold flex-shrink-0">U</div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
    <div className="flex items-center space-x-2 p-4 bg-white rounded-xl shadow-md">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
    </div>
  </div>
);

// --- Main Component ---
function SymptomChecker() {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isFinal, setIsFinal] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement | null>(null);
  const [otherMode, setOtherMode] = useState(false);
  const [otherText, setOtherText] = useState('');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [chatHistory]);

  const getNextQuestion = useCallback(async (historyForApi: ChatItem[]) => {
    const processAndSetResponse = (data: FinalAnalysisResponse, historyForApi: ChatItem[]) => {
      if (data.is_final) {
        setFinalAnalysis(data);
        setIsFinal(true);
        setCurrentOptions([]);
        const finalMessage: ChatItem = { from: 'ai', text: data.summary || 'Final analysis completed.' };
        saveHistory([...historyForApi, finalMessage], data);
      } else {
        setChatHistory(prev => [...prev, { from: 'ai', text: data.question || "" }]);
        setCurrentOptions(data.options || []);
      }
    };

    setLoading(true);
    setError('');
    try {
      const apiHistory = historyForApi
        .filter(item => item.from === 'user')
        .map(item => ({ question: item.question, answer: item.text }));
      const data = await getSymptomCheckResponse(apiHistory, user?.id);
      processAndSetResponse(data, historyForApi);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reset and focus handling for "Other" custom input
  useEffect(() => {
    setOtherMode(false);
    setOtherText('');
  }, [currentOptions]);

  useEffect(() => {
    if (otherMode) {
      otherInputRef.current?.focus();
    }
  }, [otherMode]);

  const saveHistory = async (finalHistory: ChatItem[], analysis: FinalAnalysisResponse | null) => {
    const symptomsToSave = finalHistory
      .filter((item: ChatItem) => item.from === 'user')
      .map((item: ChatItem) => ({ question: item.question, answer: item.text }));
    
    const payload = {
      symptoms: symptomsToSave,
      analysis: analysis ? {
        summary: analysis.summary || '',
        // Map to DB schema: { title, description }
        suggested_causes: (analysis.suggested_causes || []).map(c => ({ title: c.name, description: c.description })),
        treatment_plans: (analysis.treatment_plans || []).map(p => ({ title: p.action, description: p.details })),
      } : null,
    };

    try {
      await fetch('/api/symptoms/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    if (user) {
      getNextQuestion([]);
    }
  }, [getNextQuestion, user]);

  const handleOptionClick = (optionText: string) => {
    const lastQuestion = (chatHistory.slice().reverse().find((item: ChatItem) => item.from === 'ai') as ChatItem)?.text;
    const newUserMessage: ChatItem = { from: 'user', text: optionText, question: lastQuestion };
    const newChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(newChatHistory);
    setCurrentOptions([]);
    getNextQuestion(newChatHistory);
  };

  const submitOther = () => {
    const value = otherText.trim();
    if (!value) return;
    setOtherMode(false);
    handleOptionClick(value);
  };

  return (
    <div className="bg-[#F6ECD9] min-h-screen">
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-grow overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {isFinal && finalAnalysis ? (
              <div className="max-w-3xl mx-auto">
                <SummaryCard title="AI Symptom Summary" icon={<HeartIcon />}>
                  <p className="text-gray-600">{finalAnalysis.summary}</p>
                </SummaryCard>
                <SummaryCard title="Suggested Causes" icon={<AlertIcon />}>
                  <ul className="space-y-4">
                    {finalAnalysis.suggested_causes?.map((cause, i) => (
                      <li key={i} className="flex items-start">
                        <DocumentIcon />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-800">{cause.name}</h3>
                          <p className="text-gray-600">{cause.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SummaryCard>
                <SummaryCard title="Recommended Treatment Plans" icon={<ShieldIcon />}>
                  <ul className="space-y-4">
                    {finalAnalysis.treatment_plans?.map((plan, i) => (
                      <li key={i} className="flex items-start">
                        <DocumentIcon />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-800">{plan.action}</h3>
                          <p className="text-gray-600">{plan.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SummaryCard>
              </div>
            ) : (
              <>
                {chatHistory.map((item, index) => (
                  item.from === 'ai' ? <AiBubble key={index} text={item.text} /> : <UserBubble key={index} text={item.text} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={chatEndRef} />
              </>
            )}
            {error && <p className="text-red-500 text-center">Error: {error}</p>}
          </div>
        </div>
        <div className="bg-white border-t border-gray-200 p-4 shadow-up">
          {!loading && !isFinal && (
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentOptions.map((option, index) => {
                const isOther = option === 'Other';
                if (isOther) {
                  return (
                    <div key={`other-${index}`} className="flex items-center">
                      {otherMode ? (
                        <div className="flex w-full items-center bg-white border border-indigo-600 rounded-lg overflow-hidden">
                          <input
                            ref={otherInputRef}
                            type="text"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitOther(); }}
                            placeholder="Type your symptom"
                            className="flex-1 px-4 py-3 outline-none"
                          />
                          <button
                            onClick={submitOther}
                            className="px-4 py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                          >
                            Submit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setOtherMode(true)}
                          className="w-full bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out text-center"
                        >
                          {option}
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out text-center"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
          {isFinal && (
            <div className="max-w-3xl mx-auto text-center">
              <button onClick={() => router.push('/history')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">
                View Full History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(SymptomChecker);
