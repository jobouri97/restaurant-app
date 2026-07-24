import { findCategoriesByUserId } from "./categoryModel.js";
import { findItemsByUserId } from "./itemModel.js";

export const findPublicMenuByUserId = async (userId) => {
  const [categories, items] = await Promise.all([
    findCategoriesByUserId(userId),
    findItemsByUserId(userId),
  ]);

  return {
    categories,
    items: items.filter((item) => item.is_available),
  };
};
