export type SymptomCategory = 'pain' | 'digestive' | 'respiratory' | 'neurological' | 'skin' | 'mental_health' | 'other';

export interface UserSymptom {
  _id: string;
  user: string;
  name: string;
  description?: string;
  category: SymptomCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomEntry {
  _id: string;
  user: string;
  symptom: string | UserSymptom;
  date: string;
  time: string;
  severity: number;
  notes?: string;
  triggers?: string[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserSymptomData {
  name: string;
  description?: string;
  category: SymptomCategory;
}

export interface CreateSymptomEntryData {
  symptom: string;
  date: string;
  time: string;
  severity: number;
  notes?: string;
  triggers?: string[];
  duration?: string;
}

export interface SymptomTrackerProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export interface AddSymptomFormProps {
  onSymptomAdded: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface SymptomEntryFormProps {
  symptoms: UserSymptom[];
  onEntryAdded: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface SymptomChartProps {
  entries: SymptomEntry[];
  symptoms: UserSymptom[];
}
