import CategoryImage from "./CategoryImage.jsx";

function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <article className="category-card">
      <div className="category-image">
        <CategoryImage category={category} />
      </div>
      <div className="category-card-body">
        <div>
          <p>Menu category</p>
          <h3>{category.name}</h3>
        </div>
        <div className="card-actions">
          <button
            type="button"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            Edit
          </button>
          <button
            className="delete-button"
            type="button"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default CategoryCard;
