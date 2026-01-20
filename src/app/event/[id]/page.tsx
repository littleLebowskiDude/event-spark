'use client';

import { useEffect, useReducer } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import { getEventById } from '@/lib/supabase';
import EventDetail from '@/components/EventDetail';
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
  | { type: 'NOT_FOUND' }
  | { type: 'ERROR'; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loadingState: 'loading', errorMessage: '' };
    case 'SUCCESS':
      return { event: action.event, loadingState: 'success', errorMessage: '' };
    case 'NOT_FOUND':
      return { event: null, loadingState: 'not-found', errorMessage: '' };
    case 'ERROR':
      return { ...state, loadingState: 'error', errorMessage: action.message };
  }
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    event: null,
    loadingState: 'loading',
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!params.id || typeof params.id !== 'string') {
        dispatch({ type: 'NOT_FOUND' });
        return;
      }

      dispatch({ type: 'LOADING' });
      const result = await getEventById(params.id);

      if (cancelled) return;

      if (result.success) {
        dispatch({ type: 'SUCCESS', event: result.data });
      } else if (result.error.name === 'NotFoundError') {
        dispatch({ type: 'NOT_FOUND' });
      } else {
        dispatch({ type: 'ERROR', message: result.error.message });
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleClose = () => {
    router.back();
  };

  const handleRetry = () => {
    if (params.id && typeof params.id === 'string') {
      dispatch({ type: 'LOADING' });
      getEventById(params.id).then(result => {
        if (result.success) {
          dispatch({ type: 'SUCCESS', event: result.data });
        } else if (result.error.name === 'NotFoundError') {
          dispatch({ type: 'NOT_FOUND' });
        } else {
          dispatch({ type: 'ERROR', message: result.error.message });
        }
      });
    }
  };

  if (state.loadingState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (state.loadingState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Unable to Load Event</h1>
        <p className="text-muted mb-6 max-w-sm">
          {state.errorMessage || 'Something went wrong while loading this event.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-card border border-border font-semibold rounded-full hover:bg-card-hover transition-colors"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  if (state.loadingState === 'not-found' || !state.event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted mb-6">This event may have been removed or doesn&apos;t exist.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent/90 transition-colors"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  return (
    <EventDetail
      event={state.event}
      onClose={handleClose}
      showActions={true}
    />
  );
}
