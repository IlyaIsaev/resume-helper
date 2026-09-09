import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/common/ui/button';
import { Calendar } from '@/common/ui/calendar';
import { Field, FieldGroup, FieldLabel } from '@/common/ui/field';
import { Input } from '@/common/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/ui/popover';
import {
  careerStepCalendarBounds,
  formatCareerDate,
  formatIsoDate,
  parseIsoDate,
  parseTypedDate,
} from '../dates';

export type DateRangeValue = {
  from: string;
  to: string;
};

type DateRangePickerProps = {
  id?: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onBlur?: () => void;
  'aria-invalid'?: boolean;
};

type DatePartFieldProps = {
  id: string;
  label: string;
  selectLabel: string;
  isoValue: string;
  placeholder?: string;
  ariaInvalid?: boolean;
  onIsoChange: (iso: string) => void;
  onBlur?: () => void;
};

function DatePartField({
  id,
  label,
  selectLabel,
  isoValue,
  placeholder,
  ariaInvalid,
  onIsoChange,
  onBlur,
}: DatePartFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => formatCareerDate(isoValue));
  const selected = parseIsoDate(isoValue);
  const [month, setMonth] = useState<Date>(() => selected ?? new Date());
  const { startMonth, endMonth } = useMemo(
    () => careerStepCalendarBounds(),
    [],
  );

  useEffect(() => {
    setDraft(formatCareerDate(isoValue));
    const next = parseIsoDate(isoValue);
    if (next) setMonth(next);
  }, [isoValue]);

  return (
    <Field className="min-w-0 flex-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={ariaInvalid}
          className="pr-9"
          onChange={(event) => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);

            if (nextDraft.trim() === '') {
              onIsoChange('');
              return;
            }

            const parsed = parseTypedDate(nextDraft);
            if (!parsed) return;

            onIsoChange(formatIsoDate(parsed));
            setMonth(parsed);
          }}
          onBlur={() => {
            setDraft(formatCareerDate(isoValue));
            onBlur?.();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover
          modal
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) onBlur?.();
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={selectLabel}
              className="absolute top-0 right-0 size-9"
            >
              <CalendarIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            alignOffset={-8}
            sideOffset={10}
            className="w-auto overflow-hidden p-0"
          >
            <Calendar
              mode="single"
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={(date) => {
                if (!date) return;
                onIsoChange(formatIsoDate(date));
                setMonth(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </Field>
  );
}

export function DateRangePicker({
  id,
  value,
  onChange,
  onBlur,
  'aria-invalid': ariaInvalid,
}: DateRangePickerProps) {
  const fromId = id ? `${id}-from` : 'dates-from';
  const toId = id ? `${id}-to` : 'dates-to';

  return (
    <FieldGroup className="flex-row">
      <DatePartField
        id={fromId}
        label="Start"
        selectLabel="Select start date"
        isoValue={value.from}
        ariaInvalid={ariaInvalid}
        onIsoChange={(from) => onChange({ from, to: value.to })}
        onBlur={onBlur}
      />
      <DatePartField
        id={toId}
        label="End"
        selectLabel="Select end date"
        isoValue={value.to}
        placeholder="Present"
        ariaInvalid={ariaInvalid}
        onIsoChange={(to) => onChange({ from: value.from, to })}
        onBlur={onBlur}
      />
    </FieldGroup>
  );
}
