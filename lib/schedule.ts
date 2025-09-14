export type OpeningHours = {
  openHour: number; // 0-23 local
  closeHour: number; // 0-23 local
};

const DEFAULT_INTERVAL_MINUTES = 30;

// Simple opening hours by weekday (0=Sun..6=Sat)
const HOURS_BY_DAY: Record<number, OpeningHours> = {
  0: { openHour: 10, closeHour: 22 }, // Sun
  1: { openHour: 12, closeHour: 22 },
  2: { openHour: 12, closeHour: 22 },
  3: { openHour: 12, closeHour: 22 },
  4: { openHour: 12, closeHour: 23 }, // Fri
  5: { openHour: 10, closeHour: 23 }, // Sat
  6: { openHour: 10, closeHour: 22 }, // Sun (dup key 0 but keep for clarity)
};

export function getOpeningHours(dateStr: string): OpeningHours {
  const [y, m, d] = dateStr.split("-").map(Number);
  const local = new Date(y, (m || 1) - 1, d || 1);
  const dow = local.getDay();
  return HOURS_BY_DAY[dow] || { openHour: 12, closeHour: 22 };
}

export function generateTimeGrid(
  dateStr: string,
  intervalMinutes = DEFAULT_INTERVAL_MINUTES
): string[] {
  const { openHour, closeHour } = getOpeningHours(dateStr);
  const slots: string[] = [];
  for (let h = openHour; h < closeHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

export function toUtcFromLocal(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0));
}

