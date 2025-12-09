import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/widget.js",
      name: "TourGuideWidget",
      fileName: () => "widget-bundle.js",
      formats: ["umd"],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      // external: ["react", "react-dom", "framer-motion", "lucide-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "framer-motion": "framerMotion",
          "lucide-react": "LucideReact",
        },
      },
    },
  },
});
