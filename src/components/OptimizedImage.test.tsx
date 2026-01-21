import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

// Mock next/image component
vi.mock('next/image', () => ({
  default: vi.fn((props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} data-testid="next-image" />;
  }),
}));

// Import the mocked module to access the mock function
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder-event.svg';
const BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkMWQ1ZGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

// Helper to get the props passed to the mocked Image component
function getImageProps(callIndex = 0) {
  return vi.mocked(Image).mock.calls[callIndex][0];
}

// Helper to get the last call props
function getLastImageProps() {
  const calls = vi.mocked(Image).mock.calls;
  return calls[calls.length - 1][0];
}

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Source Rendering', () => {
    it('should render with valid src', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={400}
          height={300}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('should pass src to Next.js Image component', () => {
      render(
        <OptimizedImage
          src="https://example.com/test.png"
          alt="Another test"
          width={200}
          height={150}
        />
      );

      const props = getImageProps();
      expect(props.src).toBe('https://example.com/test.png');
      expect(props.alt).toBe('Another test');
    });
  });

  describe('Null/Undefined Source Fallback', () => {
    it('should fall back to placeholder when src is null', () => {
      render(
        <OptimizedImage
          src={null}
          alt="Null src test"
          width={400}
          height={300}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', PLACEHOLDER_IMAGE);
    });

    it('should fall back to placeholder when src is undefined', () => {
      render(
        <OptimizedImage
          src={undefined}
          alt="Undefined src test"
          width={400}
          height={300}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', PLACEHOLDER_IMAGE);
    });

    it('should use empty string src gracefully', () => {
      // Empty string is falsy, should fall back to placeholder
      render(
        <OptimizedImage
          src=""
          alt="Empty src test"
          width={400}
          height={300}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', PLACEHOLDER_IMAGE);
    });
  });

  describe('Error Handling', () => {
    it('should fall back to placeholder on image load error', () => {
      render(
        <OptimizedImage
          src="https://example.com/broken-image.jpg"
          alt="Error test"
          width={400}
          height={300}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', 'https://example.com/broken-image.jpg');

      // Simulate error event
      fireEvent.error(image);

      // After error, should show placeholder
      const updatedImage = screen.getByTestId('next-image');
      expect(updatedImage).toHaveAttribute('src', PLACEHOLDER_IMAGE);
    });

    it('should provide onError handler to Image component', () => {
      render(
        <OptimizedImage
          src="https://example.com/broken.png"
          alt="Error handler test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(typeof props.onError).toBe('function');
    });
  });

  describe('Fill Mode', () => {
    it('should render in fill mode when fill=true', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Fill mode test"
          fill={true}
        />
      );

      const props = getImageProps();
      expect(props.fill).toBe(true);
    });

    it('should not pass width and height when fill=true', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Fill mode test"
          fill={true}
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.fill).toBe(true);
      expect(props).not.toHaveProperty('width');
      expect(props).not.toHaveProperty('height');
    });
  });

  describe('Explicit Dimensions', () => {
    it('should render with explicit width/height when fill=false', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Dimensions test"
          fill={false}
          width={800}
          height={600}
        />
      );

      const props = getImageProps();
      expect(props.width).toBe(800);
      expect(props.height).toBe(600);
    });

    it('should default fill to false', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Default fill test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.width).toBe(400);
      expect(props.height).toBe(300);
      // Should not have fill prop set to true
      expect(props.fill).toBeFalsy();
    });
  });

  describe('Priority Prop', () => {
    it('should pass priority prop correctly when true', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Priority test"
          width={400}
          height={300}
          priority={true}
        />
      );

      const props = getImageProps();
      expect(props.priority).toBe(true);
    });

    it('should pass priority prop correctly when false', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Priority test"
          width={400}
          height={300}
          priority={false}
        />
      );

      const props = getImageProps();
      expect(props.priority).toBe(false);
    });

    it('should default priority to false', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Default priority test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.priority).toBe(false);
    });
  });

  describe('ClassName Prop', () => {
    it('should pass className prop correctly', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="ClassName test"
          width={400}
          height={300}
          className="rounded-lg object-cover"
        />
      );

      const props = getImageProps();
      expect(props.className).toBe('rounded-lg object-cover');
    });

    it('should default className to empty string', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Default className test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.className).toBe('');
    });

    it('should apply className to the image element', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="ClassName element test"
          width={400}
          height={300}
          className="test-class"
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('test-class');
    });
  });

  describe('Sizes Prop', () => {
    it('should pass sizes prop correctly', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Sizes test"
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      );

      const props = getImageProps();
      expect(props.sizes).toBe('(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
    });

    it('should handle undefined sizes prop', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="No sizes test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.sizes).toBeUndefined();
    });
  });

  describe('Quality Prop', () => {
    it('should use default quality of 80', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Default quality test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.quality).toBe(80);
    });

    it('should accept custom quality value', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Custom quality test"
          width={400}
          height={300}
          quality={90}
        />
      );

      const props = getImageProps();
      expect(props.quality).toBe(90);
    });

    it('should accept low quality value', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Low quality test"
          width={400}
          height={300}
          quality={50}
        />
      );

      const props = getImageProps();
      expect(props.quality).toBe(50);
    });
  });

  describe('Placeholder Behavior', () => {
    it('should use blur placeholder for non-placeholder images', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Blur placeholder test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.placeholder).toBe('blur');
      expect(props.blurDataURL).toBe(BLUR_DATA_URL);
    });

    it('should use empty placeholder for placeholder image', () => {
      render(
        <OptimizedImage
          src={null}
          alt="Empty placeholder test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.placeholder).toBe('empty');
      expect(props.blurDataURL).toBeUndefined();
    });

    it('should use empty placeholder when src is undefined', () => {
      render(
        <OptimizedImage
          src={undefined}
          alt="Undefined empty placeholder test"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.placeholder).toBe('empty');
      expect(props.blurDataURL).toBeUndefined();
    });

    it('should switch to empty placeholder after error', () => {
      render(
        <OptimizedImage
          src="https://example.com/broken.jpg"
          alt="Error empty placeholder test"
          width={400}
          height={300}
        />
      );

      // Initially should have blur placeholder
      const initialProps = getImageProps();
      expect(initialProps.placeholder).toBe('blur');

      // Trigger error
      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      // After error, should use empty placeholder since it's now showing placeholder image
      const updatedProps = getLastImageProps();
      expect(updatedProps.placeholder).toBe('empty');
      expect(updatedProps.blurDataURL).toBeUndefined();
    });
  });

  describe('Fill Mode vs Explicit Dimensions', () => {
    it('should render differently for fill vs explicit dimensions', () => {
      const { rerender } = render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test"
          fill={true}
        />
      );

      const fillProps = getImageProps();
      expect(fillProps.fill).toBe(true);

      vi.clearAllMocks();

      rerender(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test"
          width={400}
          height={300}
        />
      );

      const explicitProps = getImageProps();
      expect(explicitProps.width).toBe(400);
      expect(explicitProps.height).toBe(300);
    });
  });

  describe('Alt Text', () => {
    it('should always pass alt text to image', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Descriptive alt text for accessibility"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.alt).toBe('Descriptive alt text for accessibility');
    });

    it('should pass alt text even when using placeholder', () => {
      render(
        <OptimizedImage
          src={null}
          alt="Placeholder alt text"
          width={400}
          height={300}
        />
      );

      const props = getImageProps();
      expect(props.alt).toBe('Placeholder alt text');
    });
  });

  describe('Combined Props', () => {
    it('should handle all props together in fill mode', () => {
      render(
        <OptimizedImage
          src="https://example.com/hero.jpg"
          alt="Hero image"
          fill={true}
          priority={true}
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      );

      const props = getImageProps();
      expect(props.src).toBe('https://example.com/hero.jpg');
      expect(props.alt).toBe('Hero image');
      expect(props.fill).toBe(true);
      expect(props.priority).toBe(true);
      expect(props.className).toBe('object-cover');
      expect(props.sizes).toBe('100vw');
      expect(props.quality).toBe(90);
      expect(props.placeholder).toBe('blur');
      expect(props.blurDataURL).toBe(BLUR_DATA_URL);
    });

    it('should handle all props together with explicit dimensions', () => {
      render(
        <OptimizedImage
          src="https://example.com/thumbnail.jpg"
          alt="Thumbnail"
          width={200}
          height={150}
          priority={false}
          className="rounded-md"
          sizes="200px"
          quality={75}
        />
      );

      const props = getImageProps();
      expect(props.src).toBe('https://example.com/thumbnail.jpg');
      expect(props.alt).toBe('Thumbnail');
      expect(props.width).toBe(200);
      expect(props.height).toBe(150);
      expect(props.priority).toBe(false);
      expect(props.className).toBe('rounded-md');
      expect(props.sizes).toBe('200px');
      expect(props.quality).toBe(75);
      expect(props.placeholder).toBe('blur');
      expect(props.blurDataURL).toBe(BLUR_DATA_URL);
    });
  });
});
