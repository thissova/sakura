import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

export function LazyImage({ src, alt, className = '', skeletonClassName, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div className={skeletonClassName ?? 'absolute inset-0 bg-sakura-cream animate-pulse rounded-inherit'} />
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 bg-sakura-cream/60 flex items-center justify-center text-gray-400 text-sm">
          —
        </div>
      )}
    </div>
  );
}
