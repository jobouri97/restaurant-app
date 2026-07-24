import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminAlert from "../components/admin/AdminAlert.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import CategoryEditor from "../components/categories/CategoryEditor.jsx";
import CategoryList from "../components/categories/CategoryList.jsx";
import { useCategories } from "../hooks/useCategories.js";
import ItemEditor from "../components/items/ItemEditor.jsx";
import ItemList from "../components/items/ItemList.jsx";
import { useItems } from "../hooks/useItems.js";
import TableEditor from "../components/tables/TableEditor.jsx";
import TableList from "../components/tables/TableList.jsx";
import { useTables } from "../hooks/useTables.js";

function AdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("categories");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const categoriesState = useCategories();
  const itemsState = useItems();
  const tablesState = useTables();
  const isItems = activeSection === "items";
  const isTables = activeSection === "tables";
  const activeState = isTables
    ? tablesState
    : isItems
      ? itemsState
      : categoriesState;
  const activeError = activeState.error;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />

      <main className="admin-main">
        <AdminHeader
          section={activeSection}
          count={
            isTables
              ? tablesState.tables.length
              : isItems
                ? itemsState.items.length
                : categoriesState.categories.length
          }
        />
        <AdminAlert
          message={activeError}
          onDismiss={activeState.clearError}
        />

        {isTables ? (
          <>
            <TableEditor
              number={tablesState.number}
              isSaving={tablesState.isSaving}
              onNumberChange={tablesState.setNumber}
              onSubmit={tablesState.saveTable}
            />
            <TableList
              tables={tablesState.tables}
              restaurantName={user?.name || "Restaurant"}
              isLoading={tablesState.isLoading}
              onDelete={tablesState.removeTable}
            />
          </>
        ) : isItems ? (
          <>
            <ItemEditor
              categories={categoriesState.categories}
              form={itemsState.form}
              editingId={itemsState.editingId}
              isSaving={itemsState.isSaving}
              actions={{
                onFieldChange: itemsState.updateField,
                onAddIngredient: itemsState.addIngredient,
                onIngredientChange: itemsState.updateIngredient,
                onRemoveIngredient: itemsState.removeIngredient,
                onAddOption: itemsState.addOption,
                onOptionChange: itemsState.updateOption,
                onSetDefault: itemsState.setDefaultOption,
                onRemoveOption: itemsState.removeOption,
                onSubmit: itemsState.saveItem,
                onCancel: itemsState.resetForm,
              }}
            />
            <ItemList
              items={itemsState.items}
              categories={categoriesState.categories}
              isLoading={itemsState.isLoading}
              onEdit={itemsState.startEditing}
              onDelete={itemsState.removeItem}
            />
          </>
        ) : (
          <>
            <CategoryEditor
              form={categoriesState.form}
              editingId={categoriesState.editingId}
              isSaving={categoriesState.isSaving}
              onChange={categoriesState.updateForm}
              onSubmit={categoriesState.saveCategory}
              onCancel={categoriesState.resetForm}
            />
            <CategoryList
              categories={categoriesState.categories}
              isLoading={categoriesState.isLoading}
              onEdit={categoriesState.startEditing}
              onDelete={categoriesState.removeCategory}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
