export function formatNaira(num: number) {
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`;
  return `₦${num}`;
}
