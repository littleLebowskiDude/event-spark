'use client';

import { useState } from 'react';
import EventForm from '@/components/EventForm';
import { Event, CreateEventInput } from '@/lib/types';
import { createEvent } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

export default function NewEventPage() {
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (data: Partial<Event>) => {
    setSubmitError('');

    const result = await createEvent(data as CreateEventInput);

    if (!result.success) {
      setSubmitError(result.error.message);
      throw new Error(result.error.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Add New Event</h1>

      {submitError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
