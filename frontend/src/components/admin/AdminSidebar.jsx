function AdminSidebar({ user, activeSection, onSectionChange, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          R
        </span>
        <div>
          <strong>Restaurant</strong>
          <span>Menu studio</span>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Admin navigation">
        <button
          className={`nav-item ${activeSection === "requests" ? "active" : ""}`}
          type="button"
          onClick={() => onSectionChange("requests")}
        >
          <span aria-hidden="true">●</span>
          Requests
        </button>
        <button
          className={`nav-item ${activeSection === "profits" ? "active" : ""}`}
          type="button"
          onClick={() => onSectionChange("profits")}
        >
          <span aria-hidden="true">$</span>
          Profits
        </button>
        <button
          className={`nav-item ${activeSection === "categories" ? "active" : ""}`}
          type="button"
          onClick={() => onSectionChange("categories")}
        >
          <span aria-hidden="true">#</span>
          Categories
        </button>
        <button
          className={`nav-item ${activeSection === "items" ? "active" : ""}`}
          type="button"
          onClick={() => onSectionChange("items")}
        >
          <span aria-hidden="true">+</span>
          Items
        </button>
        <button
          className={`nav-item ${activeSection === "tables" ? "active" : ""}`}
          type="button"
          onClick={() => onSectionChange("tables")}
        >
          <span aria-hidden="true">⌗</span>
          Tables &amp; QR
        </button>
      </nav>

      <div className="sidebar-account">
        <span className="account-avatar" aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </span>
        <div>
          <strong>{user?.name || "Restaurant owner"}</strong>
          <span>Administrator</span>
        </div>
        <button type="button" onClick={onLogout} aria-label="Log out">
          &rarr;
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
