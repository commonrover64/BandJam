// rooms.image_url is a TEXT[] column, so the API always returns an array.
// Normalise it here so every component gets either a URL string or null.
export const coverImage = (imageUrl) => {
  if (Array.isArray(imageUrl)) return imageUrl.find(Boolean) || null;
  if (typeof imageUrl === "string" && imageUrl.length > 0) return imageUrl;
  return null;
};

// Format a Date as YYYY-MM-DD in the *device's* timezone.
// toISOString() converts to UTC first, which shifts the day for IST users
// booking between midnight and 5:30 AM.
export const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isValidCoord = (lat, lng) =>
  Number.isFinite(parseFloat(lat)) && Number.isFinite(parseFloat(lng));
