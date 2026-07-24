function TableEditor({ number, isSaving, onNumberChange, onSubmit }) {
  return (
    <section className="table-editor">
      <div className="editor-heading">
        <span className="editor-icon" aria-hidden="true">⌗</span>
        <div>
          <h2>Add a dining table</h2>
          <p>A secure QR code will be created automatically.</p>
        </div>
      </div>

      <form className="table-form" onSubmit={onSubmit}>
        <label>
          Table number
          <input
            type="number"
            min="1"
            step="1"
            value={number}
            onChange={(event) => onNumberChange(event.target.value)}
            placeholder="For example, 12"
            required
          />
        </label>
        <button className="button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Creating…" : "Create table"}
        </button>
      </form>
    </section>
  );
}

export default TableEditor;
