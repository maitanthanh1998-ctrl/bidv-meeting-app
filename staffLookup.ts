import { STAFF_DATA } from '../data/staffData';
import { Staff } from '../types';

const isWeb = typeof window !== 'undefined' && typeof fetch !== 'undefined';
let remoteStaff: Staff[] | null = null;

// Eagerly start fetching staff.json on web, fallback remains STAFF_DATA
if (isWeb) {
  (async () => {
    try {
      const res = await fetch('/assets/data/staff.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) remoteStaff = data as Staff[];
      }
    } catch {}
  })();
}

const getList = (): Staff[] => {
  return (remoteStaff && remoteStaff.length > 0) ? remoteStaff : STAFF_DATA;
};

export const findStaffByCode = (staffCode: string): Staff | null => {
  const list = getList();
  return list.find(staff => staff.staff_code === staffCode) || null;
};

export const searchStaff = (query: string): Staff[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const list = getList();
  return list.filter(staff => 
    staff.staff_code.toLowerCase().includes(lowerQuery) ||
    staff.name.toLowerCase().includes(lowerQuery) ||
    staff.title.toLowerCase().includes(lowerQuery)
  );
};

export const getAllStaff = (): Staff[] => {
  return getList();
};