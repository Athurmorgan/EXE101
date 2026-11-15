import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useSubmitPlace } from '@/hooks/useSubmitPlace';
import { EMPTY_PLACE_DRAFT as EMPTY, type PlaceDraft } from '@/lib/placeDraft';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { PlaceForm } from '@/components/app-ui/PlaceForm';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';

export function NewPlacePage() {
  // Name of the place just sent in; `null` while the form is showing.
  const [submitted, setSubmitted] = useState<string | null>(null);
  const submit = useSubmitPlace();

  async function onSubmit(draft: PlaceDraft) {
    if ((await submit.run(draft)).ok) setSubmitted(draft.name.trim());
  }

  if (submitted !== null) {
    return (
      <Container className="max-w-2xl py-20">
        <EmptyState
          icon={CheckCircle2}
          title="Thanks — it's in the queue"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/app/discover" className={buttonClasses('dark')}>
                Back to Discover
              </Link>
              <Button variant="outline" onClick={() => setSubmitted(null)}>
                Suggest another
              </Button>
            </div>
          }
        >
          A moderator will verify {submitted} before it appears in Discover.
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="Suggest a place"
        lead="Know somewhere that belongs on the map? Every suggestion is checked before it goes live."
      />
      <Container className="max-w-3xl py-10 sm:py-12">
        <PlaceForm
          initial={EMPTY}
          submitLabel="Submit for review"
          cancelTo="/app/discover"
          busy={submit.busy}
          error={submit.error}
          onSubmit={onSubmit}
        />
      </Container>
    </>
  );
}
