import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/widget-entry.tsx",
      name: "TourGuideWidget",
      fileName: () => "widget-bundle.js",
      formats: ["umd"],
    },
    rollupOptions: {
      output: {
        // Embed all dependencies (no externals)
        inlineDynamicImports: true,
      },
    },
  },
});
