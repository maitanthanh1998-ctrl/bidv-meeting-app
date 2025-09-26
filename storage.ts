// Cross-platform storage utility
// - On web: uses cloud storage (Netlify Functions) for multi-user persistence
// - Fallback to localStorage and memory store

interface StorageData {
  [key: string]: string;
}

const memoryStore: StorageData = {};

const isWeb = typeof window !== 'undefined';
const hasLocalStorage = isWeb && typeof window.localStorage !== 'undefined';

// Get the current site URL for Netlify Functions
const getApiUrl = () => {
  if (isWeb) {
    const origin = window.location.origin;
    return `${origin}/.netlify/functions`;
  }
  return null;
};

// Cloud storage functions
const cloudSetItem = async (key: string, value: string): Promise<boolean> => {
  const apiUrl = getApiUrl();
  if (!apiUrl) return false;

  try {
    const response = await fetch(`${apiUrl}/storage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
        updatedAt: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.warn('Cloud storage set failed:', error);
    return false;
  }
};

const cloudGetItem = async (key: string): Promise<string | null> => {
  const apiUrl = getApiUrl();
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/storage/${encodeURIComponent(key)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.warn('Cloud storage get failed:', error);
    return null;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  // Try cloud storage first
  if (isWeb) {
    const cloudSuccess = await cloudSetItem(key, value);
    if (cloudSuccess) {
      console.log('Data saved to cloud storage:', key);
    }
  }

  // Always save to localStorage as backup
  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Fallback to memory if quota or other errors
    }
  }
  memoryStore[key] = value;
};

export const getItem = async (key: string): Promise<string | null> => {
  // Try cloud storage first
  if (isWeb) {
    const cloudValue = await cloudGetItem(key);
    if (cloudValue !== null) {
      console.log('Data loaded from cloud storage:', key);
      // Update localStorage with cloud data
      if (hasLocalStorage) {
        try {
          window.localStorage.setItem(key, cloudValue);
        } catch {}
      }
      return cloudValue;
    }
  }

  // Fallback to localStorage
  if (hasLocalStorage) {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null) return v;
    } catch {
      // ignore and fallback
    }
  }
  return memoryStore[key] || null;
};

export const removeItem = async (key: string): Promise<void> => {
  // Try cloud storage first
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try {
      await fetch(`${apiUrl}/storage/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Cloud storage delete failed:', error);
    }
  }

  // Remove from localStorage
  if (hasLocalStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  delete memoryStore[key];
};

export const clear = async (): Promise<void> => {
  // Clear localStorage and memory
  if (hasLocalStorage) {
    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }
  }
  Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
  
  // Note: We don't clear cloud storage to preserve data for other users
};