/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
        panel: {
          bg: 'var(--panel-bg)',
          card: 'var(--panel-card)',
          sidebar: 'var(--panel-sidebar)',
          header: 'var(--panel-header)',
          hover: 'var(--panel-hover)',
        },
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        badge: {
          pendingBg: 'var(--badge-pending-bg)',
          pendingText: 'var(--badge-pending-text)',
          shippedBg: 'var(--badge-shipped-bg)',
          shippedText: 'var(--badge-shipped-text)',
          deliveredBg: 'var(--badge-delivered-bg)',
          deliveredText: 'var(--badge-delivered-text)',
        }
      },
    },
  },
  plugins: [],
}
