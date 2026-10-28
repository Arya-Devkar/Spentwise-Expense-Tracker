import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, forward /api requests to the FastAPI backend.
    // (In Docker, nginx does this job instead.)
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});