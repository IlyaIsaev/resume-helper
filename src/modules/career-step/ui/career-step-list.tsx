import { useLiveSuspenseQuery } from '@tanstack/react-db';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/common/ui/input';
import { Label } from '@/common/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/ui/select';
import { careerStepCollection } from '../collection';
import {
  type CareerStepSort,
  careerStepSortOptions,
  defaultCareerStepSort,
  filterAndSortCareerSteps,
  isCareerStepSort,
} from '../list-query';
import { CareerStepCard } from './career-step-card';

export function CareerStepList() {
  const { data: steps } = useLiveSuspenseQuery({
    query: (q) =>
      q
        .from({ step: careerStepCollection })
        .orderBy(({ step }) => step.createdAt, 'desc'),
  });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CareerStepSort>(defaultCareerStepSort);
  const items = useMemo(
    () => filterAndSortCareerSteps(steps, query, sort),
    [query, sort, steps],
  );
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const nextMargin = listRef.current?.offsetTop ?? 0;
    setScrollMargin((current) =>
      current === nextMargin ? current : nextMargin,
    );
  });

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 220,
    overscan: 5,
    gap: 16,
    scrollMargin,
    getItemKey: (index) => items[index].id,
  });

  const emptyMessage =
    steps.length === 0
      ? 'No career steps yet.'
      : 'No career steps match your search.';

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="career-step-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search career steps"
        aria-label="Search career steps"
        autoComplete="off"
      />
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Label htmlFor="career-step-sort">Sort</Label>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (isCareerStepSort(value)) setSort(value);
            }}
          >
            <SelectTrigger
              id="career-step-sort"
              className="w-[13.5rem]"
              aria-label="Sort career steps"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {careerStepSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div
          ref={listRef}
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const step = items[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${
                    virtualItem.start - virtualizer.options.scrollMargin
                  }px)`,
                }}
              >
                <CareerStepCard step={step} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
