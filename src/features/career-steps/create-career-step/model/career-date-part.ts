import {
  action,
  atom,
  computed,
  type FieldAtom,
  reatomBoolean,
  withChangeHook,
} from '@reatom/core';

import {
  formatCareerDate,
  formatIsoDate,
  parseIsoDate,
  parseTypedDate,
} from '@/entities/career-step';

export type DatePartAfterType = {
  draft: string;
  iso: string | undefined;
  month: Date | undefined;
};

export const datePartAfterType = (nextDraft: string): DatePartAfterType => {
  if (nextDraft.trim() === '') {
    return { draft: nextDraft, iso: '', month: undefined };
  }

  const parsed = parseTypedDate(nextDraft);
  if (!parsed) {
    return { draft: nextDraft, iso: undefined, month: undefined };
  }

  return {
    draft: nextDraft,
    iso: formatIsoDate(parsed),
    month: parsed,
  };
};

const reatomCareerDatePart = (
  isoField: FieldAtom<string>,
  name: string,
  blurDates: () => void,
) => {
  const draft = atom(formatCareerDate(isoField()), `${name}.draft`);
  const isOpen = reatomBoolean(false, `${name}.isOpen`);
  const month = atom(parseIsoDate(isoField()) ?? new Date(), `${name}.month`);
  const selected = computed(() => parseIsoDate(isoField()), `${name}.selected`);

  isoField.extend(
    withChangeHook((iso) => {
      draft.set(formatCareerDate(iso));

      const next = parseIsoDate(iso);
      if (!next) return;

      month.set(next);
    }),
  );

  const typeDraft = action((event: { target: { value: string } }) => {
    const next = datePartAfterType(event.target.value);

    draft.set(next.draft);
    if (next.iso === undefined) return;

    isoField.change(next.iso);
    if (!next.month) return;

    month.set(next.month);
  }, `${name}.typeDraft`);

  const blurDraft = action(() => {
    draft.set(formatCareerDate(isoField()));
    blurDates();
  }, `${name}.blurDraft`);

  const selectDate = action((date: Date | undefined) => {
    if (!date) return;

    isoField.change(formatIsoDate(date));
    month.set(date);
    isOpen.setFalse();
  }, `${name}.selectDate`);

  const setOpen = action((open: boolean) => {
    isOpen.set(open);
    if (open) return;

    blurDraft();
  }, `${name}.setOpen`);

  const showMonth = action((nextMonth: Date) => {
    month.set(nextMonth);
  }, `${name}.showMonth`);

  const openOnArrowDown = action(
    (event: { key: string; preventDefault: () => void }) => {
      if (event.key !== 'ArrowDown') return;

      event.preventDefault();
      isOpen.setTrue();
    },
    `${name}.openOnArrowDown`,
  );

  return {
    draft,
    isOpen,
    month,
    selected,
    typeDraft,
    blurDraft,
    selectDate,
    setOpen,
    showMonth,
    openOnArrowDown,
  };
};

export const reatomCareerDateRange = (
  fromField: FieldAtom<string>,
  toField: FieldAtom<string>,
  name: string,
) => {
  const blurDates = action(() => {
    fromField.focus.in();
    toField.focus.in();
  }, `${name}.blurDates`);

  return {
    from: reatomCareerDatePart(fromField, `${name}.from`, blurDates),
    to: reatomCareerDatePart(toField, `${name}.to`, blurDates),
  };
};

export type CareerDateRange = ReturnType<typeof reatomCareerDateRange>;
export type CareerDatePart = CareerDateRange['from'];
