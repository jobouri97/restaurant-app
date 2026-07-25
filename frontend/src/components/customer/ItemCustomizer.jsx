import { formatMoney } from "./customerPresentation.js";

function ItemCustomizer({
  item,
  choices,
  quantity,
  onChoiceChange,
  onQuantityChange,
  onClose,
  onAdd,
}) {
  if (!item) return null;

  return (
    <div className="request-modal-backdrop" onMouseDown={onClose}>
      <section
        className="customer-customizer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="request-close" type="button" onClick={onClose}>
          ×
        </button>
        <p className="customer-kicker">Customize</p>
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        {item.ingredients.map(
          (ingredient) =>
            ingredient.options.length > 0 && (
              <fieldset key={ingredient.id}>
                <legend>{ingredient.name}</legend>
                {ingredient.options.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name={`ingredient-${ingredient.id}`}
                      checked={
                        String(choices[ingredient.id]) === String(option.id)
                      }
                      onChange={() =>
                        onChoiceChange(ingredient.id, option.id)
                      }
                    />
                    {option.optionName}
                  </label>
                ))}
              </fieldset>
            ),
        )}
        <div className="quantity-row">
          <span>Quantity</span>
          <div>
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <strong>{quantity}</strong>
            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(100, quantity + 1))}
            >
              +
            </button>
          </div>
        </div>
        <button
          className="submit-request-button"
          type="button"
          onClick={onAdd}
        >
          Add to request · {formatMoney(Number(item.price) * quantity)}
        </button>
      </section>
    </div>
  );
}

export default ItemCustomizer;
