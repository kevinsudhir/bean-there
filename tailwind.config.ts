import type { Config } from "tailwindcss";

/**
 * Tailwind is wired to CSS variables (defined in app/globals.css) rather than
 * hardcoded hex values. This is the single source of truth for the palette:
 * change a colour there and the whole app — light and dark — updates.
 *
 * Usage in components: className="bg-card text-ink border-line".
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        ink: "var(--ink)",
        dim: "var(--dim)",
        line: "var(--line)",
        amber: "var(--amber)",
        espresso: "var(--espresso)",
        crema: "var(--crema)",
        saucer: "var(--saucer)",
        empty: "var(--empty)",
        score: "var(--score)",
      },
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
        voice: "var(--font-voice)",
      },
      borderRadius: {
        pill: "100px",
      },
    },
  },
  plugins: [],
};

export default config;
