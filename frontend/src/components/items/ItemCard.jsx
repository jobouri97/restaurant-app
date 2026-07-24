import ItemImage from "./ItemImage.jsx";

function ItemCard({ item, categoryName, onEdit, onDelete }) {
  const optionCount = item.ingredients.reduce(
    (total, ingredient) => total + ingredient.options.length,
    0,
  );

  return (
    <article className={`category-card item-card ${item.is_available ? "" : "unavailable"}`}>
      <div className="category-image">
        <ItemImage item={item} />
        {!item.is_available && <span className="status-badge">Unavailable</span>}
      </div>
      <div className="category-card-body">
        <div className="item-card-title">
          <div>
            <p>{categoryName || "Uncategorized"}</p>
            <h3>{item.name}</h3>
          </div>
          <strong>${Number(item.price).toFixed(2)}</strong>
        </div>
        <p className="item-description">{item.description || "\u00A0"}</p>
        <p className="item-meta">
          {item.ingredients.length} ingredients · {optionCount} options
        </p>
        <div className="card-actions">
          <button type="button" onClick={() => onEdit(item)}>
            Edit
          </button>
          <button
            className="delete-button"
            type="button"
            onClick={() => onDelete(item)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ItemCard;
