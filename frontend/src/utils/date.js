import { parse, format, isValid } from "date-fns";

/**
 * Converts yyyy/MM/dd or yyyy-MM-dd → "Jan 16, 2026"
 */
export function formatToReadableDate(dateString) {
  if (!dateString) return "";

  // support both yyyy-MM-dd and yyyy/MM/dd
  const normalized = dateString.replace(/-/g, "/");

  const parsedDate = parse(normalized, "yyyy/MM/dd", new Date());

  if (!isValid(parsedDate)) return "";

  return format(parsedDate, "MMM dd, yyyy");
}
