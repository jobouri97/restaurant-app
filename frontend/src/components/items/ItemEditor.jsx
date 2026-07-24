import IngredientEditor from "./IngredientEditor.jsx";

function ItemEditor({
  categories,
  form,
  editingId,
  isSaving,
  actions,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    actions.onSubmit();
  };

  const handleFieldChange = (event) => {
    const { name, type, checked, value } = event.target;
    actions.onFieldChange({ name, value: type === "checkbox" ? checked : value });
  };

  return (
    <section className="item-editor" aria-labelledby="item-editor-title">
      <div className="editor-heading">
        <span className="editor-icon" aria-hidden="true">
          {editingId ? "E" : "+"}
        </span>
        <div>
          <h2 id="item-editor-title">
            {editingId ? "Edit menu item" : "Add a menu item"}
          </h2>
          <p>Build the dish, then add any choices your guests can customize.</p>
        </div>
      </div>

      <form className="item-form" onSubmit={handleSubmit}>
        <div className="item-fields">
          <label>
            Category
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleFieldChange}
              required
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Item name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleFieldChange}
              maxLength="150"
              placeholder="e.g. Classic burger"
              required
            />
          </label>

          <label>
            Price
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleFieldChange}
              min="0"
              max="99999999.99"
              step="0.01"
              placeholder="10.00"
              required
            />
          </label>

          <label className="wide-field">
            Description <span>Optional</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFieldChange}
              rows="3"
              placeholder="Tell guests what makes this dish special."
            />
          </label>

          <label className="wide-field">
            Image URL <span>Optional</span>
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleFieldChange}
              placeholder="https://example.com/burger.jpg"
            />
          </label>

          <label className="availability-toggle">
            <input
              name="isAvailable"
              type="checkbox"
              checked={form.isAvailable}
              onChange={handleFieldChange}
            />
            Available to order
          </label>
        </div>

        <div className="ingredients-builder">
          <div className="builder-heading">
            <div>
              <h3>Ingredients and choices</h3>
              <p>Ingredients can be listed alone or include selectable options.</p>
            </div>
            <button
              className="button-secondary"
              type="button"
              onClick={actions.onAddIngredient}
            >
              + Add ingredient
            </button>
          </div>

          {form.ingredients.length === 0 ? (
            <div className="builder-empty">
              No ingredients yet. Add one if this item can be customized.
            </div>
          ) : (
            <div className="ingredient-list">
              {form.ingredients.map((ingredient, ingredientIndex) => (
                <IngredientEditor
                  key={ingredientIndex}
                  ingredient={ingredient}
                  ingredientIndex={ingredientIndex}
                  onChange={actions.onIngredientChange}
                  onRemove={actions.onRemoveIngredient}
                  onAddOption={actions.onAddOption}
                  onOptionChange={actions.onOptionChange}
                  onSetDefault={actions.onSetDefault}
                  onRemoveOption={actions.onRemoveOption}
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          {editingId && (
            <button
              className="button-secondary"
              type="button"
              onClick={actions.onCancel}
            >
              Cancel
            </button>
          )}
          <button className="button-primary" type="submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add item"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ItemEditor;
