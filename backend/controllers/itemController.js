import {
  createItem,
  deleteItemById,
  findItemById,
  findItemsByUserId,
  updateItemById,
} from "../models/itemModel.js";

const parseId = (value) => (/^\d+$/.test(value) ? value : null);

const normalizeItemInput = (body = {}) => ({
  categoryId: parseId(String(body.categoryId ?? "")),
  name: typeof body.name === "string" ? body.name.trim() : "",
  description:
    typeof body.description === "string" ? body.description.trim() || null : null,
  imageUrl:
    typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null,
  price: body.price,
  isAvailable:
    typeof body.isAvailable === "boolean" ? body.isAvailable : true,
  ingredients: Array.isArray(body.ingredients)
    ? body.ingredients.map((ingredient) => ({
        name:
          typeof ingredient.name === "string" ? ingredient.name.trim() : "",
        options: Array.isArray(ingredient.options)
          ? ingredient.options.map((option) => ({
              optionName:
                typeof option.optionName === "string"
                  ? option.optionName.trim()
                  : "",
              isDefault: option.isDefault === true,
            }))
          : [],
      }))
    : [],
});

const validateItemInput = (input) => {
  if (!input.categoryId) return "A valid categoryId is required";
  if (!input.name) return "Item name is required";
  if (input.name.length > 150) return "Item name must contain at most 150 characters";

  const numericPrice = Number(input.price);
  if (
    input.price === "" ||
    input.price === null ||
    input.price === undefined ||
    !Number.isFinite(numericPrice) ||
    numericPrice < 0 ||
    numericPrice > 99999999.99
  ) {
    return "Price must be a number between 0 and 99999999.99";
  }
  input.price = numericPrice.toFixed(2);

  for (const ingredient of input.ingredients) {
    if (!ingredient.name) return "Every ingredient must have a name";
    if (ingredient.name.length > 255) {
      return "Ingredient names must contain at most 255 characters";
    }

    let defaultCount = 0;
    const names = new Set();
    for (const option of ingredient.options) {
      if (!option.optionName) return "Every ingredient option must have a name";
      if (option.optionName.length > 255) {
        return "Option names must contain at most 255 characters";
      }
      const normalizedName = option.optionName.toLowerCase();
      if (names.has(normalizedName)) {
        return `Ingredient "${ingredient.name}" contains duplicate options`;
      }
      names.add(normalizedName);
      if (option.isDefault) defaultCount += 1;
    }
    if (defaultCount > 1) {
      return `Ingredient "${ingredient.name}" can have only one default option`;
    }
  }

  return null;
};

export const getItems = async (req, res, next) => {
  try {
    const items = await findItemsByUserId(req.auth.userId);
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item id" });

    const item = await findItemById(id, req.auth.userId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.json({ item });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const input = normalizeItemInput(req.body);
    const validationError = validateItemInput(input);
    if (validationError) return res.status(400).json({ message: validationError });

    const item = await createItem({ userId: req.auth.userId, ...input });
    if (!item) return res.status(404).json({ message: "Category not found" });

    return res.status(201).json({ message: "Item created", item });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Duplicate item or ingredient option" });
    }
    next(error);
  }
};

export const editItem = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item id" });

    const input = normalizeItemInput(req.body);
    const validationError = validateItemInput(input);
    if (validationError) return res.status(400).json({ message: validationError });

    const item = await updateItemById({
      id,
      userId: req.auth.userId,
      ...input,
    });
    if (!item) {
      return res.status(404).json({ message: "Item or category not found" });
    }

    return res.json({ message: "Item updated", item });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Duplicate item or ingredient option" });
    }
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item id" });

    const deletedItem = await deleteItemById(id, req.auth.userId);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
