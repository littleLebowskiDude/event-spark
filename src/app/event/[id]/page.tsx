import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import EventPageClient from './EventPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventById(id);

  if (!result.success) {
    return {
      title: 'Event Not Found | Event Spark',
      description: 'The event you are looking for could not be found.',
    };
  }

  const event = result.data;
  const dateStr = formatDate(event.start_date);
  const venue = event.venue_name || event.location || '';
  const description = event.description
    ? event.description.slice(0, 160)
    : `${event.title} on ${dateStr}${venue ? ` at ${venue}` : ''}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eventspark.app';
  const eventUrl = `${baseUrl}/event/${id}`;

  return {
    title: `${event.title} | Event Spark`,
    description,
    openGraph: {
      title: event.title,
      description,
      url: eventUrl,
      siteName: 'Event Spark',
      type: 'website',
      ...(event.image_url && {
        images: [
          {
            url: event.image_url,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      ...(event.image_url && {
        images: [event.image_url],
      }),
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  return <EventPageClient eventId={id} />;
}
