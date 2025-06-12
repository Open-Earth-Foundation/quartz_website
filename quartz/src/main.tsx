import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

console.log("🌟 main.tsx starting - React application initializing...");

// Check if root element exists
const rootElement = document.getElementById("root");
console.log("🎯 Root element:", rootElement ? "✅ Found" : "❌ Not found");

if (!rootElement) {
  console.error("💥 Root element not found!");
  throw new Error("Root element not found");
}

console.log("⚛️ Creating React root...");
const root = createRoot(rootElement);

console.log("🚀 Rendering App component...");
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log("✅ React application rendering initiated");
