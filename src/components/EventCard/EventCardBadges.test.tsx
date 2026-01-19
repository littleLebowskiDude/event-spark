import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventCardBadges from './EventCardBadges';
import { CATEGORY_LABELS, CATEGORY_COLORS, EventCategory } from '@/lib/types';

describe('EventCardBadges', () => {
  describe('Category Badge', () => {
    const categories: EventCategory[] = [
      'music',
      'food',
      'market',
      'art',
      'community',
      'sport',
      'workshop',
      'festival',
      'other',
    ];

    it.each(categories)('should display correct label for %s category', (category) => {
      render(<EventCardBadges category={category} relativeDate="Tomorrow" />);

      expect(screen.getByText(CATEGORY_LABELS[category])).toBeInTheDocument();
    });

    it.each(categories)('should apply correct color class for %s category', (category) => {
      render(<EventCardBadges category={category} relativeDate="Tomorrow" />);

      const badge = screen.getByText(CATEGORY_LABELS[category]);
      expect(badge).toHaveClass(CATEGORY_COLORS[category]);
    });

    it('should display "Event" for null category', () => {
      render(<EventCardBadges category={null} relativeDate="Tomorrow" />);

      expect(screen.getByText('Event')).toBeInTheDocument();
    });

    it('should apply gray color for null category', () => {
      render(<EventCardBadges category={null} relativeDate="Tomorrow" />);

      const badge = screen.getByText('Event');
      expect(badge).toHaveClass('bg-gray-500');
    });
  });

  describe('Relative Date Badge', () => {
    it('should display "Today" with green styling', () => {
      render(<EventCardBadges category="music" relativeDate="Today" />);

      const badge = screen.getByText('Today');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-500');
      expect(badge).toHaveClass('text-white');
    });

    it('should display "Tomorrow" with yellow styling', () => {
      render(<EventCardBadges category="music" relativeDate="Tomorrow" />);

      const badge = screen.getByText('Tomorrow');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-500');
      expect(badge).toHaveClass('text-black');
    });

    it('should display other dates with neutral styling', () => {
      render(<EventCardBadges category="music" relativeDate="In 5 days" />);

      const badge = screen.getByText('In 5 days');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-white/20');
      expect(badge).toHaveClass('text-white');
    });

    it('should display "Next week" with neutral styling', () => {
      render(<EventCardBadges category="music" relativeDate="Next week" />);

      const badge = screen.getByText('Next week');
      expect(badge).toHaveClass('bg-white/20');
    });

    it('should display "Past" with neutral styling', () => {
      render(<EventCardBadges category="music" relativeDate="Past" />);

      const badge = screen.getByText('Past');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Badge Positioning', () => {
    it('should position category badge on the left', () => {
      const { container } = render(
        <EventCardBadges category="music" relativeDate="Tomorrow" />
      );

      const categoryBadgeContainer = container.querySelector('.left-4');
      expect(categoryBadgeContainer).toBeInTheDocument();
      expect(categoryBadgeContainer).toContainElement(screen.getByText('Music'));
    });

    it('should position date badge on the right', () => {
      const { container } = render(
        <EventCardBadges category="music" relativeDate="Tomorrow" />
      );

      const dateBadgeContainer = container.querySelector('.right-4');
      expect(dateBadgeContainer).toBeInTheDocument();
      expect(dateBadgeContainer).toContainElement(screen.getByText('Tomorrow'));
    });
  });

  describe('Badge Styling', () => {
    it('should have rounded-full class on badges', () => {
      render(<EventCardBadges category="music" relativeDate="Tomorrow" />);

      const categoryBadge = screen.getByText('Music');
      const dateBadge = screen.getByText('Tomorrow');

      expect(categoryBadge).toHaveClass('rounded-full');
      expect(dateBadge).toHaveClass('rounded-full');
    });

    it('should have appropriate padding', () => {
      render(<EventCardBadges category="music" relativeDate="Tomorrow" />);

      const categoryBadge = screen.getByText('Music');
      expect(categoryBadge).toHaveClass('px-3', 'py-1');
    });

    it('should have semibold font weight', () => {
      render(<EventCardBadges category="music" relativeDate="Tomorrow" />);

      const categoryBadge = screen.getByText('Music');
      expect(categoryBadge).toHaveClass('font-semibold');
    });
  });
});
