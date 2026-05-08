import React, { useState } from "react";

// Mirrors the slug rule in scripts/generate-sport-avatars.js.
// "Track & Field" → "track-and-field", "Canoe / Kayak" → "canoe-kayak".
export function sportSlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sportAvatarUrl(name) {
  return `${import.meta.env.BASE_URL || "/"}avatars/${sportSlug(name)}.jpg`;
}

/**
 * Square sport avatar with graceful emoji fallback.
 * - `size` controls the rendered px (defaults to 64)
 * - `radius` controls border-radius (defaults to size/2 = circle)
 * - `emoji` is the fallback glyph if the image 404s (e.g. preview without assets)
 */
export function SportAvatar({ sport, emoji, size = 64, radius, style }) {
  const [failed, setFailed] = useState(false);
  const r = radius ?? Math.round(size / 2);
  const baseStyle = {
    width: size,
    height: size,
    borderRadius: r,
    flexShrink: 0,
    display: "block",
    objectFit: "cover",
    background: "#1a0033",
    ...style,
  };
  if (failed) {
    return (
      <div
        aria-label={sport}
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(size * 0.55),
          lineHeight: 1,
        }}
      >
        {emoji ?? "🏅"}
      </div>
    );
  }
  return (
    <img
      src={sportAvatarUrl(sport)}
      alt={sport}
      loading="lazy"
      onError={() => setFailed(true)}
      style={baseStyle}
    />
  );
}
