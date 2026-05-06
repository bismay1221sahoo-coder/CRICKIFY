import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Sentry } from "./lib/sentry";

function ErrorFallback() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 text-center shadow-md">
        <h1 className="text-xl font-black text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">Please refresh the page and try again.</p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
