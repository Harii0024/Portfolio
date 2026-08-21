from __future__ import annotations

from datetime import date


def _parse_year_month(value: str) -> tuple[int, int]:
    year_s, month_s = value.split("-", maxsplit=1)
    return int(year_s), int(month_s)


def months_between(start_date: str, end_date: str | None, today: date | None = None) -> int:
    today = today or date.today()
    start_y, start_m = _parse_year_month(start_date)
    if end_date:
        end_y, end_m = _parse_year_month(end_date)
    else:
        end_y, end_m = today.year, today.month
    months = (end_y - start_y) * 12 + (end_m - start_m) + 1
    return max(months, 0)


def format_month_year(value: str) -> str:
    year, month = _parse_year_month(value)
    return date(year, month, 1).strftime("%b %Y")


def format_duration_label(months: int) -> str:
    if months < 12:
        return f"{months} mo" if months == 1 else f"{months} mos"
    years, rem = divmod(months, 12)
    if rem == 0:
        return f"{years} yr" if years == 1 else f"{years} yrs"
    y = f"{years} yr" if years == 1 else f"{years} yrs"
    m = f"{rem} mo" if rem == 1 else f"{rem} mos"
    return f"{y} {m}"


def format_role_period(start_date: str, end_date: str | None, today: date | None = None) -> str:
    start = format_month_year(start_date)
    end = format_month_year(end_date) if end_date else "Present"
    duration = format_duration_label(months_between(start_date, end_date, today))
    return f"{start} – {end} · {duration}"


def compute_experience_summary(
    experiences: list[dict],
    today: date | None = None,
) -> dict:
    today = today or date.today()
    covered: set[str] = set()
    for exp in experiences:
        start_y, start_m = _parse_year_month(exp["startDate"])
        end_raw = exp.get("endDate")
        if end_raw:
            end_y, end_m = _parse_year_month(end_raw)
        else:
            end_y, end_m = today.year, today.month
        y, m = start_y, start_m
        while y < end_y or (y == end_y and m <= end_m):
            covered.add(f"{y}-{m:02d}")
            m += 1
            if m > 12:
                m = 1
                y += 1

    total_months = len(covered)
    years = total_months // 12
    if total_months == 0:
        total_label = "0 years"
    elif years == 0:
        total_label = f"{total_months}+ months"
    else:
        total_label = f"{years}+ years"

    return {"totalLabel": total_label, "totalMonths": total_months}
