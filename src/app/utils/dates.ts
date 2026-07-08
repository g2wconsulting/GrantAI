const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function daysUntil(date: Date, from = new Date()) {
  return Math.ceil((date.getTime() - from.getTime()) / DAY_IN_MS);
}

export function isDateInRange(date: Date, range: string, from = new Date()) {
  const diff = (date.getTime() - from.getTime()) / DAY_IN_MS;

  if (range === "all") return true;
  if (range === "month") {
    return date.getMonth() === from.getMonth() && date.getFullYear() === from.getFullYear();
  }
  if (range === "30") return diff >= 0 && diff <= 30;
  if (range === "60") return diff >= 0 && diff <= 60;
  if (range === "90") return diff >= 0 && diff <= 90;
  if (range === "90plus") return diff > 90;

  return true;
}
