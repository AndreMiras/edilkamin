/**
 * Mock DeviceInfoType factory for E2E tests.
 * Reuses the pattern from src/__tests__/pages/stove/[mac].test.tsx
 */

export interface MockDeviceInfoOptions {
  power?: boolean;
  temperature?: number;
  isAuto?: boolean;
  environmentTemp?: number;
  boardTemp?: number;
  pelletInReserve?: boolean;
  autonomyMinutes?: number;
  powerLevel?: number;
  fan1Speed?: number;
  fan2Speed?: number;
  fansNumber?: number;
  chronoEnabled?: boolean;
  easyTimerActive?: boolean;
  easyTimerMinutes?: number;
}

export function createMockDeviceInfo(
  options: MockDeviceInfoOptions = {},
): object {
  const {
    power = true,
    temperature = 22,
    isAuto = true,
    environmentTemp = 20,
    boardTemp = 35,
    pelletInReserve = false,
    autonomyMinutes = 900,
    powerLevel = 3,
    fan1Speed = 3,
    fan2Speed = 2,
    fansNumber = 2,
    chronoEnabled = true,
    easyTimerActive = false,
    easyTimerMinutes = 0,
  } = options;

  return {
    status: {
      commands: {
        power,
      },
      temperatures: {
        board: boardTemp,
        enviroment: environmentTemp,
      },
      flags: {
        is_pellet_in_reserve: pelletInReserve,
        is_crono_active: chronoEnabled,
        is_easytimer_active: easyTimerActive,
      },
      pellet: {
        autonomy_time: autonomyMinutes,
      },
      easytimer: {
        time: easyTimerMinutes,
      },
    },
    nvm: {
      chrono: {
        comfort_temperature: 22,
        economy_temperature: 18,
        temperature_ranges: Array.from({ length: 336 }, (_, index) =>
          index % 48 >= 12 && index % 48 < 20 ? 2 : 1,
        ),
      },
      user_parameters: {
        enviroment_1_temperature: temperature,
        enviroment_2_temperature: 18,
        enviroment_3_temperature: 16,
        is_auto: isAuto,
        is_sound_active: true,
        manual_power: powerLevel,
        fan_1_ventilation: fan1Speed,
        fan_2_ventilation: fan2Speed,
        fan_3_ventilation: 0,
      },
      installer_parameters: {
        fans_number: fansNumber,
      },
      oem_parameters: {
        fan_1_max_level: 4,
        fan_2_max_level: 5,
      },
    },
  };
}

/**
 * Creates a device info response for stove that is powered off
 */
export function createPoweredOffDeviceInfo(): object {
  return createMockDeviceInfo({ power: false });
}

/**
 * Creates a device info response with low pellet warning
 */
export function createLowPelletDeviceInfo(): object {
  return createMockDeviceInfo({
    pelletInReserve: true,
    autonomyMinutes: 30,
  });
}
