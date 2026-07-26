import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getRequest, getRequests, setRequestStatus } from "../services/requestApi.js";
import {
  getRequestExpiryTime,
  isRequestExpired,
} from "../utils/requestExpiry.js";

export const useRequests = (onCompleted, onNewRequest) => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");

  const filteredRequests = useMemo(() => {
    const activeRequests = requests.filter(
      (request) => !isRequestExpired(request),
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    socket.on("request:created", () => {
      onNewRequest?.();
      refresh({ quiet: true });
    });

    return () => socket.disconnect();
  }, [onNewRequest, refresh]);

  useEffect(() => {
    const now = Date.now();
    const expiryTimes = requests
      .map(getRequestExpiryTime)
      .filter((expiryTime) => expiryTime !== null);

    if (!expiryTimes.length) return undefined;

    const delay = Math.max(0, Math.min(...expiryTimes) - now);
    const timeout = window.setTimeout(() => {
      const expiryCheckTime = Date.now();
      setRequests((current) =>
        current.filter(
          (request) => !isRequestExpired(request, expiryCheckTime),
        ),
      );
      setSelected((current) =>
        current && isRequestExpired(current, expiryCheckTime) ? null : current,
      );
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [requests]);

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
      setSelected(data.request);
      setRequests((current) =>
        current.map((entry) =>
          entry.id === data.request.id
            ? {
                ...entry,
                status: data.request.status,
                status_changed_at: data.request.status_changed_at,
              }
            : entry,
        ),
      );
      if (status === "completed") onCompleted?.({ quiet: true });
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
