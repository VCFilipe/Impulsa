import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";

Sentry.init({
  dsn: "https://9e36fe0e2e67486de76c4386d695a493@o4509633751875584.ingest.us.sentry.io/4509633754693632",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    "https://impulsa-orcin.vercel.app",
    /^https:\/\/impulsa-orcin\.vercel\.app\/api\//,
  ],
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
