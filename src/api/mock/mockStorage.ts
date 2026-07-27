const mockStoragePrefix = 'hellome.mock';

function getStorageKey(key: string) {
  return `${mockStoragePrefix}.${key}`;
}

export function readMockStorageValue<T>(key: string, fallbackValue: T): T {
  if (typeof window === 'undefined') return fallbackValue;

  const storedValue = window.localStorage.getItem(getStorageKey(key));

  if (storedValue === null) return fallbackValue;

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallbackValue;
  }
}

export function writeMockStorageValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(getStorageKey(key), JSON.stringify(value));
}

export function removeMockStorageValue(key: string) {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(getStorageKey(key));
}

export function getMockUserStorageKey(userId: string, key: string) {
  return `users.${userId}.${key}`;
}
