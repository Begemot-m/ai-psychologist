import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { PrototypeApp } from "./prototype/PrototypeApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="flex h-screen justify-center bg-[#E9E4F7] sm:py-10">
      <div className="relative h-full w-full overflow-hidden bg-white sm:max-w-[390px] sm:rounded-[44px] sm:border sm:border-black/10 sm:shadow-2xl">
        <PrototypeApp />
      </div>
    </div>
  </StrictMode>,
);
