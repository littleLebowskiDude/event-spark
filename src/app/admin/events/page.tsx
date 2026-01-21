'use client';

import { useState, useEffect, useReducer, useMemo } from 'react';
import Link from 'next/link';
import { Event, CATEGORY_LABELS } from '@/lib/types';
import { getAllEvents, deleteEvent as deleteEventApi } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Loader2, Search, AlertCircle, RefreshCw } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

type LoadingState = 'loading' | 'success' | 'error';

type State = {
  events: Event[];
  loadingState: LoadingState;
  errorMessage: string;
};

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; events: Event[] }
  | { type: 'ERROR'; message: string }
  | { type: 'DELETE_EVENT'; eventId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loadingState: 'loading', errorMessage: '' };
    case 'SUCCESS':
      return { events: action.events, loadingState: 'success', errorMessage: '' };
    case 'ERROR':
      return { ...state, loadingState: 'error', errorMessage: action.message };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.eventId) };
  }
}

export default function AdminEventsPage() {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    loadingState: 'loading',
    errorMessage: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Use useMemo for filtered events instead of useEffect + setState
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return state.events;
    return state.events.filter(
      e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, state.events]);

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
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteEventApi(id);

    if (result.success) {
      dispatch({ type: 'DELETE_EVENT', eventId: id });
      setDeleteId(null);
    } else {
      setDeleteError(result.error.message);
    }

    setIsDeleting(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteId(null);
    setDeleteError('');
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
        <h2 className="text-lg font-semibold mb-2">Unable to Load Events</h2>
        <p className="text-sm text-muted mb-6 max-w-sm">
          {state.errorMessage || 'Something went wrong while loading events. Please try again.'}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
        />
      </div>

      {/* Events Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-muted">Event</th>
                <th className="text-left p-4 text-sm font-semibold text-muted">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-muted">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-muted">Price</th>
                <th className="text-right p-4 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-card-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={event.image_url}
                          alt={event.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs">{event.title}</p>
                        <p className="text-sm text-muted truncate max-w-xs">{event.venue_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(event.start_date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/10 text-xs rounded-full">
                      {event.category ? CATEGORY_LABELS[event.category] : 'Other'}
                    </span>
                  </td>
                  <td className="p-4">
                    {event.is_free ? (
                      <span className="text-green-400 text-sm">Free</span>
                    ) : (
                      <span className="text-sm">{event.price}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="p-2 text-muted hover:text-accent transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center text-muted">
            No events found.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Event</h3>
            <p className="text-muted mb-4">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-card border border-border rounded-lg hover:bg-card-hover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
