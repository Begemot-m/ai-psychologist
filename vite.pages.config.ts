import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/ai-psychologist/",
  plugins: [react()],
  root: "pages-static",
  build: {
    emptyOutDir: true,
    outDir: "../dist-gh-pages",
  },
});
