import moment from "moment-timezone";

const DISPLAY_ZONE = "Asia/Kolkata";

/**
 * Formats any date input into the application display timezone (Asia/Kolkata).
 * @param date The date to format (Date, string, number).
 * @param formatString The moment format string (defaults to 'DD-MM-YYYY hh:mm A').
 */
export function formatDate(
  date: Date | string | number,
  formatString: string = "DD MMM YYYY, hh:mm A",
): string {
  if (!date) return "";
  return moment.utc(date).tz(DISPLAY_ZONE).format(formatString);
}

/**
 * Returns a moment-timezone instance set to Asia/Kolkata timezone.
 */
export function getLocalMoment(date?: Date | string | number) {
  if (date) {
    return moment.utc(date).tz(DISPLAY_ZONE);
  }
  return moment().tz(DISPLAY_ZONE);
}
