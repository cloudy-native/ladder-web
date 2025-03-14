import { format, isAfter, subDays } from "date-fns";
import { formatRelative } from "date-fns/formatRelative";

const DATE_FORMAT = "EEEE, MMMM d, yyyy";
const TIME_FORMAT = "h:mm a";

export const formatFriendlyDate = (dateString: string) => {
  const date = new Date(dateString);
  const sixDaysAgo = subDays(new Date(), 6);

  if (isAfter(date, sixDaysAgo)) {
    return formatRelative(date, new Date());
  } else {
    return formatFullDate(dateString);
  }
};

export const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);

  return format(date, `${DATE_FORMAT} ${TIME_FORMAT}`);
};
