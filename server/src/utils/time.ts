export const parseTimeToSeconds = (time: string | number): number => {
  if (typeof time === "number") return time;
  if (!time) return 0;

  const parts = time.split(":").map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;
    return (h * 3600) + (m * 60) + s;
  }
  
  if (parts.length === 2) {
    // MM:SS
    const m = parts[0] ?? 0;
    const s = parts[1] ?? 0;
    return (m * 60) + s;
  }
  
  if (parts.length === 1) {
    // SS
    return parts[0] ?? 0;
  }

  return 0;
};
