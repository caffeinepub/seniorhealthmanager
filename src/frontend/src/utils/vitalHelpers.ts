import { VitalType } from "../backend.d";

export const VITAL_LABELS: Record<VitalType, string> = {
  [VitalType.bloodPressure]: "Blood Pressure",
  [VitalType.heartRate]: "Heart Rate",
  [VitalType.bloodGlucose]: "Blood Glucose",
  [VitalType.weight]: "Weight",
  [VitalType.temperature]: "Temperature",
  [VitalType.SpO2]: "Oxygen (SpO2)",
};

export const VITAL_UNITS: Record<VitalType, string> = {
  [VitalType.bloodPressure]: "mmHg",
  [VitalType.heartRate]: "bpm",
  [VitalType.bloodGlucose]: "mg/dL",
  [VitalType.weight]: "lbs",
  [VitalType.temperature]: "°F",
  [VitalType.SpO2]: "%",
};

export const VITAL_COLORS: Record<VitalType, string> = {
  [VitalType.bloodPressure]: "oklch(0.52 0.18 10)",
  [VitalType.heartRate]: "oklch(0.58 0.22 25)",
  [VitalType.bloodGlucose]: "oklch(0.65 0.18 70)",
  [VitalType.weight]: "oklch(0.55 0.16 155)",
  [VitalType.temperature]: "oklch(0.62 0.20 40)",
  [VitalType.SpO2]: "oklch(0.52 0.13 195)",
};

export const VITAL_BG_COLORS: Record<VitalType, string> = {
  [VitalType.bloodPressure]: "oklch(0.95 0.04 10)",
  [VitalType.heartRate]: "oklch(0.96 0.04 25)",
  [VitalType.bloodGlucose]: "oklch(0.96 0.04 70)",
  [VitalType.weight]: "oklch(0.95 0.04 155)",
  [VitalType.temperature]: "oklch(0.96 0.04 40)",
  [VitalType.SpO2]: "oklch(0.95 0.04 195)",
};

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function nowTimestamp(): bigint {
  return BigInt(Date.now()) * BigInt(1_000_000);
}

export function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function timestampToDateStr(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split("T")[0];
}
