import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useEditPlace } from '@/hooks/useAdminPlaces';
import { toPlaceDraft, type PlaceDraft } from '@/lib/placeDraft';
import { Container } from '@/components/app-layout/Container';
import { PageHeader } from '@/components/app-ui/PageHeader';
import { PlaceForm } from '@/components/app-ui/PlaceForm';
import { Alert } from '@/components/app-ui/Alert';
import { Button, buttonClasses } from '@/components/app-ui/Button';
import { EmptyState } from '@/components/app-ui/EmptyState';
import { Skeleton } from '@/components/app-ui/Skeleton';

/** Admin edit of a live place; reached from the console's Places tab. */
export function EditPlacePage() {
  const { id = '' } = useParams();
  const { place, loading, error, save } = useEditPlace(id);
  const [saved, setSaved] = useState(false);

  async function onSubmit(draft: PlaceDraft) {
    if ((await save.run(draft)).ok) setSaved(true);
  }

  if (saved) {
    return (
      <Container className="max-w-2xl py-20">
        <EmptyState
          icon={CheckCircle2}
          title="Changes saved"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={`/app/places/${id}`} className={buttonClasses('dark')}>
                View place
              </Link>
              <Button variant="outline" onClick={() => setSaved(false)}>
                Keep editing
              </Button>
            </div>
          }
        >
          The update is live for travellers now.
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title={place ? `Edit ${place.name}` : 'Edit place'} />
      <Container className="max-w-3xl py-10 sm:py-12">
        {error ? (
          <Alert>{error}</Alert>
        ) : loading || !place ? (
          <div className="space-y-4">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <PlaceForm
            // Re-seed the form if the route moves to another place.
            key={place.id}
            initial={toPlaceDraft(place)}
            submitLabel="Save changes"
            cancelTo="/app/admin"
            busy={save.busy}
            error={save.error}
            onSubmit={onSubmit}
          />
        )}
      </Container>
    </>
  );
}
