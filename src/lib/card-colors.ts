// Real-world brand colors per issuer, darkened/muted so white card text
// stays readable. Any issuer not in this map gets a deterministic color
// derived from its name, so every new card product is still distinct and
// consistent across app restarts (same issuer -> same color, always).
const ISSUER_TINTS: Record<string, string> = {
  "HDFC Bank": "#0d2b4e",
  "ICICI Bank": "#5a2e0a",
  "SBI Card": "#122a5c",
  "Axis Bank": "#4a0e1f",
  "Kotak Mahindra Bank": "#4d0d10",
  "American Express": "#0a3d4a",
  "Yes Bank": "#1a2f52",
  "IDFC First Bank": "#5c1030",
};

const FALLBACK_HUES = [210, 260, 15, 340, 190, 45, 280, 160, 320, 25];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function fallbackTint(issuer: string): string {
  const hue = FALLBACK_HUES[hashString(issuer) % FALLBACK_HUES.length];
  return hslToHex(hue, 55, 22);
}

export function cardTintForIssuer(issuer: string): string {
  return ISSUER_TINTS[issuer] ?? fallbackTint(issuer);
}
