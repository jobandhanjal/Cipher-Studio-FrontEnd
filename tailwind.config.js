module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Use CSS variables for colors so runtime theme switching works via the .dark class
      colors: {
        primary: 'var(--color-primary, #6366f1)',
        background: 'var(--color-background, #18181b)',
        surface: 'var(--color-surface, #27272a)',
        border: 'var(--color-border, #3f3f46)',
        accent: 'var(--color-accent, #ec4899)',
        error: 'var(--color-error, #ef4444)',
        text: 'var(--color-text, #f4f4f5)',
        muted: 'var(--color-muted, #a1a1aa)',
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "2rem",
        xl: "4rem",
      },
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        full: "9999px",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
