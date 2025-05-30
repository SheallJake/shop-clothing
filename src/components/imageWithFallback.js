'use client'
import { useState } from 'react';

export default function ImageWithFallback({ src, alt = '', className = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={error ? '/placeholder.svg' : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...props}
      />
      {!loaded && (
        <img
          src="/placeholder.svg"
          alt="loading"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />
      )}
    </div>
  );
}
