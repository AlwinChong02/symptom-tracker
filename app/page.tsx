"use client";

import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useState } from 'react';
import { FiShield, FiClock, FiZap, FiArrowRight } from 'react-icons/fi';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });

type FeatureProps = {
  title: string;
  description: string;
  step: string;
  isOpen: boolean;
  onToggle: () => void;
};

const Feature = ({ title, description, step, isOpen, onToggle }: FeatureProps) => (
  <div className="border border-gray-200 rounded-xl p-4 bg-white/80">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start gap-4 text-left"
      aria-expanded={isOpen}
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-emerald-500 text-white font-bold text-lg shrink-0">
        {step}
      </div>
      <div className="flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span>{title}</span>
          <svg
            className={`ml-3 h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </h3>
        {isOpen && (
          <p className="mt-2 text-sm sm:text-base text-gray-600">{description}</p>
        )}
      </div>
    </button>
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const features = [
    {
      step: '1',
      title: 'Answer simple questions',
      description:
        'Our chat-based system will guide you through easy questions about your symptoms.',
    },
    {
      step: '2',
      title: 'AI-powered analysis',
      description: 'We analyze your responses to identify potential causes.',
    },
    {
      step: '3',
      title: 'Receive your assessment',
      description: 'Get a personalized assessment and recommended next steps.',
    },
  ];

  return (
    <div className={nunito.className}>
      <main>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

            {/* Left: How it works */}
            <section id="how-it-works" className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm lg:col-span-2">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold tracking-wide">Your AI Health Companion</span>
                <h2 className="mt-3 text-3xl font-extrabold text-gray-900">How It Works</h2>
                <p className="mt-2 text-base sm:text-lg text-gray-600">A simple, three-step process to understand your health.</p>
              </div>
              <div className="mt-6 space-y-4">
                {features.map((f, idx) => (
                  <Feature
                    key={f.step}
                    step={f.step}
                    title={f.title}
                    description={f.description}
                    isOpen={openIndex === idx}
                    onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                  />
                ))}
              </div>
              <div className="mt-6">
                <Link href="#hero" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium">
                  See it in action <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </section>

            {/* Right: Symptom Checker */}
            <section id="hero" className="relative shadow-xl rounded-2xl overflow-hidden lg:col-span-3">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-600 mix-blend-multiply" />
              </div>
              <div className="relative px-6 py-16 sm:px-8 sm:py-24 lg:py-28">
                <div className="inline-flex items-center rounded-full bg-white/20 text-white px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-white/30">
                  Fast • Private • Free
                </div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-white">
                  Understand your symptoms in minutes
                </h1>
                <p className="mt-4 max-w-2xl text-lg sm:text-xl text-emerald-100/90">
                  A guided, conversational check that helps you decide what to do next.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/symptom-checker"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-emerald-700 bg-white hover:bg-emerald-50"
                  >
                    Start Symptom Check
                  </Link>
                  {user && (
                    <Link
                      href="/history"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
                    >
                      View History
                    </Link>
                  )}
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

