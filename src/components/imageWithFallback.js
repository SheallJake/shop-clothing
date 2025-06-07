"use client";
import { useState, useEffect } from "react";
import { useLoading } from "./LoadingManager";
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
  const { addLoadingImage, removeLoadingImage } = useLoading();

  // Validate src prop
  const imageSrc = src && src.trim() !== "" ? src : "/placeholder.svg";

  useEffect(() => {
    if (imageSrc) {
      addLoadingImage(imageSrc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]); // Remove addLoadingImage from dependencies

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
          onLoad={() => {
            setLoaded(true);
            removeLoadingImage(imageSrc);
          }}
          onError={() => {
            setError(true);
            setLoaded(true);
            removeLoadingImage(imageSrc);
          }}
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
        onLoad={() => {
          setLoaded(true);
          removeLoadingImage(imageSrc);
        }}
        onError={() => {
          setError(true);
          setLoaded(true);
          removeLoadingImage(imageSrc);
        }}
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
