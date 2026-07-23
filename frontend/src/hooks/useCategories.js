import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoryApi.js";
import { validateImageUrl } from "../utils/validateImageUrl.js";

const emptyForm = { name: "", imageUrl: "" };

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    getCategories()
      .then((data) => {
        if (isActive) setCategories(data.categories);
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const updateForm = ({ name, value }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveCategory = async () => {
    setError("");

    try {
      setIsSaving(true);
      await validateImageUrl(form.imageUrl);

      if (editingId) {
        const data = await updateCategory(editingId, form);
        setCategories((current) =>
          current.map((category) =>
            category.id === editingId ? data.category : category,
          ),
        );
      } else {
        const data = await createCategory(form);
        setCategories((current) => [...current, data.category]);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      imageUrl: category.image_url || "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    try {
      setError("");
      await deleteCategory(category.id);
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      if (editingId === category.id) resetForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return {
    categories,
    form,
    editingId,
    isLoading,
    isSaving,
    error,
    clearError: () => setError(""),
    resetForm,
    updateForm,
    saveCategory,
    startEditing,
    removeCategory,
  };
};
