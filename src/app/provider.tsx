import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { MainErrorFallback } from "@/components/errors/main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryConfig } from "@/lib/react-query";

function AppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
}

export { AppProvider };
