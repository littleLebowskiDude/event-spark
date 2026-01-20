'use client';

import { useEffect, useReducer } from 'react';
import Link from 'next/link';
import { Event } from '@/lib/types';
import { getAllEvents } from '@/lib/supabase';
import { Calendar, Users, TrendingUp, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

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

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    loadingState: 'loading',
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      dispatch({ type: 'LOADING' });
      const result = await getAllEvents();

      if (cancelled) return;

      if (result.success) {
        dispatch({ type: 'SUCCESS', events: result.data });
      } else {
        dispatch({ type: 'ERROR', message: result.error.message });
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingEvents = state.events.filter(e => new Date(e.start_date) > new Date());
  const freeEvents = state.events.filter(e => e.is_free);

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
        <h2 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h2>
        <p className="text-sm text-muted mb-6 max-w-sm">
          {state.errorMessage || 'Something went wrong while loading the dashboard.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-muted text-sm">Total Events</p>
              <p className="text-2xl font-bold">{state.events.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-muted text-sm">Upcoming Events</p>
              <p className="text-2xl font-bold">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-muted text-sm">Free Events</p>
              <p className="text-2xl font-bold">{freeEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Events</h2>
          <Link href="/admin/events" className="text-accent text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {state.events.slice(0, 5).map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center gap-4 p-4 hover:bg-card-hover transition-colors"
            >
              <div
                className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${event.image_url || '/placeholder-event.svg'})` }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{event.title}</h3>
                <p className="text-sm text-muted">
                  {new Date(event.start_date).toLocaleDateString('en-AU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              {event.is_free ? (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Free
                </span>
              ) : (
                <span className="px-2 py-1 bg-white/10 text-muted text-xs rounded-full">
                  {event.price}
                </span>
              )}
            </Link>
          ))}
          {state.events.length === 0 && (
            <div className="p-8 text-center text-muted">
              No events yet. Create your first event to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
