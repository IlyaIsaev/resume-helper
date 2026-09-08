import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/ui/dialog';
import { createCareerStep } from '../functions';
import { emptyCareerStepValues } from '../schema';
import { CareerStepForm } from './career-step-form';

export function AddCareerStepDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          ref={triggerRef}
          className="w-full focus:ring-1 focus:ring-ring"
          autoFocus
        >
          Add career step
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CareerStepForm
            defaultValues={emptyCareerStepValues}
            onSubmit={async (value) => {
              try {
                await createCareerStep({ data: value });
                await router.invalidate();
                toast.success(`Career step “${value.position}” was created.`);
              } catch (error) {
                toast.error(
                  `Could not create career step “${value.position}”.`,
                );
                throw error;
              }
            }}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
