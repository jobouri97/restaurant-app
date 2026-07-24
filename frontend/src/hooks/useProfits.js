import { useCallback, useEffect, useState } from "react";
import { getProfits } from "../services/profitApi.js";

export const useProfits = () => {
  const [profits, setProfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    try {
      const data = await getProfits();
      setProfits(data.profits);
      setError("");
    } catch (requestError) {
      if (!quiet) setError(requestError.message);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(refresh, 0);
    const interval = window.setInterval(() => refresh({ quiet: true }), 10000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return {
    profits,
    isLoading,
    error,
    refresh,
    clearError: () => setError(""),
  };
};
