// Mount the app. createRoot attaches the component tree to #root; from
// here on React owns everything inside it. It's imported from
// "react-dom/client" — React 19 ships no UMD globals, so we import the
// API directly instead of reading a `ReactDOM` global.
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Tailwind — bundled by Vite, no CDN needed

createRoot(document.getElementById("root")).render(<App />);
