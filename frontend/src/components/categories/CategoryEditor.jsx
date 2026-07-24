function CategoryEditor({ form, editingId, isSaving, onChange, onSubmit, onCancel, }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ name, value });
  };

  return (
    <section className="category-editor" aria-labelledby="editor-title">
      <div className="editor-heading">
        <span className="editor-icon" aria-hidden="true">
          {editingId ? "E" : "+"}
        </span>
        <div>
          <h2 id="editor-title">
            {editingId ? "Edit category" : "Add a category"}
          </h2>
          <p>
            {editingId
              ? "Update this collection's name or cover image."
              : "Create a collection your guests can easily browse."}
          </p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <label>
          Category name
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            maxLength="150"
            placeholder="e.g. Starters"
            required
          />
        </label>

        <label>
          Image URL <span>Optional</span>
          <input
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </label>

        <div className="form-actions">
          {editingId && (
            <button className="button-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="button-primary" type="submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add category"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CategoryEditor;
