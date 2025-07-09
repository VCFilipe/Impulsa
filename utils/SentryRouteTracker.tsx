import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as Sentry from "@sentry/react";

const SentryRouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = location.pathname;

    Sentry.setTag("route", currentRoute);

    Sentry.addBreadcrumb({
      category: "navigation",
      message: `Navigated to ${currentRoute}`,
      level: "info",
      data: {
        pathname: currentRoute,
        search: location.search,
        hash: location.hash,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag("route", currentRoute);
      scope.setContext("route", {
        pathname: currentRoute,
        search: location.search,
        hash: location.hash,
      });
    });

    // Log para debug (remover em produção)
    console.log("Sentry route tracked:", currentRoute);
  }, [location]);

  return null;
};

export default SentryRouteTracker;
