"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useAuth } from '../lib/authContext';

const Feature = ({ title, description, step }: { title: string, description: string, step: string }) => (
  <div>
    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white font-bold text-xl">
      {step}
    </div>
    <div className="mt-5">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{description}</p>
    </div>
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      <main>
        <div className="relative">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-700 mix-blend-multiply" />
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">How are you feeling today?</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-200 sm:max-w-3xl">
                  Our smart symptom checker can help you understand your symptoms and what to do next.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:gap-5">
                    <Link
                      href="/symptom-checker"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8"
                    >
                      Start Symptom Check
                    </Link>
                    {user && (
                      <Link
                        href="/history"
                        className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 sm:px-8"
                      >
                        View History
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                A simple, three-step process to understand your health.
              </p>
            </div>
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Feature
                  step="1"
                  title="Answer simple questions"
                  description="Our chat-based system will guide you through a series of easy-to-understand questions about your symptoms."
                />
                <Feature
                  step="2"
                  title="AI-powered analysis"
                  description="Our intelligent system analyzes your responses against a vast medical database to identify potential causes."
                />
                <Feature
                  step="3"
                  title="Receive your assessment"
                  description="Get a personalized health assessment that explains possible conditions and recommends next steps."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

