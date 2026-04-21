"use client";

export type TrustThemeRole = "primary" | "secondary" | "button" | "surface" | "header";

export type TrustTheme = Record<TrustThemeRole, string>;

export const TRUST_THEME_STORAGE_KEY = "axion-trust-builder-theme";

export const TRUST_THEME_LABELS: Record<
  TrustThemeRole,
  { title: string; description: string }
> = {
  primary: {
    title: "Principal",
    description: "Usada em badges, destaques e elementos de apoio da marca.",
  },
  secondary: {
    title: "Secundária",
    description: "Usada em tabs ativas, chips e áreas suaves de destaque.",
  },
  button: {
    title: "Botões",
    description: "Cor principal dos CTAs visíveis para o visitante.",
  },
  surface: {
    title: "Fundo",
    description: "Base visual das seções públicas e respiro da página.",
  },
  header: {
    title: "Header",
    description: "Faixas de cabeçalho, hero e áreas institucionais.",
  },
};

export const DEFAULT_TRUST_THEME: TrustTheme = {
  primary: "#2563eb",
  secondary: "#dbeafe",
  button: "#2563eb",
  surface: "#f8fbff",
  header: "#eff6ff",
};

export function normalizeHex(hex: string) {
  const safeHex = hex.trim();
  if (safeHex.startsWith("#")) {
    return safeHex;
  }
  return `#${safeHex}`;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function hexToRgbChannels(hex: string) {
  return hexToRgb(hex);
}

export function toRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getContrastColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.67 ? "#0f172a" : "#ffffff";
}

export function loadTrustTheme(): TrustTheme {
  if (typeof window === "undefined") {
    return DEFAULT_TRUST_THEME;
  }

  const savedValue = window.localStorage.getItem(TRUST_THEME_STORAGE_KEY);

  if (!savedValue) {
    return DEFAULT_TRUST_THEME;
  }

  try {
    const parsed = JSON.parse(savedValue) as Partial<TrustTheme>;
    return {
      ...DEFAULT_TRUST_THEME,
      ...parsed,
    };
  } catch {
    return DEFAULT_TRUST_THEME;
  }
}

export function saveTrustTheme(theme: TrustTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TRUST_THEME_STORAGE_KEY, JSON.stringify(theme));
}
