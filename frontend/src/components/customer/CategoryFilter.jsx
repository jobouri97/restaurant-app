function CategoryFilter({ categories, value, onChange }) {
  return (
    <div className="customer-category-filter">
      <label htmlFor="customer-category">Filter menu</label>
      <select
        id="customer-category"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategoryFilter;
