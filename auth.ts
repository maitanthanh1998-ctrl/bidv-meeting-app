import { setItem, getItem, removeItem } from './storage';

const CREDENTIALS = {
  username: 'bidvlendinghub@2025',
  password: '123456',
};

const AUTH_KEY = 'bidv_auth_session';

export const authenticate = async (username: string, password: string): Promise<boolean> => {
  return username === CREDENTIALS.username && password === CREDENTIALS.password;
};

export const saveAuthSession = async (rememberMe: boolean): Promise<void> => {
  const session = {
    id: Date.now().toString(),
    rememberMe,
    timestamp: new Date().toISOString(),
  };
  await setItem(AUTH_KEY, JSON.stringify(session));
};

export const getAuthSession = async (): Promise<any | null> => {
  try {
    const session = await getItem(AUTH_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const clearAuthSession = async (): Promise<void> => {
  await removeItem(AUTH_KEY);
};