"use client";

import { getCountryCode } from "@/lib/country-flags";

// Import flag components dynamically to reduce bundle size
import * as Flags from "country-flag-icons/react/3x2";

interface CountryFlagProps {
  location: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-3",
  md: "w-5 h-4",
  lg: "w-6 h-4",
};

/**
 * Display a country flag based on location name
 * Returns null if no matching flag is found
 */
export function CountryFlag({ location, size = "sm", className = "" }: CountryFlagProps) {
  const countryCode = getCountryCode(location);

  if (!countryCode) {
    return null;
  }

  // Get the flag component for this country code
  const FlagComponent = Flags[countryCode as keyof typeof Flags];

  if (!FlagComponent) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-sm overflow-hidden ${sizeClasses[size]} ${className}`}
      title={location}
    >
      <FlagComponent className="w-full h-full object-cover" />
    </span>
  );
}

/**
 * Display multiple country flags for a list of locations
 */
export function CountryFlags({
  locations,
  size = "sm",
  max = 3,
  className = "",
}: {
  locations: string[];
  size?: "sm" | "md" | "lg";
  max?: number;
  className?: string;
}) {
  const flagsToShow = locations.slice(0, max);
  const remaining = locations.length - max;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {flagsToShow.map((location, index) => (
        <CountryFlag key={`${location}-${index}`} location={location} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-[var(--fg-tertiary)]">+{remaining}</span>
      )}
    </span>
  );
}
