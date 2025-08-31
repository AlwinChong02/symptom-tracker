// A utility for making API requests throughout the application

async function fetcher(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred.' }));
    const error = new Error(errorData.message || 'API request failed');
    error.status = res.status;
    throw error;
  }

  return res.json();
}

// --- Medication API --- //

export const getMedications = () => {
  return fetcher('/api/medication-reminder');
};

export const addMedication = (medicationData) => {
  return fetcher('/api/medication-reminder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicationData),
  });
};

export const updateMedication = (id, medicationData) => {
  return fetcher(`/api/medication-reminder/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicationData),
  });
};

export const deleteMedication = (id) => {
  return fetcher(`/api/medication-reminder/${id}`, {
    method: 'DELETE',
  });
};

// --- Symptom Checker API --- //

export const getSymptomCheckResponse = (history, userId) => {
  return fetcher('http://127.0.0.1:5328/api/symptom-checker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history, userId }),
  });
}; 

// --- User Symptoms API --- //

export const getUserSymptoms = () => {
  return fetcher('/api/user-symptoms');
};

export const addUserSymptom = (symptomData) => {
  return fetcher('/api/user-symptoms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(symptomData),
  });
};

export const updateUserSymptom = (id, symptomData) => {
  return fetcher(`/api/user-symptoms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(symptomData),
  });
};

export const deleteUserSymptom = (id) => {
  return fetcher(`/api/user-symptoms/${id}`, {
    method: 'DELETE',
  });
};

// --- Symptom Entries API --- //

export const getSymptomEntries = (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.symptom) searchParams.append('symptom', params.symptom);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  
  const url = `/api/symptom-entries${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return fetcher(url);
};

export const addSymptomEntry = (entryData) => {
  return fetcher('/api/symptom-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  });
};

export const updateSymptomEntry = (id, entryData) => {
  return fetcher(`/api/symptom-entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  });
};

export const deleteSymptomEntry = (id) => {
  return fetcher(`/api/symptom-entries/${id}`, {
    method: 'DELETE',
  });
};
