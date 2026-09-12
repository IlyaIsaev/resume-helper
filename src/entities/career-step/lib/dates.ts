const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TYPED_DISPLAY_DATE = /^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/;
const CAREER_STEP_CALENDAR_START_YEAR = 1970;

const displayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const monthIndexByName = (() => {
  const names = new Map<string, number>();

  for (let month = 0; month < 12; month += 1) {
    const date = new Date(2026, month, 1);
    for (const locale of ['en-GB', 'en-US'] as const) {
      for (const monthStyle of ['short', 'long'] as const) {
        const label = new Intl.DateTimeFormat(locale, { month: monthStyle })
          .format(date)
          .replace(/\./g, '')
          .toLowerCase();
        names.set(label, month);
      }
    }
  }

  return names;
})();

export const parseIsoDate = (value: string): Date | undefined => {
  const match = ISO_DATE.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

export const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateFromParts = (
  year: number,
  month: number,
  day: number,
): Date | undefined => {
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
};

export const formatCareerDate = (value: string): string => {
  const date = parseIsoDate(value);
  return date ? displayFormatter.format(date) : '';
};

export const parseTypedDate = (value: string): Date | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const iso = parseIsoDate(trimmed);
  if (iso) return iso;

  const match = TYPED_DISPLAY_DATE.exec(trimmed);
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = monthIndexByName.get(match[2].toLowerCase());
  const year = Number(match[3]);
  if (month === undefined) return undefined;

  return dateFromParts(year, month, day);
};

export const careerStepCalendarBounds = (
  now = new Date(),
): { startMonth: Date; endMonth: Date } => {
  return {
    startMonth: new Date(CAREER_STEP_CALENDAR_START_YEAR, 0, 1),
    endMonth: new Date(now.getFullYear() + 1, 11, 1),
  };
};

export const formatCareerDateRange = ({
  from,
  to,
}: {
  from: string;
  to: string | null;
}): string => {
  const start = parseIsoDate(from);
  if (!start) return '';

  const startLabel = displayFormatter.format(start);
  if (!to) return `${startLabel} – Present`;

  const end = parseIsoDate(to);
  if (!end) return `${startLabel} – Present`;

  return `${startLabel} – ${displayFormatter.format(end)}`;
};
