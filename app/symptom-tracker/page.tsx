"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSymptomCheckResponse } from '../../lib/api';


// --- Type Definitions ---
interface ChatItem {
  from: 'ai' | 'user';
  text: string;
  question?: string;
}

interface ApiResponse {
  is_final: boolean;
  analysis?: string;
  question?: string;
  options?: string[];
}

// --- Helper Components ---
const AiBubble = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
    <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
      <p className="text-sm font-normal text-gray-900">{text}</p>
    </div>
  </div>
);

const UserBubble = ({ text }: { text: string }) => (
  <div className="flex items-start justify-end gap-2.5 mb-4">
    <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-blue-500 rounded-s-xl rounded-ee-xl">
      <p className="text-sm font-normal text-white">{text}</p>
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">U</div>
  </div>
);

const TypingIndicator = () => (
    <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
        </div>
    </div>
);

// --- Main Component ---
export default function SymptomTracker() {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [chatHistory]);

  const processAndSetResponse = (data: ApiResponse, historyForApi: ChatItem[]) => {
    if (data.is_final && data.analysis) {
      const finalMessage: ChatItem = { from: 'ai', text: data.analysis };
      setChatHistory([...historyForApi, finalMessage]);
      setIsFinal(true);
      setCurrentOptions([]);
      saveHistory([...historyForApi, finalMessage]);
    } else {
      setChatHistory(prev => [...prev, { from: 'ai', text: data.question || "" }]);
      setCurrentOptions(data.options || []);
    }
  };

  const getNextQuestion = useCallback(async (historyForApi: ChatItem[]) => {
    setLoading(true);
    setError('');
    try {
      const apiHistory = historyForApi
        .filter(item => item.from === 'user')
        .map(item => ({ question: item.question, answer: item.text }));
      const data = await getSymptomCheckResponse(apiHistory);
      processAndSetResponse(data, historyForApi);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveHistory = async (finalHistory: ChatItem[]) => {
    const symptomsToSave = finalHistory.filter((item: ChatItem) => item.from === 'user').map((item: ChatItem) => ({ question: item.question, answer: item.text }));
    try {
      await fetch('/api/symptoms/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsToSave }),
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    getNextQuestion([]);
  }, [getNextQuestion]);

  const handleOptionClick = (optionText: string) => {
    const lastQuestion = (chatHistory.slice().reverse().find((item: ChatItem) => item.from === 'ai') as ChatItem)?.text;
    const newUserMessage: ChatItem = { from: 'user', text: optionText, question: lastQuestion };
    const newChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(newChatHistory);
    setCurrentOptions([]);
    getNextQuestion(newChatHistory);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-grow overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {chatHistory.map((item, index) => (
            item.from === 'ai' ? <AiBubble key={index} text={item.text} /> : <UserBubble key={index} text={item.text} />
          ))}
          {loading && <TypingIndicator />}
          {error && <p className="text-red-500 text-center">Error: {error}</p>}
          <div ref={chatEndRef} />
        </div>
      </div>
      {!loading && !isFinal && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out text-center"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      {isFinal && (
         <div className="bg-white border-t border-gray-200 p-4 text-center">
            <button onClick={() => router.push('/history')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">
              View Full History
            </button>
         </div>
      )}
    </div>
  );
}
