import { Label, Skeleton } from '@/shared/ui';

export const CareerStepFieldsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <span className="sr-only">loading</span>
      <div className="flex flex-col gap-2">
        <Label>Position</Label>
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Dates</Label>
        <div className="flex flex-row gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label>Start</Label>
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label>End</Label>
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <Skeleton className="min-h-40 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Technologies</Label>
        <Skeleton className="min-h-40 w-full" />
      </div>
    </div>
  );
};
