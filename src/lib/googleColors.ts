/**
 * Google Calendar's standard event colour palette (calendar/v3 "colors" resource).
 * Keys are Google's event colorId values.
 */
export const GOOGLE_EVENT_COLORS: Record<string, string> = {
  "1": "#7986CB", // Lavender
  "2": "#33B679", // Sage
  "3": "#8E24AA", // Grape
  "4": "#E67C73", // Flamingo
  "5": "#F6BF26", // Banana
  "6": "#F4511E", // Tangerine
  "7": "#039BE5", // Peacock
  "8": "#616161", // Graphite
  "9": "#3F51B5", // Blueberry
  "10": "#0B8043", // Basil
  "11": "#D50000", // Tomato
};

/** Google's default calendar colour when nothing else is known. */
export const GOOGLE_DEFAULT_COLOR = "#DCDCE8";

/**
 * Resolve the colour to paint a synced Google event with:
 * the event's own colour, else the calendar's colour, else Google's default.
 */
export function resolveGoogleEventColor(
  colorId?: string | null,
  calendarColor?: string | null,
): string {
  if (colorId && GOOGLE_EVENT_COLORS[colorId]) return GOOGLE_EVENT_COLORS[colorId];
  if (calendarColor && /^#[0-9a-fA-F]{6}$/.test(calendarColor)) return calendarColor;
  return GOOGLE_DEFAULT_COLOR;
}
