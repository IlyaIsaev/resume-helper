import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useRef, useState } from 'react';
import { CareerStepCard } from './career-step-card';

type CareerStep = {
  id: string;
  position: string;
  startedOn: string;
  endedOn: string | null;
  description: string;
  technologies: string;
};

export function CareerStepList({ steps }: { steps: CareerStep[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(listRef.current?.offsetTop ?? 0);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: steps.length,
    estimateSize: () => 220,
    overscan: 5,
    gap: 16,
    scrollMargin,
    getItemKey: (index) => steps[index].id,
  });

  return (
    <div
      ref={listRef}
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const step = steps[virtualItem.index];

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
  );
}
