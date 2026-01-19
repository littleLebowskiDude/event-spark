'use client';

import { useState, useEffect, useReducer } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { Event, UpdateEventInput } from '@/lib/types';
import { getEventById, updateEvent, NotFoundError } from '@/lib/supabase';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

type LoadingState = 'loading' | 'success' | 'error' | 'not-found';

type State = {
  event: Event | null;
  loadingState: LoadingState;
  errorMessage: string;
};

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; event: Event }
  | { type: 'ERROR'; message: string }
  | { type: 'NOT_FOUND' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loadingState: 'loading', errorMessage: '' };
    case 'SUCCESS':
      return { event: action.event, loadingState: 'success', errorMessage: '' };
    case 'ERROR':
      return { ...state, loadingState: 'error', errorMessage: action.message };
    case 'NOT_FOUND':
      return { ...state, loadingState: 'not-found', errorMessage: '' };
  }
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    event: null,
    loadingState: 'loading',
    errorMessage: '',
  });
  const [submitError, setSubmitError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!params.id) return;

    let cancelled = false;

    async function loadEvent() {
      dispatch({ type: 'LOADING' });
      const result = await getEventById(params.id as string);

      if (cancelled) return;

      if (result.success) {
        dispatch({ type: 'SUCCESS', event: result.data });
      } else {
        if (result.error instanceof NotFoundError) {
          dispatch({ type: 'NOT_FOUND' });
        } else {
          dispatch({ type: 'ERROR', message: result.error.message });
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [params.id, retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const handleSubmit = async (data: Partial<Event>) => {
    setSubmitError('');

    const result = await updateEvent(params.id as string, data as UpdateEventInput);

    if (!result.success) {
      setSubmitError(result.error.message);
      throw new Error(result.error.message);
    }
  };

  if (state.loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (state.loadingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Unable to Load Event</h2>
        <p className="text-sm text-muted mb-6 max-w-sm">
          {state.errorMessage || 'Something went wrong while loading this event. Please try again.'}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (state.loadingState === 'not-found' || !state.event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted mb-6">This event may have been removed or doesn&apos;t exist.</p>
        <button
          onClick={() => router.push('/admin/events')}
          className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Event</h1>

      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <EventForm event={state.event} onSubmit={handleSubmit} />
    </div>
  );
}
