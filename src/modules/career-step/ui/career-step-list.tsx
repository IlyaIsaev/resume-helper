import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { Input } from '@/common/ui/input';
import { Label } from '@/common/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/ui/select';
import { careerStepListInfiniteQueryOptions } from '../list-infinite-query';
import {
  CAREER_STEP_LIST_ESTIMATE_SIZE,
  CAREER_STEP_LIST_GAP,
  CAREER_STEP_LIST_MAX_HEIGHT,
  type CareerStepSort,
  careerStepListRangeExtractor,
  careerStepSortOptions,
  defaultCareerStepSort,
  isCareerStepSort,
} from '../list-query';
import { CareerStepCard } from './career-step-card';

const SEARCH_DEBOUNCE_MS = 300;

export function CareerStepList() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CareerStepSort>(defaultCareerStepSort);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    SEARCH_DEBOUNCE_MS,
    [query],
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(careerStepListInfiniteQueryOptions(debouncedQuery, sort));
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CAREER_STEP_LIST_ESTIMATE_SIZE,
    overscan: 0,
    gap: CAREER_STEP_LIST_GAP,
    getItemKey: (index) => items[index].id,
    rangeExtractor: careerStepListRangeExtractor,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastVirtualItem) return;
    if (
      lastVirtualItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items.length,
    lastVirtualItem,
  ]);

  const emptyMessage =
    debouncedQuery.trim().length === 0
      ? 'No career steps yet.'
      : 'No career steps match your search.';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
          ref={parentRef}
          data-testid="career-step-list"
          data-loaded-count={items.length}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: CAREER_STEP_LIST_MAX_HEIGHT }}
        >
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualItems.map((virtualItem) => {
              const step = items[virtualItem.index];

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <CareerStepCard step={step} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
