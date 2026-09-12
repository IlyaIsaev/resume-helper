import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';

import {
  careerStepsSort,
  DEFAULT_CAREER_STEP_SORT,
} from '@/entities/career-step';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';

import {
  careerStepsSortButtonLabel,
  careerStepsSortTooltip,
  toggleCareerStepsSort,
} from '../model/sort-career-step';

export const SortCareerStep = reatomComponent(() => {
  const isNewestFirst = careerStepsSort() === DEFAULT_CAREER_STEP_SORT;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={careerStepsSortButtonLabel()}
          onClick={wrap(toggleCareerStepsSort)}
        >
          {isNewestFirst ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{careerStepsSortTooltip()}</TooltipContent>
    </Tooltip>
  );
}, 'SortCareerStep');
