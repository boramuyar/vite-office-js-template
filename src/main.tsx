import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
const root = createRoot(document.getElementById("root")!);

Office.initialize = () => {
  console.log("Office.initialize");
};

Office.onReady(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
