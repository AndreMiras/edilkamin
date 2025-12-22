import { Capacitor } from "@capacitor/core";

/**
 * Returns true if running inside a native app (Android/iOS)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns true if running in web browser
 */
export const isWebPlatform = (): boolean => {
  return !Capacitor.isNativePlatform();
};

/**
 * Returns the current platform: 'android', 'ios', or 'web'
 */
export const getPlatform = (): "android" | "ios" | "web" => {
  return Capacitor.getPlatform() as "android" | "ios" | "web";
};
