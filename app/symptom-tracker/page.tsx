"use client";

import { useState, useEffect, useCallback } from 'react';
import withAuth from '../../components/auth/withAuth';
import AddSymptomForm from '../../components/symptoms/AddSymptomForm';
import SymptomList from '../../components/symptoms/SymptomList';
import SymptomEntryForm from '../../components/symptoms/SymptomEntryForm';
import SymptomChart from '../../components/symptoms/SymptomChart';
import MessageDialog from '@/components/ui/MessageDialog';
import type { MessageType } from '@/types/ui';
import type { UserSymptom, SymptomEntry } from '@/types/symptom';
import { getUserSymptoms, deleteUserSymptom, getSymptomEntries } from '@/lib/api';

function SymptomTrackerPage() {
  const [symptoms, setSymptoms] = useState<UserSymptom[]>([]);
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'add-symptom' | 'add-entry' | 'chart'>('overview');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MessageType>('info');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogLoadingMessage, setDialogLoadingMessage] = useState('');

  const showDialog = useCallback((type: MessageType, message: string, title?: string) => {
    setDialogType(type);
    setDialogMessage(message);
    setDialogTitle(title);
    setDialogLoading(false);
    setDialogOpen(true);
  }, []);

  const showLoadingDialog = useCallback((loadingMessage: string) => {
    setDialogLoadingMessage(loadingMessage);
    setDialogLoading(true);
    setDialogOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogOpen(false);
    setDialogLoading(false);
  }, []);

  const fetchSymptoms = useCallback(async () => {
    try {
      const response = await getUserSymptoms();
      setSymptoms(response.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch symptoms.';
      showDialog('error', msg);
    }
  }, [showDialog]);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await getSymptomEntries({ limit: 100 });
      setEntries(response.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch symptom entries.';
      showDialog('error', msg);
    }
  }, [showDialog]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSymptoms(), fetchEntries()]);
    setLoading(false);
  }, [fetchSymptoms, fetchEntries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSymptom = useCallback(async (id: string) => {
    showLoadingDialog('Deleting symptom...');
    try {
      await deleteUserSymptom(id);
      showDialog('success', 'Symptom deleted successfully.');
      fetchSymptoms();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete symptom.';
      showDialog('error', msg);
    }
  }, [showDialog, showLoadingDialog, fetchSymptoms]);

  const handleSymptomAdded = useCallback(() => {
    fetchSymptoms();
    setActiveTab('overview');
  }, [fetchSymptoms]);

  const handleEntryAdded = useCallback(() => {
    fetchEntries();
    setActiveTab('overview');
  }, [fetchEntries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center">
        <p>Loading symptom tracker...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6ECD9] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Symptom Tracker</h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('add-symptom')}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'add-symptom'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Add Symptom
          </button>
          <button
            onClick={() => setActiveTab('add-entry')}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'add-entry'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Log Entry
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              activeTab === 'chart'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chart View
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SymptomList
              symptoms={symptoms}
              onDelete={handleDeleteSymptom}
            />
            
            {entries.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Recent Entries</h2>
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {typeof entry.symptom === 'object' ? entry.symptom.name : 'Unknown'}
                        </span>
                        <span className="text-gray-600 ml-2">
                          - Severity: {entry.severity}/10
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()} at {entry.time}
                      </div>
                    </div>
                  ))}
                </div>
                {entries.length > 5 && (
                  <p className="text-sm text-gray-500 mt-3">
                    Showing 5 of {entries.length} entries
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-symptom' && (
          <AddSymptomForm
            onSymptomAdded={handleSymptomAdded}
            onShowDialog={showDialog}
            onShowLoadingDialog={showLoadingDialog}
          />
        )}

        {activeTab === 'add-entry' && (
          <SymptomEntryForm
            symptoms={symptoms}
            onEntryAdded={handleEntryAdded}
            onShowDialog={showDialog}
            onShowLoadingDialog={showLoadingDialog}
          />
        )}

        {activeTab === 'chart' && (
          <SymptomChart entries={entries} symptoms={symptoms} />
        )}
      </div>

      <MessageDialog
        open={dialogOpen}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={hideDialog}
        loading={dialogLoading}
        loadingMessage={dialogLoadingMessage}
      />
    </div>
  );
}

export default withAuth(SymptomTrackerPage);
