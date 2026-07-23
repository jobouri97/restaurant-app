import { useNavigate } from "react-router-dom";
import AdminAlert from "../components/admin/AdminAlert.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import CategoryEditor from "../components/categories/CategoryEditor.jsx";
import CategoryList from "../components/categories/CategoryList.jsx";
import { useCategories } from "../hooks/useCategories.js";

function AdminPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { categories, form, editingId, isLoading, isSaving, error, clearError, resetForm, updateForm, saveCategory, startEditing, removeCategory } = useCategories();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="admin-shell">
      <AdminSidebar user={user} onLogout={handleLogout} />

      <main className="admin-main">
        <AdminHeader categoryCount={categories.length} />
        <AdminAlert message={error} onDismiss={clearError} />
        <CategoryEditor
          form={form}
          editingId={editingId}
          isSaving={isSaving}
          onChange={updateForm}
          onSubmit={saveCategory}
          onCancel={resetForm}
        />
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          onEdit={startEditing}
          onDelete={removeCategory}
        />
      </main>
    </div>
  );
}

export default AdminPage;
