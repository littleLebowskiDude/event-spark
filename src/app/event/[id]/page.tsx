'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import { sampleEvents } from '@/lib/sampleData';
import EventDetail from '@/components/EventDetail';
import { Loader2 } from 'lucide-react';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      // In production, this would fetch from Supabase
      // const event = await getEventById(params.id as string);
      const foundEvent = sampleEvents.find(e => e.id === params.id);
      setEvent(foundEvent || null);
      setIsLoading(false);
    };

    if (params.id) {
      loadEvent();
    }
  }, [params.id]);

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!event) {
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
      event={event}
      onClose={handleClose}
      showActions={true}
    />
  );
}
