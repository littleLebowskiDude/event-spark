'use client';

import { useState, useEffect, useReducer } from 'react';
import { AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import SavedEventsList from '@/components/SavedEventsList';
import EventDetail from '@/components/EventDetail';
import { Event } from '@/lib/types';
import { getEventsByIds } from '@/lib/supabase';
import { getSavedEventIds } from '@/lib/storage';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Heart } from 'lucide-react';

type LoadingState = 'loading' | 'success' | 'error';

type State = {
  savedEvents: Event[];
  loadingState: LoadingState;
  errorMessage: string;
};

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; events: Event[] }
  | { type: 'ERROR'; message: string }
  | { type: 'REMOVE_EVENT'; eventId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loadingState: 'loading', errorMessage: '' };
    case 'SUCCESS':
      return { savedEvents: action.events, loadingState: 'success', errorMessage: '' };
    case 'ERROR':
      return { ...state, loadingState: 'error', errorMessage: action.message };
    case 'REMOVE_EVENT':
      return { ...state, savedEvents: state.savedEvents.filter(e => e.id !== action.eventId) };
  }
}

export default function SavedPage() {
  const [state, dispatch] = useReducer(reducer, {
    savedEvents: [],
    loadingState: 'loading',
    errorMessage: '',
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedEvents() {
      dispatch({ type: 'LOADING' });

      // Get saved event IDs from local storage
      const savedIds = getSavedEventIds();

      if (savedIds.length === 0) {
        dispatch({ type: 'SUCCESS', events: [] });
        return;
      }

      // Fetch events from Supabase by their IDs
      const result = await getEventsByIds(savedIds);

      if (cancelled) return;

      if (result.success) {
        // Sort by date
        const events = result.data.sort(
          (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        dispatch({ type: 'SUCCESS', events });
      } else {
        dispatch({ type: 'ERROR', message: result.error.message });
      }
    }

    loadSavedEvents();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const handleEventTap = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    // Reload saved events in case something changed
    handleRetry();
  };

  const handleRemove = (eventId: string) => {
    dispatch({ type: 'REMOVE_EVENT', eventId });
  };

  const renderContent = () => {
    switch (state.loadingState) {
      case 'loading':
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Saved Events</h2>
            <p className="text-sm text-muted mb-6 max-w-sm">
              {state.errorMessage || 'Something went wrong while loading your saved events. Please try again.'}
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        );

      case 'success':
        if (state.savedEvents.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
              <Heart className="w-12 h-12 text-muted mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Saved Events</h2>
              <p className="text-sm text-muted max-w-sm">
                Events you save will appear here. Swipe right or tap the heart button to save events you are interested in.
              </p>
            </div>
          );
        }
        return (
          <SavedEventsList
            events={state.savedEvents}
            onEventTap={handleEventTap}
            onRemove={handleRemove}
          />
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col pb-16">
      {/* Header */}
      <header className="flex items-center justify-center py-4 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-bold">Saved Events</h1>
        </div>
      </header>

      {/* Subtitle */}
      <div className="text-center py-2 px-4">
        <p className="text-sm text-muted">Your saved events in Beechworth</p>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetail
            event={selectedEvent}
            onClose={handleCloseDetail}
            showActions={false}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
