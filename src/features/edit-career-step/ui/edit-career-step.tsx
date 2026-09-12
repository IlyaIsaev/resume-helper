import { reatomComponent } from '@reatom/react';
import { Pencil } from 'lucide-react';

import { careerStepEditPath, pathWithSearch } from '@/shared/config';
import { Button } from '@/shared/ui';

type EditCareerStepProps = {
  stepId: string;
};

export const EditCareerStep = reatomComponent(
  ({ stepId }: EditCareerStepProps) => {
    return (
      <Button asChild variant="ghost" size="icon">
        <a
          href={pathWithSearch(careerStepEditPath(stepId))}
          aria-label="Edit career step"
        >
          <Pencil />
        </a>
      </Button>
    );
  },
  'EditCareerStep',
);
