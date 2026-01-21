'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
}

const PLACEHOLDER_IMAGE = '/placeholder-event.svg';

// Simple blur placeholder - a tiny gray gradient
const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkMWQ1ZGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  quality = 80,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Use placeholder if src is null/undefined or if there was a load error
  const imageSrc = (!src || error) ? PLACEHOLDER_IMAGE : src;
  const isPlaceholder = imageSrc === PLACEHOLDER_IMAGE;

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
        quality={quality}
        placeholder={isPlaceholder ? 'empty' : 'blur'}
        blurDataURL={isPlaceholder ? undefined : blurDataURL}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={sizes}
      quality={quality}
      placeholder={isPlaceholder ? 'empty' : 'blur'}
      blurDataURL={isPlaceholder ? undefined : blurDataURL}
      onError={() => setError(true)}
    />
  );
}

export default OptimizedImage;
