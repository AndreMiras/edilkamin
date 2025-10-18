// Accepts either format:
// - 12 hex chars: a8032afed508 or AABBCCDDEEFF
// - Colon-separated: a8:03:2a:fe:d5:08 or A8:03:2A:FE:D5:08
const fireplaceRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$/;

const isValidFireplace = (fireplace: string) => fireplaceRegex.test(fireplace);

const normalizeFireplace = (fireplace: string): string => {
  // Remove colons and convert to lowercase
  return fireplace.replace(/:/g, "").toLowerCase();
};

const tokenLocalStorageKey = "edilkamin-token";

const getTokenLocalStorage = (): string | null =>
  localStorage.getItem(tokenLocalStorageKey);

const setTokenLocalStorage = (token: string): void =>
  localStorage.setItem(tokenLocalStorageKey, token);

const removeTokenLocalStorage = (): void =>
  localStorage.removeItem(tokenLocalStorageKey);

export {
  getTokenLocalStorage,
  isValidFireplace,
  normalizeFireplace,
  removeTokenLocalStorage,
  setTokenLocalStorage,
};
