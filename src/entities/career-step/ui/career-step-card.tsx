import type { ReactNode } from 'react';

import type { CareerStep } from '@/shared/api';
import { cn } from '@/shared/lib';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

import { formatCareerDateRange } from '../lib/dates';

type CareerStepCardProps = {
  step: CareerStep;
  editSlot?: ReactNode;
  deleteSlot?: ReactNode;
};

export function CareerStepCard({
  step,
  editSlot,
  deleteSlot,
}: CareerStepCardProps) {
  const hasActions = Boolean(editSlot || deleteSlot);

  return (
    <Card className="relative group" data-testid="career-step-card">
      {hasActions ? (
        <div className="absolute top-2 right-2 flex opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
          {editSlot}
          {deleteSlot}
        </div>
      ) : null}
      <CardHeader className={cn('py-2.5 px-3.5', hasActions && 'pr-20')}>
        <CardTitle className="text-sm font-medium tracking-tight">
          {step.position}
        </CardTitle>
        <CardDescription>
          {formatCareerDateRange({
            from: step.startedOn,
            to: step.endedOn,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3.5 pb-4">
        <div>
          <p className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-1">
            Description
          </p>
          <p className="text-sm whitespace-pre-wrap">{step.description}</p>
        </div>
        <div>
          <p className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-1">
            Technologies
          </p>
          <p className="text-sm whitespace-pre-wrap">{step.technologies}</p>
        </div>
      </CardContent>
    </Card>
  );
}
