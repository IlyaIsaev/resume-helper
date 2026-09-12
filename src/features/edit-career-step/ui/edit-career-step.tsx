import { Pencil } from 'lucide-react';

import { careerStepEditPath } from '@/shared/config';
import { Button } from '@/shared/ui';

type EditCareerStepProps = {
  stepId: string;
};

export function EditCareerStep({ stepId }: EditCareerStepProps) {
  return (
    <Button asChild variant="ghost" size="icon">
      <a href={careerStepEditPath(stepId)} aria-label="Edit career step">
        <Pencil />
      </a>
    </Button>
  );
}
