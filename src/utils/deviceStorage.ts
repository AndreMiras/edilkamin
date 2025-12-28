export interface StoredDevice {
  wifiMac: string;
  bleMac?: string;
  name?: string;
}

const OLD_STORAGE_KEY = "fireplaces";
const NEW_STORAGE_KEY = "fireplaces-v2";

/**
 * Get devices from localStorage, migrating from old format if needed.
 */
export const getStoredDevices = (): StoredDevice[] => {
  // Check for new format first
  const newData = localStorage.getItem(NEW_STORAGE_KEY);
  if (newData) {
    try {
      return JSON.parse(newData);
    } catch {
      return [];
    }
  }

  // Migrate from old format
  const oldData = localStorage.getItem(OLD_STORAGE_KEY);
  if (oldData) {
    try {
      const oldDevices: string[] = JSON.parse(oldData);
      const migratedDevices: StoredDevice[] = oldDevices.map((mac) => ({
        wifiMac: mac,
      }));
      // Save in new format
      setStoredDevices(migratedDevices);
      // Remove old format
      localStorage.removeItem(OLD_STORAGE_KEY);
      return migratedDevices;
    } catch {
      return [];
    }
  }

  return [];
};

/**
 * Save devices to localStorage.
 */
export const setStoredDevices = (devices: StoredDevice[]): void => {
  localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(devices));
};

/**
 * Add a device to storage.
 */
export const addStoredDevice = (device: StoredDevice): StoredDevice[] => {
  const devices = getStoredDevices();
  // Check for duplicate WiFi MAC
  if (devices.some((d) => d.wifiMac === device.wifiMac)) {
    return devices;
  }
  const newDevices = [...devices, device];
  setStoredDevices(newDevices);
  return newDevices;
};

/**
 * Remove a device from storage by index.
 */
export const removeStoredDevice = (index: number): StoredDevice[] => {
  const devices = getStoredDevices();
  const newDevices = devices.filter((_, i) => i !== index);
  setStoredDevices(newDevices);
  return newDevices;
};

/**
 * Update a device's BLE MAC.
 */
export const updateDeviceBleMac = (
  wifiMac: string,
  bleMac: string,
): StoredDevice[] => {
  const devices = getStoredDevices();
  const newDevices = devices.map((d) =>
    d.wifiMac === wifiMac ? { ...d, bleMac } : d,
  );
  setStoredDevices(newDevices);
  return newDevices;
};

/**
 * Get a device by WiFi MAC.
 */
export const getDeviceByWifiMac = (
  wifiMac: string,
): StoredDevice | undefined => {
  return getStoredDevices().find((d) => d.wifiMac === wifiMac);
};
