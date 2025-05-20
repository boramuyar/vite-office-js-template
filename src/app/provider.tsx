import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { MainErrorFallback } from "@/components/errors/main";

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>{children}</HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
}

export { AppProvider };
