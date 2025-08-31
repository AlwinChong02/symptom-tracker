import type { ReminderRecord } from './reminder';

export interface EditMedicationModalProps {
  medication: ReminderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: Partial<ReminderRecord>) => void;
}

export interface AddMedicationFormProps {
  onMedicationAdded: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface MedicationListProps {
  medications: ReminderRecord[];
  onEdit?: (med: ReminderRecord) => void;
  onDelete?: (id: string) => void;
}
