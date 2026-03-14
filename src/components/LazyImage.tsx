import React, { useState, useEffect, useRef } from 'react';

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
};

export default function LazyImage({ src, alt, className = '', eager = false, referrerPolicy }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [eager]);

  if (hasError) {
    return (
      <div ref={imgRef} className={`${className} flex items-center justify-center bg-sand-100`}>
        <div className="text-center p-4">
          <svg className="w-10 h-10 text-sand-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <p className="text-xs text-sand-400">Imagem indisponível</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`${className} relative overflow-hidden`}>
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 shimmer bg-sand-200" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy={referrerPolicy}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
