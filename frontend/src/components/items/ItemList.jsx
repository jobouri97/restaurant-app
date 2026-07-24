import { useState } from "react";
import ItemCard from "./ItemCard.jsx";
import ItemCategoryFilter from "./ItemCategoryFilter.jsx";

function ItemList({ items, categories, isLoading, onEdit, onDelete }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categoryNames = new Map(
    categories.map((category) => [String(category.id), category.name]),
  );
  const filteredItems =
    categoryFilter === "all"
      ? items
      : items.filter(
          (item) => String(item.category_id) === String(categoryFilter),
        );

  return (
    <section className="categories-section" aria-labelledby="items-title">
      <div className="section-heading">
        <div>
          <h2 id="items-title">Your menu items</h2>
          <p>Manage dishes, availability, ingredients, and choices.</p>
        </div>
        <ItemCategoryFilter
          categories={categories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {isLoading ? (
        <div className="category-grid" aria-label="Loading menu items">
          {[1, 2, 3].map((item) => (
            <div className="category-card skeleton-card" key={item} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">+</span>
          <h3>Your menu is ready for its first item</h3>
          <p>Add a dish above and customize its ingredient choices.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state compact-empty-state">
          <span aria-hidden="true">&loz;</span>
          <h3>No items in this category</h3>
          <p>Choose another category or select All categories.</p>
        </div>
      ) : (
        <div className="category-grid">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              categoryName={categoryNames.get(String(item.category_id))}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ItemList;
