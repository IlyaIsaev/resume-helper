import { createFileRoute } from '@tanstack/react-router'
import { AddCareerStepDialog } from '@/components/add-career-step-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCareerDateRange } from '@/lib/career-step/dates'
import { listCareerSteps } from '@/lib/career-step/functions'

export const Route = createFileRoute('/_protected/')({
  loader: () => listCareerSteps(),
  component: AppHome,
})

function AppHome() {
  const careerSteps = Route.useLoaderData()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
      <section className="flex flex-1 flex-col gap-4 pb-4">
        <h1 className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          Career
        </h1>
        {careerSteps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No career steps yet.</p>
        ) : (
          careerSteps.map((step) => (
            <Card
              key={step.id}
              className="card-glow"
              data-testid="career-step-card"
            >
              <CardHeader className="py-2.5 px-3.5">
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
                  <p className="text-sm whitespace-pre-wrap">
                    {step.description}
                  </p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-1">
                    Technologies
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {step.technologies}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
      <div className="sticky bottom-4 z-10 mt-auto bg-background pt-4">
        <AddCareerStepDialog />
      </div>
    </div>
  )
}
