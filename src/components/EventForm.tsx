'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventCategory, CATEGORY_LABELS, EventFormSchema } from '@/lib/types';
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';
import { ZodError } from 'zod';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Partial<Event>) => Promise<void>;
}

type FormErrors = {
  [key: string]: string;
};

export default function EventForm({ event, onSubmit }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string>('');
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    image_url: event?.image_url || '',
    start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    venue_name: event?.venue_name || '',
    category: event?.category || 'other',
    ticket_url: event?.ticket_url || '',
    is_free: event?.is_free ?? true,
    price: event?.price || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      EventFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        // Zod v4 uses 'issues' instead of 'errors'
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!newErrors[path]) {
            newErrors[path] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        category: formData.category as EventCategory,
        price: formData.is_free ? null : formData.price,
        description: formData.description || null,
        image_url: formData.image_url || null,
        location: formData.location || null,
        venue_name: formData.venue_name || null,
        ticket_url: formData.ticket_url || null,
      };

      await onSubmit(submitData);
      router.push('/admin/events');
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  const inputClassName = (fieldName: string) => cn(
    'w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors',
    getFieldError(fieldName)
      ? 'border-red-500 focus:ring-red-500'
      : 'border-border focus:ring-accent'
  );

  const FieldError = ({ fieldName }: { fieldName: string }) => {
    const error = getFieldError(fieldName);
    if (!error) return null;
    return (
      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form-level error */}
      {formError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{formError}</p>
        </div>
      )}

      {/* Image Preview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <label className="block text-sm font-medium mb-2">Event Image</label>
        <div className="flex gap-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center">
            {formData.image_url ? (
              <OptimizedImage
                src={formData.image_url}
                alt="Event preview"
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClassName('image_url')}
            />
            <FieldError fieldName="image_url" />
            <p className="text-xs text-muted mt-2">
              Enter a URL for the event image. Recommended size: 800x600px
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputClassName('title')}
          />
          <FieldError fieldName="title" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={cn(inputClassName('description'), 'resize-none')}
          />
          <FieldError fieldName="description" />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputClassName('category')}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError fieldName="category" />
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Date & Time</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={inputClassName('start_date')}
            />
            <FieldError fieldName="start_date" />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={inputClassName('end_date')}
            />
            <FieldError fieldName="end_date" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Location</h2>

        <div>
          <label htmlFor="venue_name" className="block text-sm font-medium mb-2">
            Venue Name
          </label>
          <input
            type="text"
            id="venue_name"
            name="venue_name"
            value={formData.venue_name}
            onChange={handleChange}
            placeholder="e.g. Beechworth Town Hall"
            className={inputClassName('venue_name')}
          />
          <FieldError fieldName="venue_name" />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Address
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. 101 Ford St, Beechworth VIC 3747"
            className={inputClassName('location')}
          />
          <FieldError fieldName="location" />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="font-semibold">Pricing</h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_free"
            name="is_free"
            checked={formData.is_free}
            onChange={handleChange}
            className="w-5 h-5 rounded border-border bg-background text-accent focus:ring-accent"
          />
          <label htmlFor="is_free" className="text-sm font-medium">
            This is a free event
          </label>
        </div>

        {!formData.is_free && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price *
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. $25 per person"
              className={inputClassName('price')}
            />
            <FieldError fieldName="price" />
          </div>
        )}

        <div>
          <label htmlFor="ticket_url" className="block text-sm font-medium mb-2">
            Ticket / More Info URL
          </label>
          <input
            type="url"
            id="ticket_url"
            name="ticket_url"
            value={formData.ticket_url}
            onChange={handleChange}
            placeholder="https://example.com/tickets"
            className={inputClassName('ticket_url')}
          />
          <FieldError fieldName="ticket_url" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 px-6 bg-card border border-border rounded-lg hover:bg-card-hover transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            event ? 'Update Event' : 'Create Event'
          )}
        </button>
      </div>
    </form>
  );
}
