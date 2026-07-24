function ItemCategoryFilter({ categories, value, onChange }) {
  return (
    <label className="item-category-filter">
      <span>Filter by category</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ItemCategoryFilter;
