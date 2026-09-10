import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { CalendarIcon } from 'lucide-react';

import { careerStepCalendarBounds } from '@/entities/career-step';
import {
  Button,
  Calendar,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui';

import type {
  CareerDatePart,
  CareerDateRange,
} from '../model/career-date-part';

type DatePartFieldProps = {
  id: string;
  label: string;
  selectLabel: string;
  placeholder?: string;
  ariaInvalid?: boolean;
  datePart: CareerDatePart;
};

const DatePartField = reatomComponent(
  ({
    id,
    label,
    selectLabel,
    placeholder,
    ariaInvalid,
    datePart,
  }: DatePartFieldProps) => {
    const { startMonth, endMonth } = careerStepCalendarBounds();

    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            value={datePart.draft()}
            placeholder={placeholder}
            autoComplete="off"
            aria-invalid={ariaInvalid}
            className="pr-9"
            onChange={wrap(datePart.typeDraft)}
            onBlur={wrap(datePart.blurDraft)}
            onKeyDown={wrap(datePart.openOnArrowDown)}
          />
          <Popover
            modal
            open={datePart.isOpen()}
            onOpenChange={wrap(datePart.setOpen)}
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
                month={datePart.month()}
                onMonthChange={wrap(datePart.showMonth)}
                selected={datePart.selected()}
                onSelect={wrap(datePart.selectDate)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
  'DatePartField',
);

type DateRangePickerProps = {
  id?: string;
  dates: CareerDateRange;
  'aria-invalid'?: boolean;
};

export const DateRangePicker = reatomComponent(
  ({ id, dates, 'aria-invalid': ariaInvalid }: DateRangePickerProps) => {
    const fromId = id ? `${id}-from` : 'dates-from';
    const toId = id ? `${id}-to` : 'dates-to';

    return (
      <div className="flex flex-row gap-4">
        <DatePartField
          id={fromId}
          label="Start"
          selectLabel="Select start date"
          ariaInvalid={ariaInvalid}
          datePart={dates.from}
        />
        <DatePartField
          id={toId}
          label="End"
          selectLabel="Select end date"
          placeholder="Present"
          ariaInvalid={ariaInvalid}
          datePart={dates.to}
        />
      </div>
    );
  },
  'DateRangePicker',
);
