// Vite configuration.
// Docs: https://vite.dev/config/
//
// Two plugins do all the work:
//   - @vitejs/plugin-react: compiles JSX/React ahead of time (replacing
//     the old Babel-Standalone-in-the-browser approach) and enables
//     Fast Refresh during `npm run dev`.
//   - @tailwindcss/vite: the Tailwind CSS 4 build plugin. It scans the
//     source for utility classes and generates the CSS at build time
//     (replacing the old Tailwind "browser" CDN script).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
