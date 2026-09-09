import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import type { CareerStep } from '@/entities/career-step';
import { formatCareerDateRange } from '@/entities/career-step';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { DeleteCareerStepDialog } from './delete-career-step-dialog';

export function CareerStepCard({ step }: { step: CareerStep }) {
  return (
    <Card className="relative group" data-testid="career-step-card">
      <div className="absolute top-2 right-2 flex opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
        <Button asChild variant="ghost" size="icon">
          <Link
            to="/career-steps/$stepId/edit"
            params={{ stepId: step.id }}
            aria-label="Edit career step"
          >
            <Pencil />
          </Link>
        </Button>
        <DeleteCareerStepDialog step={step} />
      </div>
      <CardHeader className="py-2.5 px-3.5 pr-20">
        <CardTitle className="text-sm font-medium tracking-tight">
          {step.position}
        </CardTitle>
        <CardDescription>
          {formatCareerDateRange(step.startedOn, step.endedOn)}
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
