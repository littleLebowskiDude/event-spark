import { describe, it, expect } from 'vitest';
import {
  EventCategorySchema,
  EventSchema,
  CreateEventSchema,
  EventFormSchema,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from './types';

describe('Zod Schemas', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  describe('EventCategorySchema', () => {
    const validCategories = [
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

    it.each(validCategories)('should accept valid category: %s', (category) => {
      const result = EventCategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const result = EventCategorySchema.safeParse('invalid-category');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = EventCategorySchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = EventCategorySchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should have labels for all categories', () => {
      validCategories.forEach((category) => {
        expect(CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]).toBeDefined();
      });
    });

    it('should have colors for all categories', () => {
      validCategories.forEach((category) => {
        expect(CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]).toBeDefined();
      });
    });
  });

  describe('EventSchema', () => {
    const validEvent = {
      id: validUUID,
      title: 'Test Event',
      description: 'A test description',
      image_url: 'https://example.com/image.jpg',
      start_date: tomorrow,
      end_date: nextWeek,
      location: '123 Test St',
      venue_name: 'Test Venue',
      category: 'music',
      ticket_url: 'https://tickets.example.com',
      is_free: false,
      price: '$25',
      created_at: now,
      updated_at: now,
    };

    it('should accept a valid complete event', () => {
      const result = EventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should accept event with null optional fields', () => {
      const minimalEvent = {
        id: validUUID,
        title: 'Minimal Event',
        description: null,
        image_url: null,
        start_date: tomorrow,
        end_date: null,
        location: null,
        venue_name: null,
        category: null,
        ticket_url: null,
        is_free: true,
        price: null,
        created_at: now,
        updated_at: now,
      };
      const result = EventSchema.safeParse(minimalEvent);
      expect(result.success).toBe(true);
    });

    describe('id validation', () => {
      it('should reject invalid UUID', () => {
        const result = EventSchema.safeParse({ ...validEvent, id: 'not-a-uuid' });
        expect(result.success).toBe(false);
      });
    });

    describe('title validation', () => {
      it('should reject empty title', () => {
        const result = EventSchema.safeParse({ ...validEvent, title: '' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Title is required');
        }
      });

      it('should reject title over 200 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, title: 'A'.repeat(201) });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('200 characters');
        }
      });

      it('should accept title at exactly 200 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, title: 'A'.repeat(200) });
        expect(result.success).toBe(true);
      });
    });

    describe('description validation', () => {
      it('should reject description over 5000 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, description: 'B'.repeat(5001) });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('5000 characters');
        }
      });

      it('should accept description at exactly 5000 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, description: 'B'.repeat(5000) });
        expect(result.success).toBe(true);
      });
    });

    describe('URL validations', () => {
      it('should reject invalid image URL', () => {
        const result = EventSchema.safeParse({ ...validEvent, image_url: 'not-a-url' });
        expect(result.success).toBe(false);
      });

      it('should accept empty string for image URL (transforms to null)', () => {
        const result = EventSchema.safeParse({ ...validEvent, image_url: '' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.image_url).toBeNull();
        }
      });

      it('should reject invalid ticket URL', () => {
        const result = EventSchema.safeParse({ ...validEvent, ticket_url: 'not-a-url' });
        expect(result.success).toBe(false);
      });

      it('should accept empty string for ticket URL (transforms to null)', () => {
        const result = EventSchema.safeParse({ ...validEvent, ticket_url: '' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.ticket_url).toBeNull();
        }
      });
    });

    describe('date validations', () => {
      it('should reject invalid start_date format', () => {
        const result = EventSchema.safeParse({ ...validEvent, start_date: 'not-a-date' });
        expect(result.success).toBe(false);
      });

      it('should reject invalid end_date format', () => {
        const result = EventSchema.safeParse({ ...validEvent, end_date: 'not-a-date' });
        expect(result.success).toBe(false);
      });

      it('should accept valid ISO date strings', () => {
        const result = EventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
      });
    });

    describe('location and venue validation', () => {
      it('should reject location over 500 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, location: 'L'.repeat(501) });
        expect(result.success).toBe(false);
      });

      it('should reject venue_name over 200 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, venue_name: 'V'.repeat(201) });
        expect(result.success).toBe(false);
      });
    });

    describe('price validation', () => {
      it('should reject price over 100 characters', () => {
        const result = EventSchema.safeParse({ ...validEvent, price: '$'.repeat(101) });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('CreateEventSchema', () => {
    const validCreateEvent = {
      title: 'New Event',
      description: 'Description',
      image_url: 'https://example.com/image.jpg',
      start_date: tomorrow,
      end_date: nextWeek,
      location: '123 Test St',
      venue_name: 'Test Venue',
      category: 'music',
      ticket_url: 'https://tickets.example.com',
      is_free: false,
      price: '$25',
    };

    it('should accept valid create event data', () => {
      const result = CreateEventSchema.safeParse(validCreateEvent);
      expect(result.success).toBe(true);
    });

    it('should not require id, created_at, or updated_at', () => {
      // These fields should be omitted from CreateEventSchema
      const result = CreateEventSchema.safeParse(validCreateEvent);
      expect(result.success).toBe(true);
    });

    describe('price validation for paid events', () => {
      it('should require price when is_free is false', () => {
        const paidWithoutPrice = {
          ...validCreateEvent,
          is_free: false,
          price: null,
        };
        const result = CreateEventSchema.safeParse(paidWithoutPrice);
        expect(result.success).toBe(false);
        if (!result.success) {
          const priceError = result.error.issues.find((i) => i.path.includes('price'));
          expect(priceError?.message).toContain('Price is required for paid events');
        }
      });

      it('should not require price when is_free is true', () => {
        const freeEvent = {
          ...validCreateEvent,
          is_free: true,
          price: null,
        };
        const result = CreateEventSchema.safeParse(freeEvent);
        expect(result.success).toBe(true);
      });

      it('should accept empty string price when is_free is false', () => {
        const paidEmptyPrice = {
          ...validCreateEvent,
          is_free: false,
          price: '',
        };
        const result = CreateEventSchema.safeParse(paidEmptyPrice);
        expect(result.success).toBe(false);
      });
    });

    describe('date order validation', () => {
      it('should reject end_date before start_date', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const invalidDates = {
          ...validCreateEvent,
          start_date: tomorrow,
          end_date: yesterday,
        };
        const result = CreateEventSchema.safeParse(invalidDates);
        expect(result.success).toBe(false);
        if (!result.success) {
          const dateError = result.error.issues.find((i) => i.path.includes('end_date'));
          expect(dateError?.message).toContain('End date must be after start date');
        }
      });

      it('should accept end_date equal to start_date', () => {
        const sameTime = {
          ...validCreateEvent,
          start_date: tomorrow,
          end_date: tomorrow,
        };
        const result = CreateEventSchema.safeParse(sameTime);
        expect(result.success).toBe(true);
      });

      it('should accept null end_date', () => {
        const noEndDate = {
          ...validCreateEvent,
          end_date: null,
        };
        const result = CreateEventSchema.safeParse(noEndDate);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('EventFormSchema', () => {
    const validFormData = {
      title: 'Form Event',
      description: 'Description',
      image_url: 'https://example.com/image.jpg',
      start_date: '2026-01-25T14:00',
      end_date: '2026-01-25T18:00',
      location: '123 Test St',
      venue_name: 'Test Venue',
      category: 'music',
      ticket_url: 'https://tickets.example.com',
      is_free: false,
      price: '$25',
    };

    it('should accept valid form data', () => {
      const result = EventFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should provide default values for optional fields', () => {
      const minimalForm = {
        title: 'Minimal Form Event',
        start_date: '2026-01-25T14:00',
      };
      const result = EventFormSchema.safeParse(minimalForm);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
        expect(result.data.category).toBe('other');
        expect(result.data.is_free).toBe(true);
      }
    });

    it('should require title', () => {
      const noTitle = { ...validFormData, title: '' };
      const result = EventFormSchema.safeParse(noTitle);
      expect(result.success).toBe(false);
    });

    it('should require start_date', () => {
      const noStartDate = { ...validFormData, start_date: '' };
      const result = EventFormSchema.safeParse(noStartDate);
      expect(result.success).toBe(false);
    });

    describe('form-specific validations', () => {
      it('should accept empty string for optional URL fields', () => {
        const emptyUrls = {
          ...validFormData,
          image_url: '',
          ticket_url: '',
        };
        const result = EventFormSchema.safeParse(emptyUrls);
        expect(result.success).toBe(true);
      });

      it('should apply same price validation for paid events', () => {
        const paidNoPrice = {
          ...validFormData,
          is_free: false,
          price: '',
        };
        const result = EventFormSchema.safeParse(paidNoPrice);
        expect(result.success).toBe(false);
      });

      it('should apply same date order validation', () => {
        const badDates = {
          ...validFormData,
          start_date: '2026-01-25T18:00',
          end_date: '2026-01-25T14:00',
        };
        const result = EventFormSchema.safeParse(badDates);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe('Type Constants', () => {
  describe('CATEGORY_LABELS', () => {
    it('should have human-readable labels', () => {
      expect(CATEGORY_LABELS.music).toBe('Music');
      expect(CATEGORY_LABELS.food).toBe('Food & Drink');
      expect(CATEGORY_LABELS.art).toBe('Art & Culture');
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('should have Tailwind color classes', () => {
      expect(CATEGORY_COLORS.music).toMatch(/^bg-\w+-\d+$/);
      expect(CATEGORY_COLORS.food).toMatch(/^bg-\w+-\d+$/);
    });

    it('should have unique colors for each category', () => {
      const colors = Object.values(CATEGORY_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });
});
