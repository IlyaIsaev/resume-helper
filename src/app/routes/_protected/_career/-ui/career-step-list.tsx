import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import {
  CAREER_STEP_LIST_ESTIMATE_SIZE,
  CAREER_STEP_LIST_GAP,
  CAREER_STEP_LIST_MAX_HEIGHT,
  type CareerStepSort,
  careerStepListInfiniteQueryOptions,
  careerStepListRangeExtractor,
  careerStepSortOptions,
  createdStepScrollAction,
  defaultCareerStepSort,
  isCareerStepSort,
} from '@/entities/career-step';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { CareerStepCard } from './career-step-card';
import { useCreatedCareerStepScroll } from './career-step-created-focus';

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
  const { createdStepId, clearCreatedCareerStepScroll } =
    useCreatedCareerStepScroll();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery(careerStepListInfiniteQueryOptions(debouncedQuery, sort));
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const parentRef = useRef<HTMLDivElement>(null);
  const [listViewportHeight, setListViewportHeight] = useState(0);

  useLayoutEffect(() => {
    if (items.length === 0) {
      setListViewportHeight(0);
      return;
    }

    const el = parentRef.current;
    if (!el) return;

    const update = () => setListViewportHeight(el.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CAREER_STEP_LIST_ESTIMATE_SIZE,
    overscan: 0,
    gap: CAREER_STEP_LIST_GAP,
    paddingEnd: listViewportHeight,
    getItemKey: (index) => items[index].id,
    rangeExtractor: careerStepListRangeExtractor,
  });
  const virtualizerRef = useRef(virtualizer);
  virtualizerRef.current = virtualizer;
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

  const itemIdsKey = items.map((item) => item.id).join();

  useEffect(() => {
    const action = createdStepScrollAction(
      createdStepId,
      itemIdsKey.length === 0 ? [] : itemIdsKey.split(','),
      { isFetching, hasNextPage, isFetchingNextPage },
    );

    if (action.type === 'fetchNext') {
      void fetchNextPage();
      return;
    }

    if (action.type === 'scroll' && createdStepId) {
      if (listViewportHeight === 0) return;

      const index = action.index;
      virtualizerRef.current.scrollToIndex(index, { align: 'start' });
      const rafId = requestAnimationFrame(() => {
        virtualizerRef.current.scrollToIndex(index, { align: 'start' });
        clearCreatedCareerStepScroll();
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [
    createdStepId,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    itemIdsKey,
    listViewportHeight,
    clearCreatedCareerStepScroll,
  ]);

  const emptyMessage =
    debouncedQuery.trim().length === 0
      ? 'No career steps yet.'
      : 'No career steps match your search.';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          id="career-step-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search career steps"
          aria-label="Search career steps"
          autoComplete="off"
          className="min-w-0 flex-1"
        />
        <Select
          value={sort}
          onValueChange={(value) => {
            if (isCareerStepSort(value)) setSort(value);
          }}
        >
          <SelectTrigger
            id="career-step-sort"
            className="w-fit shrink-0"
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
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div
          ref={parentRef}
          data-testid="career-step-list"
          data-loaded-count={items.length}
          data-scroll-created-id={createdStepId ?? ''}
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
                  data-career-step-id={step.id}
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
