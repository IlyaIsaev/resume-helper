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
} from '../lib/dates';

export type DatePartAfterType =
  | { type: 'empty'; draft: string }
  | { type: 'invalid'; draft: string }
  | { type: 'valid'; draft: string; iso: string; month: Date };

export const datePartAfterType = (nextDraft: string): DatePartAfterType => {
  if (nextDraft.trim() === '') {
    return { type: 'empty', draft: nextDraft };
  }

  const parsed = parseTypedDate(nextDraft);
  if (!parsed) {
    return { type: 'invalid', draft: nextDraft };
  }

  return {
    type: 'valid',
    draft: nextDraft,
    iso: formatIsoDate(parsed),
    month: parsed,
  };
};

const reatomCareerDatePart = ({
  isoField,
  name,
  blurDates,
}: {
  isoField: FieldAtom<string>;
  name: string;
  blurDates: () => void;
}) => {
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

    switch (next.type) {
      case 'empty':
        isoField.change('');
        return;
      case 'invalid':
        return;
      case 'valid':
        isoField.change(next.iso);
        month.set(next.month);
        return;
    }
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

  const setOpen = action((shouldOpen: boolean) => {
    isOpen.set(shouldOpen);
    if (shouldOpen) {
      month.set(parseIsoDate(isoField()) ?? new Date());
      return;
    }

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

export const reatomCareerDateRange = ({
  fromField,
  toField,
  name,
}: {
  fromField: FieldAtom<string>;
  toField: FieldAtom<string>;
  name: string;
}) => {
  const blurDates = action(() => {
    fromField.focus.in();
    toField.focus.in();
  }, `${name}.blurDates`);

  return {
    from: reatomCareerDatePart({
      isoField: fromField,
      name: `${name}.from`,
      blurDates,
    }),
    to: reatomCareerDatePart({
      isoField: toField,
      name: `${name}.to`,
      blurDates,
    }),
  };
};

export type CareerDateRange = ReturnType<typeof reatomCareerDateRange>;
export type CareerDatePart = CareerDateRange['from'];
