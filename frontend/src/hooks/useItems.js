import { useEffect, useState } from "react";
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "../services/itemApi.js";
import { validateImageUrl } from "../utils/validateImageUrl.js";

const createEmptyForm = () => ({
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  isAvailable: true,
  ingredients: [],
});

const toFormItem = (item) => ({
  categoryId: String(item.category_id),
  name: item.name,
  description: item.description || "",
  imageUrl: item.image_url || "",
  price: item.price,
  isAvailable: item.is_available,
  ingredients: item.ingredients.map((ingredient) => ({
    name: ingredient.name,
    options: ingredient.options.map((option) => ({
      optionName: option.optionName,
      isDefault: option.isDefault,
    })),
  })),
});

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    getItems()
      .then((data) => {
        if (isActive) setItems(data.items);
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
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const updateField = ({ name, value }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredients: [{ name: "", options: [] }, ...current.ingredients],
    }));
  };

  const updateIngredient = (ingredientIndex, name) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) =>
        index === ingredientIndex ? { ...ingredient, name } : ingredient,
      ),
    }));
  };

  const removeIngredient = (ingredientIndex) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter(
        (_, index) => index !== ingredientIndex,
      ),
    }));
  };

  const addOption = (ingredientIndex) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) =>
        index === ingredientIndex
          ? {
              ...ingredient,
              options: [
                ...ingredient.options,
                {
                  optionName: "",
                  isDefault: ingredient.options.length === 0,
                },
              ],
            }
          : ingredient,
      ),
    }));
  };

  const updateOption = (ingredientIndex, optionIndex, optionName) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) =>
        index === ingredientIndex
          ? {
              ...ingredient,
              options: ingredient.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex
                  ? { ...option, optionName }
                  : option,
              ),
            }
          : ingredient,
      ),
    }));
  };

  const setDefaultOption = (ingredientIndex, optionIndex) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) =>
        index === ingredientIndex
          ? {
              ...ingredient,
              options: ingredient.options.map((option, currentOptionIndex) => ({
                ...option,
                isDefault: currentOptionIndex === optionIndex,
              })),
            }
          : ingredient,
      ),
    }));
  };

  const removeOption = (ingredientIndex, optionIndex) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) => {
        if (index !== ingredientIndex) return ingredient;

        const removedWasDefault = ingredient.options[optionIndex]?.isDefault;
        const options = ingredient.options.filter(
          (_, currentOptionIndex) => currentOptionIndex !== optionIndex,
        );

        if (removedWasDefault && options.length > 0) {
          options[0] = { ...options[0], isDefault: true };
        }

        return { ...ingredient, options };
      }),
    }));
  };

  const saveItem = async () => {
    setError("");

    try {
      setIsSaving(true);
      await validateImageUrl(form.imageUrl);

      if (editingId) {
        const data = await updateItem(editingId, form);
        setItems((current) =>
          current.map((item) => (item.id === editingId ? data.item : item)),
        );
      } else {
        const data = await createItem(form);
        setItems((current) => [...current, data.item]);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setForm(toFormItem(item));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}" and all its ingredients?`)) return;

    try {
      setError("");
      await deleteItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return {
    items,
    form,
    editingId,
    isLoading,
    isSaving,
    error,
    clearError: () => setError(""),
    resetForm,
    updateField,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addOption,
    updateOption,
    setDefaultOption,
    removeOption,
    saveItem,
    startEditing,
    removeItem,
  };
};
