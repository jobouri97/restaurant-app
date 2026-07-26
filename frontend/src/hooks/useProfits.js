import { useCallback, useEffect, useState } from "react";
import {
  getProfitDetails,
  getProfits,
} from "../services/profitApi.js";

export const useProfits = () => {
  const [profits, setProfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [loadingProfitId, setLoadingProfitId] = useState(null);

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

  const openProfit = async (id) => {
    try {
      setLoadingProfitId(id);
      const data = await getProfitDetails(id);
      setSelected(data.profit);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingProfitId(null);
    }
  };

  return {
    profits,
    isLoading,
    error,
    selected,
    loadingProfitId,
    refresh,
    openProfit,
    closeProfit: () => setSelected(null),
    clearError: () => setError(""),
  };
};
