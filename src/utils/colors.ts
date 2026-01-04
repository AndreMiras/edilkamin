/**
 * Centralized color definitions for the application.
 * Provides both Tailwind CSS classes and hex values for flexibility.
 *
 * Usage:
 * - Use Tailwind classes (bg, text, border, etc.) for className props
 * - Use hex values for inline styles or chart libraries
 */

// Tailwind color mappings (for reference)
// emerald-600: #059669
// emerald-500: #10b981
// orange-500: #f97316
// orange-400: #fb923c
// orange-600: #ea580c
// gray-700: #374151
// zinc-600: #52525b
// green-500: #22c55e
// red-500: #ef4444
// amber-400: #fbbf24
// amber-500: #f59e0b

export const COLORS = {
  /**
   * Schedule mode colors (economy, comfort, off)
   */
  modes: {
    economy: {
      bg: "bg-emerald-600",
      bgHover: "hover:bg-emerald-500",
      text: "text-emerald-600",
      border: "border-emerald-600",
      ring: "ring-emerald-600",
      hex: "#059669",
    },
    comfort: {
      bg: "bg-orange-500",
      bgHover: "hover:bg-orange-400",
      text: "text-orange-500",
      border: "border-orange-500",
      ring: "ring-orange-500",
      hex: "#f97316",
    },
    off: {
      bg: "bg-gray-700",
      bgHover: "hover:bg-gray-600",
      text: "text-gray-700",
      border: "border-gray-700",
      ring: "ring-gray-700",
      hex: "#374151",
    },
  },

  /**
   * Accent/primary action colors (toggles, buttons, active states)
   */
  accent: {
    primary: {
      bg: "bg-orange-500",
      bgHover: "hover:bg-orange-600",
      bgInactive: "bg-zinc-600",
      text: "text-orange-500",
      border: "border-orange-500",
      ring: "ring-orange-500",
      shadow: "shadow-orange-500/20",
      hex: "#f97316",
      hexHover: "#ea580c",
    },
  },

  /**
   * Status indicator colors
   */
  status: {
    success: {
      bg: "bg-green-500",
      bgSubtle: "bg-green-500/10",
      text: "text-green-500",
      textLight: "text-green-700",
      textDark: "dark:text-green-400",
      hex: "#22c55e",
    },
    error: {
      bg: "bg-red-500",
      bgSubtle: "bg-red-500/10",
      text: "text-red-500",
      hex: "#ef4444",
    },
    warning: {
      bg: "bg-amber-500",
      bgLight: "bg-amber-100",
      bgDark: "dark:bg-amber-900/30",
      text: "text-amber-500",
      textLight: "text-amber-800",
      textLightAlt: "text-amber-700",
      textDark: "dark:text-amber-200",
      textDarkAlt: "dark:text-amber-300",
      border: "border-amber-300",
      borderDark: "dark:border-amber-700",
      hex: "#f59e0b",
    },
  },

  /**
   * Control hover colors (temperature/power +/- buttons)
   */
  controls: {
    hover: {
      bg: "hover:bg-orange-500",
      text: "hover:text-white",
      hex: "#f97316",
    },
  },

  /**
   * Chart colors for power distribution visualization
   * Uses heat-based sequential scheme: yellow → amber → orange → dark orange → red
   * Communicates increasing power/heat intensity from P1 (lowest) to P5 (highest)
   */
  chart: {
    palette: ["#fbbf24", "#f59e0b", "#f97316", "#ea580c", "#ef4444"] as const,
    // Named colors for power levels (low to high heat)
    p1: "#fbbf24", // amber-400 - lowest power (warm yellow)
    p2: "#f59e0b", // amber-500 - low-medium power
    p3: "#f97316", // orange-500 - medium power
    p4: "#ea580c", // orange-600 - medium-high power
    p5: "#ef4444", // red-500 - highest power (hot red)
  },
} as const;

/**
 * Type helpers for color categories
 */
export type ScheduleMode = keyof typeof COLORS.modes;
export type StatusType = keyof typeof COLORS.status;

/**
 * Helper to get mode color config
 */
export const getModeColors = (mode: ScheduleMode) => COLORS.modes[mode];

/**
 * Helper to get status color config
 */
export const getStatusColors = (status: StatusType) => COLORS.status[status];
