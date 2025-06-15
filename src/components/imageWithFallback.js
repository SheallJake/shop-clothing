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
  const [currentSrc, setCurrentSrc] = useState("");

  // Validate src prop
  useEffect(() => {
    if (!src || src.trim() === "") {
      setCurrentSrc("/placeholder.svg");
      return;
    }
    try {
      const url = src.trim();
      // If it's already a full URL, use it
      if (url.startsWith("http://") || url.startsWith("https://")) {
        setCurrentSrc(url);
        return;
      }
      // If it's a relative path starting with /, use it
      if (url.startsWith("/")) {
        setCurrentSrc(url);
        return;
      }
      // If it's just a filename, prepend /img/
      setCurrentSrc(`/img/${url}`);
    } catch (error) {
      console.error("Invalid image URL:", src);
      setCurrentSrc("/placeholder.svg");
    }
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
    setCurrentSrc("/placeholder.svg");
  };

  const imgProps = { ...props };
  delete imgProps.priority;

  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
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
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
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
