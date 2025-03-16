import { format, isAfter, subDays } from "date-fns";
import { formatRelative } from "date-fns/formatRelative";

/**
 * Defines the format for full date and time display.  Includes both date and time components.
 */
const DATE_FORMAT = "EEEE, MMMM d, yyyy";
/**
 * Defines the format for time display. Uses 12-hour format with AM/PM.
 */
const TIME_FORMAT = "h:mm a";

/**
 * Formats a date string into a user-friendly relative date or a full date and time string.  If the date is within the last six days, it displays a relative date (e.g., "yesterday", "2 days ago"). Otherwise, it displays the full date and time.
 * @param dateString - The date string to format.  Should be a string that can be parsed by `new Date()`.
 * @returns A user-friendly formatted date string.
 */
export const formatFriendlyDate = (dateString: string) => {
  const date = new Date(dateString);
  const sixDaysAgo = subDays(new Date(), 6); // Calculate the date six days ago

  // Check if the date is within the last six days
  if (isAfter(date, sixDaysAgo)) {
    // If within the last six days, use relative formatting
    return formatRelative(date, new Date());
  } else {
    // Otherwise, use full date and time formatting
    return formatFullDate(dateString);
  }
};

/**
 * Formats a date string into a full date and time string (day of the week, month, day, year, time).
 * @param dateString - The date string to format. Should be a string that can be parsed by `new Date()`.
 * @returns A string representing the full date and time.
 */
export const formatFullDate = (dateString: string) => {
  const date = new Date(dateString); // Parse the date string

  // Format the date using the defined format strings
  return format(date, `${DATE_FORMAT} ${TIME_FORMAT}`);
};
