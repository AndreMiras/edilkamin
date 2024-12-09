import {useEffect, useState} from 'react';
import {DeviceInfoType} from 'edilkamin';

const deviceInfosStorageKey = 'edilkamin-device-infos';

// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses on the Android app
// then it gets stored to a local database.
// In our case fireplaces are added by the user and stored to the localStorage.
const fireplacesStorageKey = 'edilkamin-fireplaces';

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
    return useLocalStorage<DeviceInfoType | null>(deviceInfosStorageKey, null);
}

export function useFireplaces() {
    return useLocalStorage<string[] | null>(fireplacesStorageKey, null);
}
