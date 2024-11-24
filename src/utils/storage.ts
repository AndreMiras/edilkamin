import {useEffect, useState} from 'react';
import {DeviceInfoType} from 'edilkamin';

const deviceInfosStorageKey = 'edilkamin-device-infos';

export function useLocalStorage<T>(key: string, fallbackValue: T) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        setValue(stored ? JSON.parse(stored) : fallbackValue);
    }, [fallbackValue, key]);

    useEffect(() => {
        if (value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);

    return [value, setValue] as const;
}

export function useDeviceInfos() {
    return useLocalStorage<DeviceInfoType|null>(deviceInfosStorageKey, null);
}
