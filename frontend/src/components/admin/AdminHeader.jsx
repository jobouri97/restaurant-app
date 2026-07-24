function AdminHeader({ section, count }) {
  const isItems = section === "items";

  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">Menu management</p>
        <h1>{isItems ? "Menu items" : "Categories"}</h1>
        <p>
          {isItems
            ? "Create dishes and shape every choice your guests can make."
            : "Organize your dishes into clear, inviting collections."}
        </p>
      </div>
      <span className="category-count">
        {count} {count === 1 ? (isItems ? "item" : "category") : isItems ? "items" : "categories"}
      </span>
    </header>
  );
}

export default AdminHeader;
