// Ported from the RewardIQ AI web prototype's styles.css theme tokens,
// so the native app starts from the same visual identity.
export const colors = {
  background: "#080808",
  surface: "#141414",
  surface2: "#222222",
  foreground: "#fafafa",
  mutedForeground: "#a0a0a8",
  highlight: "#A5FF00",
  highlightForeground: "#0f0f0f",
  accent: "#00F5FF",
  accentForeground: "#0f0f0f",
  destructive: "#e5484d",
  border: "rgba(255,255,255,0.08)",
} as const;

export type ThemeColors = typeof colors;
