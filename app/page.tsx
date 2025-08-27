"use client";

import Link from 'next/link';
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
    <div>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Symptom Checker */}
            <section className="relative shadow-xl rounded-2xl overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-700 mix-blend-multiply" />
              </div>
              <div className="relative px-6 py-16 sm:px-8 sm:py-24 lg:py-28">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-white">
                  How are you feeling today?
                </h1>
                <p className="mt-6 max-w-xl text-xl text-indigo-200">
                  Our smart symptom checker can help you understand your symptoms and what to do next.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/symptom-checker"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50"
                  >
                    Start Symptom Check
                  </Link>
                  {user && (
                    <Link
                      href="/history"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600"
                    >
                      View History
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* Right: How it works */}
            <section className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
                <p className="mt-3 text-lg text-gray-600">A simple, three-step process to understand your health.</p>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Feature
                  step="1"
                  title="Answer simple questions"
                  description="Our chat-based system will guide you through easy questions about your symptoms."
                />
                <Feature
                  step="2"
                  title="AI-powered analysis"
                  description="We analyze your responses to identify potential causes."
                />
                <Feature
                  step="3"
                  title="Receive your assessment"
                  description="Get a personalized assessment and recommended next steps."
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

