import type { Experience, ExperienceSummary } from "./types";

function parseYearMonth(value: string): { year: number; month: number } {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) {
    throw new Error(`Invalid date: ${value}`);
  }
  return { year: y, month: m };
}

export function monthsBetween(
  startDate: string,
  endDate: string | null,
  now = new Date(),
): number {
  const start = parseYearMonth(startDate);
  const end = endDate
    ? parseYearMonth(endDate)
    : { year: now.getFullYear(), month: now.getMonth() + 1 };

  const months =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;
  return Math.max(months, 0);
}

export function formatMonthYear(value: string): string {
  const { year, month } = parseYearMonth(value);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDurationLabel(months: number): string {
  if (months < 12) {
    return `${months} mo${months === 1 ? "" : "s"}`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return `${years} yr${years === 1 ? "" : "s"}`;
  }
  return `${years} yr${years === 1 ? "" : "s"} ${rem} mo${rem === 1 ? "" : "s"}`;
}

export function formatRolePeriod(
  startDate: string,
  endDate: string | null,
  now = new Date(),
): string {
  const start = formatMonthYear(startDate);
  const end = endDate ? formatMonthYear(endDate) : "Present";
  const duration = formatDurationLabel(monthsBetween(startDate, endDate, now));
  return `${start} – ${end} · ${duration}`;
}

export function computeExperienceSummary(
  experiences: Experience[],
  now = new Date(),
): ExperienceSummary {
  // Merge overlapping ranges roughly by summing unique months via timeline coverage
  const covered = new Set<string>();
  for (const exp of experiences) {
    const start = parseYearMonth(exp.startDate);
    const end = exp.endDate
      ? parseYearMonth(exp.endDate)
      : { year: now.getFullYear(), month: now.getMonth() + 1 };

    let y = start.year;
    let m = start.month;
    while (y < end.year || (y === end.year && m <= end.month)) {
      covered.add(`${y}-${String(m).padStart(2, "0")}`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }

  const totalMonths = covered.size;
  const years = Math.floor(totalMonths / 12);
  const rem = totalMonths % 12;
  let totalLabel: string;
  if (totalMonths === 0) {
    totalLabel = "0 years";
  } else if (years === 0) {
    totalLabel = `${totalMonths}+ months`;
  } else if (rem === 0) {
    totalLabel = `${years}+ years`;
  } else {
    totalLabel = `${years}+ years`;
  }

  return { totalLabel, totalMonths };
}
