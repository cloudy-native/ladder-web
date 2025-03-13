import { formatRelative } from "date-fns/formatRelative";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export const formatFriendlyDate = (dateString: string) => {
  return formatRelative(new Date(dateString), new Date());
};
