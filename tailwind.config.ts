import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
        },
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        background: "rgb(var(--color-bg) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "border-hover": "rgb(var(--color-border-hover) / <alpha-value>)",
        text: {
          main: "rgb(var(--color-text-main) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-text-subtle) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          bg: "rgb(var(--color-success-bg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          bg: "rgb(var(--color-warning-bg) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--color-error) / <alpha-value>)",
          bg: "rgb(var(--color-error-bg) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          bg: "rgb(var(--color-info-bg) / <alpha-value>)",
        },
        discount: {
          DEFAULT: "rgb(var(--color-discount) / <alpha-value>)",
          bg: "rgb(var(--color-discount-bg) / <alpha-value>)",
        },
        campaign: {
          DEFAULT: "rgb(var(--color-campaign) / <alpha-value>)",
          bg: "rgb(var(--color-campaign-bg) / <alpha-value>)",
        },
        "fast-delivery": "rgb(var(--color-fast-delivery) / <alpha-value>)",
        bestseller: "rgb(var(--color-bestseller) / <alpha-value>)",
      },
      maxWidth: {
        standard: "var(--container-max-standard)",
        wide: "var(--container-max-wide)",
        grid: "var(--container-max-grid)",
      },
      spacing: {
        '4.5': '1.125rem',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
    },
  },
  plugins: [],
};
export default config;
