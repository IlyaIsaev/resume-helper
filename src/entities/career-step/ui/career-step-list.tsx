import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, useLayoutEffect, useRef } from 'react';

import type { CareerStep } from '@/shared/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

import {
  bindCareerStepListScroller,
  careerStepListViewportHeight,
  careerStepsEmptyCopy,
  changeCareerStepsSort,
  reportCareerStepListVirtualizer,
  setCareerStepListViewportHeight,
} from '../model/career-step-list';
import {
  careerSteps,
  careerStepsSort,
  createdCareerStepId,
} from '../model/career-steps';
import {
  CAREER_STEP_LIST_ESTIMATE_SIZE,
  CAREER_STEP_LIST_GAP,
  CAREER_STEP_LIST_MAX_HEIGHT,
  CAREER_STEP_SORT_OPTIONS,
  careerStepListRangeExtractor,
} from '../model/list-query';
import { CareerStepCard } from './career-step-card';

type CareerStepListProps = {
  searchSlot?: ReactNode;
  editSlot?: (step: CareerStep) => ReactNode;
  deleteSlot?: (step: CareerStep) => ReactNode;
};

export const CareerStepList = reatomComponent(
  ({ searchSlot, editSlot, deleteSlot }: CareerStepListProps) => {
    const sort = careerStepsSort();
    const items = careerSteps() ?? [];
    const createdStepId = createdCareerStepId();
    const listViewportHeight = careerStepListViewportHeight();
    const parentRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => CAREER_STEP_LIST_ESTIMATE_SIZE,
      overscan: 0,
      gap: CAREER_STEP_LIST_GAP,
      paddingEnd: listViewportHeight,
      getItemKey: (index) => items[index]?.id ?? index,
      rangeExtractor: careerStepListRangeExtractor,
      onChange: wrap(reportCareerStepListVirtualizer),
    });
    const virtualizerRef = useRef(virtualizer);
    virtualizerRef.current = virtualizer;
    const scrollerRef = useRef({
      scrollToIndex(index: number, options: { align: 'start' }) {
        virtualizerRef.current.scrollToIndex(index, options);
      },
    });
    const virtualItems = virtualizer.getVirtualItems();

    useLayoutEffect(() => {
      bindCareerStepListScroller(scrollerRef.current);

      return () => {
        bindCareerStepListScroller(null);
      };
    }, []);

    useLayoutEffect(() => {
      if (items.length === 0) {
        setCareerStepListViewportHeight(0);

        return;
      }

      const el = parentRef.current;
      if (!el) return;

      const update = wrap(() => {
        setCareerStepListViewportHeight(el.clientHeight);
      });

      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);

      return () => observer.disconnect();
    }, [items.length]);

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex items-center gap-3">
          {searchSlot}
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
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {careerStepsEmptyCopy()}
          </p>
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
                if (!step) return null;

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
                    <CareerStepCard
                      step={step}
                      editSlot={editSlot?.(step)}
                      deleteSlot={deleteSlot?.(step)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
  'CareerStepList',
);
