const fireplaceRegex = /[0-9A-Fa-f]{12}/g;

const isValidFireplace = (fireplace: string) => fireplaceRegex.test(fireplace);

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
  removeTokenLocalStorage,
  setTokenLocalStorage,
};
