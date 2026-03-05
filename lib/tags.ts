const TAG_STORAGE_KEY = 'stash_user_tag';

/** Validates a user tag: must be 3-20 alphanumeric/underscore characters */
export function isValidTag(tag: string): boolean {
  const cleaned = tag.startsWith('@') ? tag.slice(1) : tag;
  return /^[a-zA-Z0-9_]{3,20}$/.test(cleaned);
}

/** Normalize tag to always include @ prefix */
export function normalizeTag(tag: string): string {
  const cleaned = tag.startsWith('@') ? tag.slice(1) : tag;
  return `@${cleaned}`;
}

/** Get stored tag for a user address */
export function getTag(address?: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = address ? `${TAG_STORAGE_KEY}_${address}` : TAG_STORAGE_KEY;
  return localStorage.getItem(key);
}

/** Save tag for a user address */
export function setTag(tag: string, address?: string): boolean {
  if (!isValidTag(tag)) return false;
  if (typeof window === 'undefined') return false;
  const key = address ? `${TAG_STORAGE_KEY}_${address}` : TAG_STORAGE_KEY;
  localStorage.setItem(key, normalizeTag(tag));
  return true;
}

/** Remove tag for a user address */
export function removeTag(address?: string): void {
  if (typeof window === 'undefined') return;
  const key = address ? `${TAG_STORAGE_KEY}_${address}` : TAG_STORAGE_KEY;
  localStorage.removeItem(key);
}
