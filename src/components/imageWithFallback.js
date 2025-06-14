"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  priority,
  fill,
  width,
  height,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Validate src prop
  const imageSrc = (() => {
    if (!src || src.trim() === "") return "/placeholder.svg";
    try {
      const url = src.trim();
      // If it's already a full URL, return it
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      // If it's a relative path starting with /, return it
      if (url.startsWith("/")) {
        return url;
      }
      // If it's just a filename, prepend /img/
      return `/img/${url}`;
    } catch (error) {
      console.error("Invalid image URL:", src);
      return "/placeholder.svg";
    }
  })();

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const imgProps = { ...props };
  delete imgProps.priority;

  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={error ? "/placeholder.svg" : imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          fill
          {...imgProps}
        />
        {!loaded && (
          <Image
            src="/placeholder.svg"
            alt="loading"
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
            fill
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={error ? "/placeholder.svg" : imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        width={width || 500}
        height={height || 500}
        {...imgProps}
      />
      {!loaded && (
        <Image
          src="/placeholder.svg"
          alt="loading"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          width={width || 500}
          height={height || 500}
        />
      )}
    </div>
  );
}
