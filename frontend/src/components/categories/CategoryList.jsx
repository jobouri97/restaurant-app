import CategoryCard from "./CategoryCard.jsx";

function LoadingCategories() {
  return (
    <div className="category-grid" aria-label="Loading categories">
      {[1, 2, 3].map((item) => (
        <div className="category-card skeleton-card" key={item} />
      ))}
    </div>
  );
}

function EmptyCategories() {
  return (
    <div className="empty-state">
      <span aria-hidden="true">&loz;</span>
      <h3>Your menu is ready for its first category</h3>
      <p>Add a collection above, such as Starters, Mains, or Desserts.</p>
    </div>
  );
}

function CategoryList({ categories, isLoading, onEdit, onDelete }) {
  return (
    <section className="categories-section" aria-labelledby="categories-title">
      <div className="section-heading">
        <div>
          <h2 id="categories-title">Your categories</h2>
          <p>Choose a category to edit its details.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingCategories />
      ) : categories.length === 0 ? (
        <EmptyCategories />
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              category={category}
              key={category.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryList;
