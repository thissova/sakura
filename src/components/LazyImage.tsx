import React, { useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  /** Set on above-the-fold images so they are not deferred. */
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  className = "",
  skeletonClassName,
  priority = false,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div
          className={
            skeletonClassName ??
            "absolute inset-0 bg-sakura-cream animate-pulse rounded-inherit"
          }
        />
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // Only emitted when it says something: "auto" is the default, so
          // setting it everywhere just added an attribute that changes nothing.
          // All-lowercase on purpose — React 18 does not know the camelCase
          // `fetchPriority` prop, it warns and drops it, so the hint never
          // reached the DOM at all. React 19 adds it; this spelling works today.
          {...(priority ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
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
