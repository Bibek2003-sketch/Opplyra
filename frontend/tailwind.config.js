/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Multi-accent text colors
    'text-[#38BDF8]',
    'text-[#34D399]',
    'text-[#FBBF24]',
    'text-[#FB7185]',
    'text-[#7C3AED]',
    'text-[#B69AFF]',
    'text-[#FCD34D]',

    // Multi-accent tinted backgrounds
    'bg-[#38BDF8]/10',
    'bg-[#38BDF8]/12',
    'bg-[#38BDF8]/15',
    'bg-[#38BDF8]/20',
    'bg-[#34D399]/10',
    'bg-[#34D399]/12',
    'bg-[#34D399]/15',
    'bg-[#34D399]/20',
    'bg-[#FBBF24]/10',
    'bg-[#FBBF24]/12',
    'bg-[#FBBF24]/15',
    'bg-[#FBBF24]/20',
    'bg-[#FB7185]/10',
    'bg-[#FB7185]/12',
    'bg-[#FB7185]/15',
    'bg-[#FB7185]/20',
    'bg-[#7C3AED]/12',
    'bg-[#7C3AED]/15',
    'bg-[#7C3AED]/20',
    'bg-[#B69AFF]/12',
    'bg-[#B69AFF]/15',
    'bg-[#B69AFF]/20',

    // Multi-accent borders
    'border-[#38BDF8]/25',
    'border-[#38BDF8]/30',
    'border-[#38BDF8]/35',
    'border-[#38BDF8]/40',
    'hover:border-[#38BDF8]/40',
    'border-[#34D399]/25',
    'border-[#34D399]/30',
    'border-[#34D399]/35',
    'border-[#34D399]/40',
    'hover:border-[#34D399]/40',
    'border-[#FBBF24]/25',
    'border-[#FBBF24]/30',
    'border-[#FBBF24]/35',
    'border-[#FBBF24]/40',
    'hover:border-[#FBBF24]/40',
    'border-[#FB7185]/25',
    'border-[#FB7185]/30',
    'border-[#FB7185]/35',
    'border-[#FB7185]/40',
    'hover:border-[#FB7185]/40',
    'border-[#7C3AED]/25',
    'border-[#7C3AED]/35',
    'border-[#B69AFF]/25',
  ],
  theme: {
    extend: {
      opacity: {
        '05': '0.05',
        '08': '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
        '25': '0.25',
        '30': '0.30',
        '35': '0.35',
        '40': '0.40',
      },
      colors: {
        theme: {
          bg: "#0B0A10", // Main background
          sidebar: "#15121C", // Secondary surface
          secondary: "#15121C", // Secondary surface
          surface: "#15121C", // Secondary surface
          card: "#120F19", // Dark solid base
          cardElevated: "#181423", // Elevated dark base
          border: "rgba(255, 255, 255, 0.10)", // Subtle white glass border
          borderViolet: "rgba(182, 154, 255, 0.18)", // Violet glass border
          text: "#F7F5FC", // Main text
          textSecondary: "#B7B0C7", // Secondary text
          textMuted: "#91899F", // Muted text

          // Primary Brand Accents
          violet: "#7C3AED", // Primary brand violet
          violetHover: "#6D28D9", // Violet hover
          violetSoft: "#B69AFF", // Soft lavender
          lavender: "#B69AFF", // Soft lavender

          // Multi-Accent Category & Status System
          scholarship: "#38BDF8", // Scholarship blue
          internship: "#34D399", // Internship green
          examination: "#FBBF24", // Examination & deadline amber
          deadline: "#FBBF24", // Deadline amber
          jobs: "#FB7185", // Jobs & training coral

          // Status Semantics
          success: "#34D399", // Success green (successful states)
          warning: "#FBBF24", // Warning amber (action required / approaching deadlines)
          error: "#FB7185", // Error coral (rejected / overdue states)
          info: "#38BDF8", // Informational blue (in-progress states)
        },
        glass: {
          surface: "rgba(21, 18, 28, 0.55)",
          elevated: "rgba(26, 22, 35, 0.65)",
          cardHover: "rgba(26, 22, 35, 0.70)",
          sidebar: "rgba(18, 15, 24, 0.85)",
          navbar: "rgba(15, 12, 21, 0.75)",
          border: "rgba(255, 255, 255, 0.10)",
          borderViolet: "rgba(182, 154, 255, 0.18)",
          active: "rgba(124, 58, 237, 0.18)",
          input: "rgba(14, 12, 19, 0.60)",
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
