'use client';

import { useState, useEffect, useReducer } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeStack from '@/components/SwipeStack';
import EventDetail from '@/components/EventDetail';
import BottomNav from '@/components/BottomNav';
import { SwipeStackSkeleton } from '@/components/EventCardSkeleton';
import { Event } from '@/lib/types';
import { getEvents } from '@/lib/supabase';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

type LoadingState = 'loading' | 'success' | 'error';

type State = {
  events: Event[];
  loadingState: LoadingState;
  errorMessage: string;
};

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; events: Event[] }
  | { type: 'ERROR'; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loadingState: 'loading', errorMessage: '' };
    case 'SUCCESS':
      return { events: action.events, loadingState: 'success', errorMessage: '' };
    case 'ERROR':
      return { ...state, loadingState: 'error', errorMessage: action.message };
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    loadingState: 'loading',
    errorMessage: '',
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      dispatch({ type: 'LOADING' });
      const result = await getEvents();

      if (cancelled) return;

      if (result.success) {
        dispatch({ type: 'SUCCESS', events: result.data });
      } else {
        dispatch({ type: 'ERROR', message: result.error.message });
      }
    }

    fetchEvents();

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
  };

  const handleSave = () => {
    // Event was saved, close detail view
    setSelectedEvent(null);
  };

  const handlePass = () => {
    // Event was passed, close detail view
    setSelectedEvent(null);
  };

  const renderContent = () => {
    switch (state.loadingState) {
      case 'loading':
        return <SwipeStackSkeleton />;

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Events</h2>
            <p className="text-sm text-muted mb-6 max-w-sm">
              {state.errorMessage || 'Something went wrong while loading events. Please try again.'}
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
        if (state.events.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <Sparkles className="w-12 h-12 text-muted mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Events Found</h2>
              <p className="text-sm text-muted max-w-sm">
                There are no upcoming events at the moment. Check back later for new events in Beechworth.
              </p>
            </div>
          );
        }
        return (
          <SwipeStack
            events={state.events}
            onEventTap={handleEventTap}
            onEmpty={() => console.log('No more events')}
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
          <h1 className="text-xl font-bold">Event Spark</h1>
        </div>
      </header>

      {/* Subtitle */}
      <div className="text-center py-2 px-4">
        <p className="text-sm text-muted">Discover events in Beechworth</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col">
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
            onSave={handleSave}
            onPass={handlePass}
            showActions={true}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
