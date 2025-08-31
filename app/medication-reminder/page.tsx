"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

// import ui components
import MessageDialog from '@/components/ui/MessageDialog';
import type { MessageType } from '@/types/ui';

// import api functions
import { getMedications, deleteMedication, updateMedication } from '@/lib/api';
import type { ReminderRecord } from '@/types/reminder';

// import custom components
import MedicationList from '@/components/medications/MedicationList';
import EditMedicationModal from '@/components/medications/EditMedicationModal';
import AddMedicationForm from '@/components/medications/AddMedicationForm';
import withAuth from '@/components/auth/withAuth';


function MedicationReminderPage() {
  const [medications, setMedications] = useState<ReminderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MessageType>('info');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [editingMedication, setEditingMedication] = useState<ReminderRecord | null>(null);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = (await getMedications()) as { success: boolean; data: ReminderRecord[] };
      setMedications(res.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const showDialog = useCallback((type: MessageType, message: string, title?: string) => {
    setDialogType(type);
    setDialogMessage(message);
    setDialogTitle(title);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMedication(id);
      showDialog('success', 'Medication reminder deleted.');
      fetchMedications();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete reminder.';
      showDialog('error', msg);
    }
  }, [showDialog, fetchMedications]);

  const handleEdit = useCallback((medication: ReminderRecord) => {
    setEditingMedication(medication);
  }, []);

  const handleUpdate = useCallback(async (updatedData: Partial<ReminderRecord>) => {
    if (!editingMedication) return;
    try {
      await updateMedication(editingMedication._id, updatedData);
      showDialog('success', 'Medication reminder updated.');
      setEditingMedication(null);
      fetchMedications();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update reminder.';
      showDialog('error', msg);
    }
  }, [editingMedication, showDialog, fetchMedications]);

  if (loading) return <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center"><p>Loading medications...</p></div>;
  if (error) return <div className="min-h-screen bg-[#F6ECD9] flex items-center justify-center"><p className="text-red-500">Error: {error}</p></div>;
  
  return (
    <div className="min-h-screen bg-[#F6ECD9] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Medication Reminders</h1>
        <AddMedicationForm 
          onMedicationAdded={fetchMedications} 
          onSuccess={(m) => showDialog('success', m)}
          onError={(m) => showDialog('error', m)}
        />
        <MedicationList 
          medications={medications} 
          onDelete={handleDelete} 
          onEdit={handleEdit} 
        />
      </div>
      <EditMedicationModal
        medication={editingMedication}
        isOpen={!!editingMedication}
        onClose={() => setEditingMedication(null)}
        onUpdate={handleUpdate}
      />
      <MessageDialog 
        open={dialogOpen}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

export default withAuth(MedicationReminderPage);

