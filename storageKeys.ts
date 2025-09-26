// Storage key management for multi-user organization

// Organization ID - có thể config cho từng deploy khác nhau
const ORG_ID = 'bidv-default'; // Thay đổi này cho từng tổ chức

// Generate namespaced keys
export const getStorageKey = (baseKey: string): string => {
  return `${ORG_ID}_${baseKey}`;
};

// Standard keys
export const STORAGE_KEYS = {
  MEETINGS: getStorageKey('meetings'),
  PAST_MEETINGS: getStorageKey('past_meetings'),
  USED_PASSWORDS: getStorageKey('used_passwords'),
  USER_SESSION: getStorageKey('user_session'),
} as const;

// For multiple organizations, you can set different ORG_IDs:
// - 'bidv-hanoi' for BIDV Hanoi branch
// - 'bidv-hcm' for BIDV Ho Chi Minh branch  
// - 'company-abc' for different company
