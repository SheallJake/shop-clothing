"use client";
import { useState, useEffect } from "react";
import { useLoading } from "./LoadingManager";

export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  priority,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { addLoadingImage, removeLoadingImage } = useLoading();

  useEffect(() => {
    if (src) {
      addLoadingImage(src);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]); // Remove addLoadingImage from dependencies

  const imgProps = { ...props };
  delete imgProps.priority;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={error ? "/placeholder.svg" : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setLoaded(true);
          removeLoadingImage(src);
        }}
        onError={() => {
          setError(true);
          setLoaded(true);
          removeLoadingImage(src);
        }}
        {...imgProps}
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
