'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event } from '@/lib/types';
import { sampleEvents } from '@/lib/sampleData';
import { Calendar, Users, TrendingUp, Plus, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      // In production, fetch from Supabase
      // const events = await getAllEvents();
      await new Promise(resolve => setTimeout(resolve, 300));
      setEvents(sampleEvents);
      setIsLoading(false);
    };

    loadEvents();
  }, []);

  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date());
  const freeEvents = events.filter(e => e.is_free);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
              <p className="text-2xl font-bold">{events.length}</p>
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
          {events.slice(0, 5).map((event) => (
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
        </div>
      </div>
    </div>
  );
}
