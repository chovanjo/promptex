/* =================================================================
   SECTION 5 — MOUNT THE APP
   createRoot is the React 18+ way to attach a component tree to a
   DOM element. From here on, React owns everything inside #root.
   (Imported from "react-dom/client" — React 19 ships no UMD globals,
   so we import the API directly instead of reading `ReactDOM`.)
   ================================================================= */
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Tailwind — bundled by Vite, no CDN needed

createRoot(document.getElementById("root")).render(<App />);
