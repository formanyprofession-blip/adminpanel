import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Warning limit ko 500kb se barha kar 1000kb (1MB) kar dega
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Large libraries ko alag split kar dega performance ke liye
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
