import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  bindFormControl,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/shared/ui';

import type { CareerDateRange } from '../model/career-date-part';
import { DateRangePicker } from './date-range-picker';

type CareerStepFieldsProps = {
  fields: {
    position: FieldAtom<string>;
    dates: {
      from: FieldAtom<string>;
      to: FieldAtom<string>;
    };
    description: FieldAtom<string>;
    technologies: FieldAtom<string>;
  };
  dateParts: CareerDateRange;
};

export const CareerStepFields = reatomComponent(
  ({ fields, dateParts }: CareerStepFieldsProps) => {
    const positionField = bindFormControl(fields.position);
    const descriptionField = bindFormControl(fields.description);
    const technologiesField = bindFormControl(fields.technologies);

    return (
      <>
        <FormField field={fields.position}>
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input {...positionField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={fields.dates.from}>
          <FormItem>
            <FormLabel>Dates</FormLabel>
            <DateRangePicker id="career-step-dates" dates={dateParts} />
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={fields.description}>
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea className="min-h-40" {...descriptionField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={fields.technologies}>
          <FormItem>
            <FormLabel>Technologies</FormLabel>
            <FormControl>
              <Textarea className="min-h-40" {...technologiesField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </>
    );
  },
  'CareerStepFields',
);
