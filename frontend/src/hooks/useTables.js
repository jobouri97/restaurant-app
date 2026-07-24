import { useEffect, useState } from "react";
import {
  createTable,
  deleteTable,
  getTables,
} from "../services/tableApi.js";

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [number, setNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    getTables()
      .then((data) => {
        if (isActive) setTables(data.tables);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const saveTable = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setIsSaving(true);
      const data = await createTable(Number(number));
      setTables((current) =>
        [...current, data.table].sort((a, b) => a.number - b.number),
      );
      setNumber("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeTable = async (table) => {
    if (!window.confirm(`Delete table ${table.number}?`)) return;

    try {
      setError("");
      await deleteTable(table.id);
      setTables((current) => current.filter((item) => item.id !== table.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return {
    tables,
    number,
    isLoading,
    isSaving,
    error,
    setNumber,
    saveTable,
    removeTable,
    clearError: () => setError(""),
  };
};
