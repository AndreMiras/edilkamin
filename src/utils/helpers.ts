const fireplaceRegex = /^((([a-f0-9]{2}:){5})|(([a-f0-9]{2}-){5}))[a-f0-9]{2}$/ig;

const isValidFireplace = (fireplace: string) => fireplaceRegex.test(fireplace);

const tokenLocalStorageKey = 'edilkamin-token';

const getTokenLocalStorage = (): string | null =>
    localStorage?.getItem(tokenLocalStorageKey);

const setTokenLocalStorage = (token: string): void =>
    localStorage?.setItem(tokenLocalStorageKey, token);

export {
    isValidFireplace,
    getTokenLocalStorage,
    setTokenLocalStorage,
};
