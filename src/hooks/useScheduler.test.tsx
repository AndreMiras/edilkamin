import { renderHook, waitFor } from "@testing-library/react";
import type { DeviceInfoType } from "edilkamin";
import { configure, NEW_API_URL, OLD_API_URL } from "edilkamin";
import { act, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ChronoSettings,
  EasyTimerSettings,
  ScheduleValue,
} from "@/components/scheduler/types";
import { ErrorContext } from "@/context/error";
import { TokenContext } from "@/context/token";
import i18n from "@/i18n";

import { useScheduler } from "./useScheduler";

type Retry = (
  token: string,
  call: (currentToken: string) => Promise<unknown>,
) => Promise<unknown>;

const mocks = vi.hoisted(() => ({
  addError: vi.fn(),
  configure: vi.fn(),
  createEmptySchedule: vi.fn(() => new Array(336).fill(0)),
  deriveChronoMode: vi.fn(),
  deriveEasyTimer: vi.fn(),
  deviceInfo: vi.fn(),
  isNativePlatform: vi.fn(),
  setChronoComfortTemperature: vi.fn(),
  setChronoEconomyTemperature: vi.fn(),
  setChronoMode: vi.fn(),
  setChronoTemperatureRanges: vi.fn(),
  setEasyTimer: vi.fn(),
  setToken: vi.fn(),
  withRetry: vi.fn<Retry>(),
}));

vi.mock("edilkamin", () => ({
  configure: mocks.configure,
  createEmptySchedule: mocks.createEmptySchedule,
  deriveChronoMode: mocks.deriveChronoMode,
  deriveEasyTimer: mocks.deriveEasyTimer,
  NEW_API_URL: "https://new-api.example/",
  OLD_API_URL: "https://old-api.example/",
}));

vi.mock("@/utils/hooks", () => ({
  useTokenRefresh: () => ({ withRetry: mocks.withRetry }),
}));

vi.mock("@/utils/platform", () => ({
  isNativePlatform: mocks.isNativePlatform,
}));

const TOKEN = "test-token";
const MAC_ADDRESS = "ABC123456789";
const completeSchedule = Array.from(
  { length: 336 },
  (_, index) => (index % 3) as ScheduleValue,
);

const api = {
  deviceInfo: mocks.deviceInfo,
  setChronoMode: mocks.setChronoMode,
  setChronoComfortTemperature: mocks.setChronoComfortTemperature,
  setChronoEconomyTemperature: mocks.setChronoEconomyTemperature,
  setChronoTemperatureRanges: mocks.setChronoTemperatureRanges,
  setEasyTimer: mocks.setEasyTimer,
};

function createDeviceInfo(
  chrono: Partial<{
    comfort_temperature: number;
    economy_temperature: number;
    temperature_ranges: number[];
  }> = {
    comfort_temperature: 24,
    economy_temperature: 17,
    temperature_ranges: completeSchedule,
  },
): DeviceInfoType {
  return {
    nvm: { chrono },
  } as unknown as DeviceInfoType;
}

function createWrapper(token: string | null | undefined = TOKEN) {
  return function SchedulerWrapper({ children }: { children: ReactNode }) {
    return (
      <I18nextProvider i18n={i18n}>
        <TokenContext.Provider value={{ token, setToken: mocks.setToken }}>
          <ErrorContext.Provider
            value={{
              errors: [],
              setErrors: vi.fn(),
              addError: mocks.addError,
            }}
          >
            {children}
          </ErrorContext.Provider>
        </TokenContext.Provider>
      </I18nextProvider>
    );
  };
}

async function renderLoadedScheduler(
  options: { macAddress?: string; refreshInterval?: number } = {},
) {
  const rendered = renderHook(
    () =>
      useScheduler({
        macAddress: options.macAddress ?? MAC_ADDRESS,
        refreshInterval: options.refreshInterval ?? 0,
      }),
    { wrapper: createWrapper() },
  );

  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
}

function clearSaveMocks() {
  mocks.withRetry.mockClear();
  mocks.deviceInfo.mockClear();
  mocks.setChronoMode.mockClear();
  mocks.setChronoComfortTemperature.mockClear();
  mocks.setChronoEconomyTemperature.mockClear();
  mocks.setChronoTemperatureRanges.mockClear();
  mocks.setEasyTimer.mockClear();
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useScheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_USE_LEGACY_API;
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    mocks.isNativePlatform.mockReturnValue(false);
    mocks.configure.mockReturnValue(api);
    mocks.deriveChronoMode.mockReturnValue(true);
    mocks.deriveEasyTimer.mockReturnValue({ active: true, time: 90 });
    mocks.deviceInfo.mockResolvedValue(createDeviceInfo());
    mocks.setChronoMode.mockResolvedValue(undefined);
    mocks.setChronoComfortTemperature.mockResolvedValue(undefined);
    mocks.setChronoEconomyTemperature.mockResolvedValue(undefined);
    mocks.setChronoTemperatureRanges.mockResolvedValue(undefined);
    mocks.setEasyTimer.mockResolvedValue(undefined);
    mocks.withRetry.mockImplementation(async (token, call) => call(token));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_USE_LEGACY_API;
  });

  describe("fetching", () => {
    it("fetches and maps the complete scheduler state", async () => {
      const { result } = renderHook(
        () => useScheduler({ macAddress: MAC_ADDRESS, refreshInterval: 0 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const expectedChrono: ChronoSettings = {
        enabled: true,
        comfortTemperature: 24,
        economyTemperature: 17,
        schedule: completeSchedule,
      };
      const expectedTimer: EasyTimerSettings = { active: true, time: 90 };

      expect(configure).toHaveBeenCalledWith("/api/proxy/");
      expect(mocks.withRetry).toHaveBeenCalledWith(TOKEN, expect.any(Function));
      expect(mocks.deviceInfo).toHaveBeenCalledWith(TOKEN, MAC_ADDRESS);
      expect(result.current.serverChronoSettings).toEqual(expectedChrono);
      expect(result.current.chronoSettings).toEqual(expectedChrono);
      expect(result.current.serverEasyTimer).toEqual(expectedTimer);
      expect(result.current.easyTimer).toEqual(expectedTimer);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("uses defaults when chrono fields are missing", async () => {
      mocks.deriveChronoMode.mockReturnValue(false);
      mocks.deriveEasyTimer.mockReturnValue({ active: false, time: 0 });
      mocks.deviceInfo.mockResolvedValue(createDeviceInfo({}));

      const { result } = await renderLoadedScheduler();

      expect(result.current.chronoSettings).toEqual({
        enabled: false,
        comfortTemperature: 22,
        economyTemperature: 18,
        schedule: new Array(336).fill(0),
      });
      expect(result.current.easyTimer).toEqual({ active: false, time: 0 });
      expect(mocks.createEmptySchedule).toHaveBeenCalled();
    });

    it.each([
      ["a missing token", null, MAC_ADDRESS],
      ["an empty MAC address", TOKEN, ""],
    ])("does not fetch or poll with %s", async (_, token, macAddress) => {
      const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

      renderHook(() => useScheduler({ macAddress, refreshInterval: 1000 }), {
        wrapper: createWrapper(token),
      });
      await flushPromises();

      expect(mocks.deviceInfo).not.toHaveBeenCalled();
      expect(mocks.withRetry).not.toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe("local edits", () => {
    it.each([
      ["enabled state", { enabled: false }],
      ["comfort temperature", { comfortTemperature: 25 }],
      ["economy temperature", { economyTemperature: 16 }],
    ])("marks a changed %s as unsaved", async (_, change) => {
      const { result } = await renderLoadedScheduler();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          ...change,
        });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("marks a changed schedule slot as unsaved without changing server state", async () => {
      const { result } = await renderLoadedScheduler();
      const serverSchedule = [...result.current.serverChronoSettings.schedule];
      const changedSchedule = [...result.current.chronoSettings.schedule];
      changedSchedule[42] = changedSchedule[42] === 2 ? 1 : 2;

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          schedule: changedSchedule,
        });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(result.current.serverChronoSettings.schedule).toEqual(
        serverSchedule,
      );
    });

    it("marks easy timer activity and time changes as unsaved", async () => {
      const { result } = await renderLoadedScheduler();

      act(() => {
        result.current.setEasyTimer({ active: false, time: 120 });
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("compares replacement objects and schedules by value", async () => {
      const { result } = await renderLoadedScheduler();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          schedule: [...result.current.chronoSettings.schedule],
        });
        result.current.setEasyTimer({ ...result.current.easyTimer });
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("discards both pending settings back to server state", async () => {
      const { result } = await renderLoadedScheduler();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          enabled: false,
        });
        result.current.setEasyTimer({ active: false, time: 0 });
      });
      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => result.current.discard());

      expect(result.current.chronoSettings).toEqual(
        result.current.serverChronoSettings,
      );
      expect(result.current.easyTimer).toEqual(result.current.serverEasyTimer);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe("saving", () => {
    it("saves only a changed chrono mode through withRetry", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          enabled: false,
        });
      });
      await act(() => result.current.save());

      expect(mocks.withRetry).toHaveBeenCalledWith(TOKEN, expect.any(Function));
      expect(mocks.setChronoMode).toHaveBeenCalledWith(
        TOKEN,
        MAC_ADDRESS,
        false,
      );
      expect(mocks.setChronoComfortTemperature).not.toHaveBeenCalled();
      expect(mocks.setChronoEconomyTemperature).not.toHaveBeenCalled();
      expect(mocks.setChronoTemperatureRanges).not.toHaveBeenCalled();
      expect(mocks.setEasyTimer).not.toHaveBeenCalled();
    });

    it("saves only a changed comfort temperature", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          comfortTemperature: 25,
        });
      });
      await act(() => result.current.save());

      expect(mocks.setChronoComfortTemperature).toHaveBeenCalledWith(
        TOKEN,
        MAC_ADDRESS,
        25,
      );
      expect(mocks.setChronoMode).not.toHaveBeenCalled();
      expect(mocks.setChronoEconomyTemperature).not.toHaveBeenCalled();
      expect(mocks.setChronoTemperatureRanges).not.toHaveBeenCalled();
    });

    it("saves only a changed economy temperature", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          economyTemperature: 16,
        });
      });
      await act(() => result.current.save());

      expect(mocks.setChronoEconomyTemperature).toHaveBeenCalledWith(
        TOKEN,
        MAC_ADDRESS,
        16,
      );
      expect(mocks.setChronoMode).not.toHaveBeenCalled();
      expect(mocks.setChronoComfortTemperature).not.toHaveBeenCalled();
      expect(mocks.setChronoTemperatureRanges).not.toHaveBeenCalled();
    });

    it("sends all 336 values when one schedule slot changes", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();
      const schedule = [...result.current.chronoSettings.schedule];
      schedule[100] = schedule[100] === 2 ? 1 : 2;

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          schedule,
        });
      });
      await act(() => result.current.save());

      expect(mocks.setChronoTemperatureRanges).toHaveBeenCalledOnce();
      expect(mocks.setChronoTemperatureRanges).toHaveBeenCalledWith(
        TOKEN,
        MAC_ADDRESS,
        schedule,
      );
      expect(mocks.setChronoTemperatureRanges.mock.calls[0][2]).toHaveLength(
        336,
      );
    });

    it("does not save a value-equivalent schedule or unchanged settings", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          schedule: [...result.current.chronoSettings.schedule],
        });
      });
      await act(() => result.current.save());

      expect(mocks.withRetry).not.toHaveBeenCalled();
      expect(mocks.setChronoTemperatureRanges).not.toHaveBeenCalled();
      expect(mocks.setEasyTimer).not.toHaveBeenCalled();
    });

    it("saves an active easy timer with its pending minute value", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => result.current.setEasyTimer({ active: true, time: 120 }));
      await act(() => result.current.save());

      expect(mocks.setEasyTimer).toHaveBeenCalledWith(TOKEN, MAC_ADDRESS, 120);
      expect(mocks.setChronoMode).not.toHaveBeenCalled();
    });

    it("saves zero minutes when disabling an active easy timer", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => result.current.setEasyTimer({ active: false, time: 90 }));
      await act(() => result.current.save());

      expect(mocks.setEasyTimer).toHaveBeenCalledWith(TOKEN, MAC_ADDRESS, 0);
    });

    it("exposes saving state while a device write is pending", async () => {
      let resolveWrite!: () => void;
      const pendingWrite = new Promise<void>((resolve) => {
        resolveWrite = resolve;
      });
      mocks.setChronoMode.mockReturnValueOnce(pendingWrite);
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          enabled: false,
        });
      });
      let savePromise!: Promise<void>;
      act(() => {
        savePromise = result.current.save();
      });

      expect(result.current.isSaving).toBe(true);
      await act(async () => {
        resolveWrite();
        await savePromise;
      });
      expect(result.current.isSaving).toBe(false);
    });

    it("promotes successful pending state without refetching", async () => {
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          comfortTemperature: 25,
        });
        result.current.setEasyTimer({ active: true, time: 120 });
      });
      await act(() => result.current.save());

      expect(result.current.serverChronoSettings.comfortTemperature).toBe(25);
      expect(result.current.serverEasyTimer).toEqual({
        active: true,
        time: 120,
      });
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(mocks.deviceInfo).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("reports an Error fetch rejection and clears loading", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mocks.deviceInfo.mockRejectedValue(new Error("Device unavailable"));

      const { result } = await renderLoadedScheduler();

      expect(result.current.isLoading).toBe(false);
      expect(mocks.addError).toHaveBeenCalledWith({
        title: "Failed to load schedule settings",
        body: "Device unavailable",
      });
      expect(consoleError).toHaveBeenCalled();
    });

    it("uses the translated fallback for a non-Error fetch rejection", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.deviceInfo.mockRejectedValue("offline");

      await renderLoadedScheduler();

      expect(mocks.addError).toHaveBeenCalledWith({
        title: "Failed to load schedule settings",
        body: "Failed to load schedule settings",
      });
    });

    it("reports a failed save and preserves pending edits", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = await renderLoadedScheduler();
      clearSaveMocks();
      mocks.setChronoMode.mockRejectedValueOnce(new Error("Write failed"));

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          enabled: false,
        });
      });
      await act(() => result.current.save());

      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(result.current.serverChronoSettings.enabled).toBe(true);
      expect(result.current.chronoSettings.enabled).toBe(false);
      expect(mocks.addError).toHaveBeenCalledWith({
        title: "Save Failed",
        body: "Unable to save the settings. Please try again.",
      });
      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe("polling", () => {
    it("refreshes visible, clean state at the configured interval", async () => {
      vi.useFakeTimers();
      renderHook(
        () => useScheduler({ macAddress: MAC_ADDRESS, refreshInterval: 1000 }),
        { wrapper: createWrapper() },
      );
      await flushPromises();
      expect(mocks.deviceInfo).toHaveBeenCalledTimes(1);

      await act(() => vi.advanceTimersByTimeAsync(1000));

      expect(mocks.deviceInfo).toHaveBeenCalledTimes(2);
    });

    it("does not refresh while the document is hidden", async () => {
      vi.useFakeTimers();
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      renderHook(
        () => useScheduler({ macAddress: MAC_ADDRESS, refreshInterval: 1000 }),
        { wrapper: createWrapper() },
      );
      await flushPromises();

      await act(() => vi.advanceTimersByTimeAsync(1000));

      expect(mocks.deviceInfo).toHaveBeenCalledTimes(1);
    });

    it("pauses for unsaved edits and resumes after discard", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(
        () => useScheduler({ macAddress: MAC_ADDRESS, refreshInterval: 1000 }),
        { wrapper: createWrapper() },
      );
      await flushPromises();

      act(() => {
        result.current.setChronoSettings({
          ...result.current.chronoSettings,
          enabled: false,
        });
      });
      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(mocks.deviceInfo).toHaveBeenCalledTimes(1);

      act(() => result.current.discard());
      await act(() => vi.advanceTimersByTimeAsync(1000));

      expect(mocks.deviceInfo).toHaveBeenCalledTimes(2);
    });

    it.each([0, -1])(
      "does not create an interval for %i milliseconds",
      (interval) => {
        const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

        renderHook(
          () =>
            useScheduler({
              macAddress: MAC_ADDRESS,
              refreshInterval: interval,
            }),
          { wrapper: createWrapper() },
        );

        expect(setIntervalSpy).not.toHaveBeenCalled();
      },
    );

    it("clears its active interval on unmount", () => {
      const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
      const { unmount } = renderHook(
        () => useScheduler({ macAddress: MAC_ADDRESS, refreshInterval: 1000 }),
        { wrapper: createWrapper() },
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalledOnce();
    });
  });

  describe("API configuration", () => {
    it.each([
      ["web", false, undefined, "/api/proxy/"],
      ["web with the legacy flag", false, "true", "/api/proxy/"],
      ["native legacy", true, "true", OLD_API_URL],
      ["native current", true, undefined, NEW_API_URL],
      ["native current with a false flag", true, "false", NEW_API_URL],
    ])("configures %s requests", (_, native, legacy, expectedUrl) => {
      mocks.isNativePlatform.mockReturnValue(native);
      if (legacy === undefined) {
        delete process.env.NEXT_PUBLIC_USE_LEGACY_API;
      } else {
        process.env.NEXT_PUBLIC_USE_LEGACY_API = legacy;
      }

      renderHook(() => useScheduler({ macAddress: "", refreshInterval: 0 }), {
        wrapper: createWrapper(),
      });

      expect(configure).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
