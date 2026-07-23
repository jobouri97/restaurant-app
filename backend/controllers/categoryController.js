import {
  createCategory,
  deleteCategoryById,
  findCategoriesByUserId,
  findCategoryById,
  updateCategoryById,
} from "../models/categoryModel.js";

const parseCategoryId = (value) => (/^\d+$/.test(value) ? value : null);

const normalizeCategoryInput = (body) => ({
  name: body.name?.trim(),
  imageUrl:
    typeof body.imageUrl === "string"
      ? body.imageUrl.trim() || null
      : null,
});

const validateCategoryInput = ({ name }) => {
  if (!name) {
    return "Category name is required";
  }

  if (name.length > 150) {
    return "Category name must contain at most 150 characters";
  }

  return null;
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await findCategoriesByUserId(req.auth.userId);
    return res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const id = parseCategoryId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await findCategoryById(id, req.auth.userId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ category });
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    const input = normalizeCategoryInput(req.body);
    const validationError = validateCategoryInput(input);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const category = await createCategory({
      userId: req.auth.userId,
      ...input,
    });

    return res.status(201).json({
      message: "Category created",
      category,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  try {
    const id = parseCategoryId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const input = normalizeCategoryInput(req.body);
    const validationError = validateCategoryInput(input);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const category = await updateCategoryById({
      id,
      userId: req.auth.userId,
      ...input,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      message: "Category updated",
      category,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    next(error);
  }
};

export const removeCategory = async (req, res, next) => {
  try {
    const id = parseCategoryId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const deletedCategory = await deleteCategoryById(id, req.auth.userId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
