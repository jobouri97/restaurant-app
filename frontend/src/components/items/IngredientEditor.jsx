import OptionRow from "./OptionRow.jsx";

function IngredientEditor({
  ingredient,
  ingredientIndex,
  onChange,
  onRemove,
  onAddOption,
  onOptionChange,
  onSetDefault,
  onRemoveOption,
}) {
  return (
    <article className="ingredient-editor">
      <div className="ingredient-heading">
        <label>
          Ingredient {ingredientIndex + 1}
          <input
            type="text"
            value={ingredient.name}
            onChange={(event) =>
              onChange(ingredientIndex, event.target.value)
            }
            maxLength="255"
            placeholder="e.g. Cheese"
            required
          />
        </label>
        <button
          className="text-button danger"
          type="button"
          onClick={() => onRemove(ingredientIndex)}
        >
          Remove ingredient
        </button>
      </div>

      <div className="options-list">
        {ingredient.options.map((option, optionIndex) => (
          <OptionRow
            key={optionIndex}
            ingredientIndex={ingredientIndex}
            optionIndex={optionIndex}
            option={option}
            onChange={onOptionChange}
            onSetDefault={onSetDefault}
            onRemove={onRemoveOption}
          />
        ))}
      </div>

      <button
        className="text-button"
        type="button"
        onClick={() => onAddOption(ingredientIndex)}
      >
        + Add option
      </button>
    </article>
  );
}

export default IngredientEditor;
