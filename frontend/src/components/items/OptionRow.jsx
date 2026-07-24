function OptionRow({
  ingredientIndex,
  optionIndex,
  option,
  onChange,
  onSetDefault,
  onRemove,
}) {
  return (
    <div className="option-row">
      <input
        type="text"
        value={option.optionName}
        onChange={(event) =>
          onChange(ingredientIndex, optionIndex, event.target.value)
        }
        maxLength="255"
        placeholder="e.g. 2 slices"
        aria-label={`Option ${optionIndex + 1}`}
        required
      />
      <label className="default-option">
        <input
          type="radio"
          name={`default-option-${ingredientIndex}`}
          checked={option.isDefault}
          onChange={() => onSetDefault(ingredientIndex, optionIndex)}
        />
        Default
      </label>
      <button
        className="icon-button"
        type="button"
        onClick={() => onRemove(ingredientIndex, optionIndex)}
        aria-label={`Remove option ${optionIndex + 1}`}
      >
        &times;
      </button>
    </div>
  );
}

export default OptionRow;
