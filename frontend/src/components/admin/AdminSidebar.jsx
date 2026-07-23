function AdminSidebar({ user, onLogout }) {
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
        <button className="nav-item active" type="button">
          <span aria-hidden="true">#</span>
          Categories
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
