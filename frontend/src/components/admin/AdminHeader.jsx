function AdminHeader({ section, count }) {
  const isItems = section === "items";
  const isTables = section === "tables";
  const title = isTables ? "Tables & QR" : isItems ? "Menu items" : "Categories";
  const description = isTables
    ? "Create, manage, and print a unique QR card for every dining table."
    : isItems
      ? "Create dishes and shape every choice your guests can make."
      : "Organize your dishes into clear, inviting collections.";
  const singular = isTables ? "table" : isItems ? "item" : "category";
  const plural = isTables ? "tables" : isItems ? "items" : "categories";

  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">Menu management</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="category-count">
        {count} {count === 1 ? singular : plural}
      </span>
    </header>
  );
}

export default AdminHeader;
