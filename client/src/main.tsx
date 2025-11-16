import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { router } from "./router.tsx";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/error/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
