import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#071A33",
          800: "#102C4F",
          700: "#163A63"
        },
        gold: {
          500: "#D5A63C",
          400: "#E3B85A",
          600: "#B88C2E"
        }
      },
      boxShadow: {
        premium: "0 20px 50px rgba(7,26,51,0.25)"
      },
      backgroundImage: {
        "gold-sheen": "linear-gradient(135deg, #D5A63C 0%, #F1D58A 50%, #B88C2E 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
