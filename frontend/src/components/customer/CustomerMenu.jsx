import { formatMoney } from "./customerPresentation.js";

function CustomerMenu({ categories, items, categoryFilter, onAdd }) {
  return categories
    .filter(
      (category) =>
        categoryFilter === "all" ||
        String(category.id) === categoryFilter,
    )
    .map((category) => {
      const categoryItems = items.filter(
        (item) => String(item.category_id) === String(category.id),
      );
      if (!categoryItems.length) return null;

      return (
        <section className="menu-section" key={category.id}>
          <div className="menu-section-heading">
            <p>Explore</p>
            <h2>{category.name}</h2>
          </div>
          <div className="customer-menu-grid">
            {categoryItems.map((item) => (
              <article className="customer-item-card" key={item.id}>
                <div className="customer-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" />
                  ) : (
                    <span>{item.name[0]}</span>
                  )}
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.description || "Freshly prepared for your table."}
                  </p>
                  <div>
                    <strong>{formatMoney(item.price)}</strong>
                    <button type="button" onClick={() => onAdd(item)}>
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    });
}

export default CustomerMenu;
