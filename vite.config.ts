import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJsPlugin(), // Injects CSS into JS
  ],
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
      VITE_CONVEX_URL: JSON.stringify(process.env.VITE_CONVEX_URL),
    },
  },
  build: {
    lib: {
      entry: "src/widget-entry.tsx",
      name: "TourGuideWidget",
      fileName: () => "widget-bundle.js",
      formats: ["umd"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
