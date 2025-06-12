"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLoading } from "./LoadingManager";

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
  const { addLoadingImage, removeLoadingImage } = useLoading();
  const hasAddedToLoading = useRef(false);

  // Validate src prop
  const imageSrc = src && src.trim() !== "" ? src : "/placeholder.svg";

  useEffect(() => {
    if (
      imageSrc &&
      imageSrc !== "/placeholder.svg" &&
      !hasAddedToLoading.current
    ) {
      hasAddedToLoading.current = true;
      addLoadingImage(imageSrc);
    }

    return () => {
      if (hasAddedToLoading.current) {
        removeLoadingImage(imageSrc);
        hasAddedToLoading.current = false;
      }
    };
  }, [imageSrc, addLoadingImage, removeLoadingImage]);

  const handleLoad = () => {
    setLoaded(true);
    if (hasAddedToLoading.current) {
      removeLoadingImage(imageSrc);
      hasAddedToLoading.current = false;
    }
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
    if (hasAddedToLoading.current) {
      removeLoadingImage(imageSrc);
      hasAddedToLoading.current = false;
    }
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
