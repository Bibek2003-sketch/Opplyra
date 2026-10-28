/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "#08080D", // Main page background
          sidebar: "#0D0B13", // Secondary black / Sidebar background
          secondary: "#0D0B13", // Secondary background
          card: "#0E0C15", // Dark solid base
          cardElevated: "#16121F", // Elevated dark base
          border: "rgba(255, 255, 255, 0.12)", // Subtle white glass border
          borderViolet: "rgba(167, 139, 250, 0.18)", // Violet glass border
          text: "#F7F5FC", // Main text
          textSecondary: "#B7B0C7", // Secondary text
          textMuted: "#91899F", // Muted text

          // Violet Accents
          violet: "#7C3AED", // Primary violet action
          violetHover: "#6D28D9", // Violet hover
          violetSoft: "#A78BFA", // Soft violet
          lavender: "#C4B5FD", // Soft lavender

          // Status Accents
          success: "#34D399", // Success green
          warning: "#FBBF24", // Warning amber
          error: "#FB7185", // Error pink/red
          info: "#60A5FA", // Informational blue
        },
        glass: {
          surface: "rgba(14, 12, 21, 0.55)",
          elevated: "rgba(22, 18, 31, 0.62)",
          cardHover: "rgba(22, 18, 31, 0.65)",
          sidebar: "rgba(13, 11, 19, 0.75)",
          navbar: "rgba(13, 11, 19, 0.70)",
          border: "rgba(255, 255, 255, 0.12)",
          borderViolet: "rgba(167, 139, 250, 0.18)",
          active: "rgba(124, 58, 237, 0.18)",
          input: "rgba(10, 8, 15, 0.55)",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        card: "0 4px 16px -2px rgba(0, 0, 0, 0.5)",
        glass:
          "0 8px 32px 0 rgba(0, 0, 0, 0.24), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
        "glass-elevated":
          "0 8px 32px 0 rgba(0, 0, 0, 0.28), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        "glass-hover":
          "0 10px 30px -4px rgba(0, 0, 0, 0.30), 0 0 14px rgba(124, 58, 237, 0.10), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        modal:
          "0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
      },
    },
  },
  plugins: [],
};
