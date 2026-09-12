import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  CAREER_STEP_SORT_OPTIONS,
  careerStepsSort,
} from '@/entities/career-step';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

import { changeCareerStepsSort } from '../model/sort-career-step';

export const SortCareerStep = reatomComponent(() => {
  const sort = careerStepsSort();

  return (
    <Select value={sort} onValueChange={wrap(changeCareerStepsSort)}>
      <SelectTrigger
        id="career-step-sort"
        className="w-fit shrink-0"
        aria-label="Sort career steps"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {CAREER_STEP_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}, 'SortCareerStep');
