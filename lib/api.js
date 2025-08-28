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
  return fetcher('/api/medications');
};

export const addMedication = (medicationData) => {
  return fetcher('/api/medications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicationData),
  });
};

export const updateMedication = (id, medicationData) => {
  return fetcher(`/api/medications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicationData),
  });
};

export const deleteMedication = (id) => {
  return fetcher(`/api/medications/${id}`, {
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
