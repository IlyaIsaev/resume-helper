import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { careerStepsQuery } from '@/entities/career-step';
import { Input } from '@/shared/ui';

import { changeCareerStepsQuery } from '../model/search-career-step';

export const SearchCareerStep = reatomComponent(() => {
  const query = careerStepsQuery();

  return (
    <Input
      id="career-step-search"
      type="search"
      value={query}
      onChange={wrap(changeCareerStepsQuery)}
      placeholder="Search career steps"
      aria-label="Search career steps"
      autoComplete="off"
      className="min-w-0 flex-1"
    />
  );
}, 'SearchCareerStep');
