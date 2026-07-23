function AdminHeader({ categoryCount }) {
  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">Menu management</p>
        <h1>Categories</h1>
        <p>Organize your dishes into clear, inviting collections.</p>
      </div>
      <span className="category-count">
        {categoryCount} {categoryCount === 1 ? "category" : "categories"}
      </span>
    </header>
  );
}

export default AdminHeader;
