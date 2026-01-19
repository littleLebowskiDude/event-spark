import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventCardContent from './EventCardContent';
import { createTestEvent, createPaidEvent, createMinimalEvent } from '@/__tests__/fixtures/events';

describe('EventCardContent', () => {
  // Use fixed date for consistent formatting
  const fixedDate = new Date('2026-01-20T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Event Title', () => {
    it('should display the event title', () => {
      const event = createTestEvent({ title: 'Amazing Concert' });
      render(<EventCardContent event={event} />);

      expect(screen.getByText('Amazing Concert')).toBeInTheDocument();
    });

    it('should display long titles with truncation styling', () => {
      const longTitle = 'This is a very long event title that should be truncated when displayed';
      const event = createTestEvent({ title: longTitle });
      render(<EventCardContent event={event} />);

      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('should style title as heading', () => {
      const event = createTestEvent({ title: 'Test Event' });
      render(<EventCardContent event={event} />);

      const titleElement = screen.getByRole('heading', { level: 2 });
      expect(titleElement).toHaveTextContent('Test Event');
      expect(titleElement).toHaveClass('text-2xl', 'font-bold', 'text-white');
    });
  });

  describe('Date Display', () => {
    it('should display formatted date', () => {
      const event = createTestEvent({
        start_date: '2026-01-25T12:00:00.000Z',
      });
      render(<EventCardContent event={event} />);

      // Should show month abbreviation (Jan) somewhere in the output
      // The date format varies by locale, so we check for month presence
      expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });

    it('should have calendar icon', () => {
      const event = createTestEvent();
      const { container } = render(<EventCardContent event={event} />);

      // Calendar icon should be present (aria-hidden)
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Time Display', () => {
    it('should display formatted time', () => {
      const event = createTestEvent({
        start_date: '2026-01-25T14:00:00.000Z',
      });
      render(<EventCardContent event={event} />);

      // Time format varies by locale, but should contain am/pm or hour
      const content = screen.getByText(/\d{1,2}:\d{2}/);
      expect(content).toBeInTheDocument();
    });
  });

  describe('Venue Display', () => {
    it('should display venue name when provided', () => {
      const event = createTestEvent({ venue_name: 'Town Hall' });
      render(<EventCardContent event={event} />);

      expect(screen.getByText('Town Hall')).toBeInTheDocument();
    });

    it('should not display venue section when venue_name is null', () => {
      const event = createMinimalEvent({ venue_name: null });
      render(<EventCardContent event={event} />);

      // There should be no map pin associated text for venue
      // We check that venue name is not in document
      expect(screen.queryByText('Town Hall')).not.toBeInTheDocument();
    });

    it('should truncate long venue names', () => {
      const longVenue = 'This is a very long venue name that should be truncated';
      const event = createTestEvent({ venue_name: longVenue });
      render(<EventCardContent event={event} />);

      const venueElement = screen.getByText(longVenue);
      expect(venueElement).toHaveClass('line-clamp-1');
    });
  });

  describe('Price Display', () => {
    it('should display "Free" badge for free events', () => {
      const event = createTestEvent({ is_free: true });
      render(<EventCardContent event={event} />);

      const freeBadge = screen.getByText('Free');
      expect(freeBadge).toBeInTheDocument();
      expect(freeBadge).toHaveClass('bg-green-500/20', 'text-green-400');
    });

    it('should display price for paid events', () => {
      const event = createPaidEvent({ price: '$25 per person' });
      render(<EventCardContent event={event} />);

      const priceBadge = screen.getByText('$25 per person');
      expect(priceBadge).toBeInTheDocument();
      expect(priceBadge).toHaveClass('bg-white/10', 'text-white');
    });

    it('should not display price badge for paid event without price', () => {
      const event = createTestEvent({ is_free: false, price: null });
      render(<EventCardContent event={event} />);

      expect(screen.queryByText('Free')).not.toBeInTheDocument();
      // No price badge should be shown either
    });

    it('should display price badge with correct styling', () => {
      const event = createTestEvent({ is_free: true });
      render(<EventCardContent event={event} />);

      const badge = screen.getByText('Free');
      expect(badge).toHaveClass('rounded-full', 'text-sm', 'font-medium');
    });
  });

  describe('Layout and Styling', () => {
    it('should position content at the bottom of the card', () => {
      const event = createTestEvent();
      const { container } = render(<EventCardContent event={event} />);

      const contentContainer = container.firstChild;
      expect(contentContainer).toHaveClass('absolute', 'bottom-0', 'left-0', 'right-0');
    });

    it('should have proper padding', () => {
      const event = createTestEvent();
      const { container } = render(<EventCardContent event={event} />);

      const contentContainer = container.firstChild;
      expect(contentContainer).toHaveClass('p-6');
    });

    it('should display icons with proper aria-hidden', () => {
      const event = createTestEvent({ venue_name: 'Test Venue' });
      const { container } = render(<EventCardContent event={event} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThanOrEqual(3); // Calendar, Clock, MapPin
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const event = createTestEvent({ title: 'Accessible Event' });
      render(<EventCardContent event={event} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Accessible Event');
    });

    it('should have sufficient color contrast classes', () => {
      const event = createTestEvent();
      render(<EventCardContent event={event} />);

      // Title should be white on dark background
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('text-white');
    });
  });
});
