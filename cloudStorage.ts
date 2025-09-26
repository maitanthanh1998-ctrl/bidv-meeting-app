// Cloud storage utility for multi-user data persistence
// Uses a simple JSON backend service

const API_BASE = 'https://bidv-meeting-db.vercel.app/api'; // Placeholder URL

interface CloudStorageData {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

// Fallback to localStorage if cloud storage fails
const fallbackToLocal = async (key: string, operation: 'get' | 'set', value?: string) => {
  const { getItem, setItem } = await import('./storage');
  if (operation === 'get') {
    return await getItem(key);
  } else if (operation === 'set' && value) {
    await setItem(key, value);
  }
};

export const cloudSetItem = async (key: string, value: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/storage`, {
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('Cloud storage failed, falling back to localStorage:', error);
    await fallbackToLocal(key, 'set', value);
  }
};

export const cloudGetItem = async (key: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/storage/${encodeURIComponent(key)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CloudStorageData = await response.json();
    return data.value;
  } catch (error) {
    console.warn('Cloud storage failed, falling back to localStorage:', error);
    return await fallbackToLocal(key, 'get');
  }
};

export const cloudRemoveItem = async (key: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/storage/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('Cloud storage delete failed:', error);
    // Don't fallback to localStorage for delete as it might be inconsistent
  }
};
