import { useCallback, useEffect, useMemo, useState } from "react";
import { getRequest, getRequests, setRequestStatus } from "../services/requestApi.js";

export const useRequests = (onCompleted) => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");

  const filteredRequests = useMemo(() => {
    const activeRequests = requests.filter(
      (request) => request.status !== "completed",
    );
    if (dateFilter === "all") return activeRequests;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    let start = startOfToday;
    let end = new Date(startOfToday);
    end.setDate(end.getDate() + 1);

    if (dateFilter === "yesterday") {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      end = startOfToday;
    } else if (dateFilter === "last7") {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
    } else if (dateFilter === "custom") {
      if (!customDate) return [];
      const [year, month, day] = customDate.split("-").map(Number);
      start = new Date(year, month - 1, day);
      end = new Date(year, month - 1, day + 1);
    }

    return activeRequests.filter((request) => {
      const createdAt = new Date(request.created_at);
      return createdAt >= start && createdAt < end;
    });
  }, [requests, dateFilter, customDate]);

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    try {
      const data = await getRequests();
      setRequests(data.requests);
      setError("");
    } catch (requestError) {
      if (!quiet) setError(requestError.message);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(refresh, 0);
    const interval = window.setInterval(() => refresh({ quiet: true }), 4000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const openRequest = async (id) => {
    try {
      const data = await getRequest(id);
      setSelected(data.request);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const changeStatus = async (status) => {
    if (!selected) return;
    try {
      setIsSaving(true);
      const data = await setRequestStatus(selected.id, status);
      if (status === "completed") {
        setSelected(null);
        setRequests((current) =>
          current.filter((entry) => entry.id !== data.request.id),
        );
        onCompleted?.({ quiet: true });
      } else {
        setSelected(data.request);
        setRequests((current) =>
          current.map((entry) =>
            entry.id === data.request.id
              ? { ...entry, status: data.request.status }
              : entry,
          ),
        );
      }
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    requests: filteredRequests,
    selected,
    isLoading,
    isSaving,
    error,
    dateFilter,
    customDate,
    setDateFilter,
    setCustomDate,
    clearError: () => setError(""),
    openRequest,
    closeRequest: () => setSelected(null),
    changeStatus,
  };
};
