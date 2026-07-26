import { useState } from "react";
import { formatMoney } from "./customerPresentation.js";

const getSelectedOptions = (line) =>
  line.item.ingredients
    .map((ingredient) => {
      const selectedOption = ingredient.options.find(
        (option) =>
          String(option.id) === String(line.choices[ingredient.id]),
      );

      return selectedOption
        ? `${ingredient.name}: ${selectedOption.optionName}`
        : null;
    })
    .filter(Boolean);

function RequestCart({
  cart,
  tableNumber,
  total,
  isSubmitting,
  onRemove,
  onSubmit,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!cart.length) return null;

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);

  return (
    <aside className={`customer-cart${isExpanded ? " is-expanded" : ""}`}>
      <div className="customer-cart-title">
        <div>
          <p>Your request</p>
          <h2>Table {tableNumber}</h2>
        </div>
        <div className="customer-cart-summary">
          <strong>{formatMoney(total)}</strong>
          <button
            className="customer-cart-toggle"
            type="button"
            aria-expanded={isExpanded}
            aria-controls="customer-cart-lines"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? "Hide items" : `View ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            <span aria-hidden="true">{isExpanded ? "↓" : "↑"}</span>
          </button>
        </div>
      </div>
      <div className="customer-cart-lines" id="customer-cart-lines">
        {cart.map((line) => {
          const selectedOptions = getSelectedOptions(line);

          return (
            <div className="customer-cart-line" key={line.key}>
              <div>
                <strong>{line.qty} × {line.item.name}</strong>
                {selectedOptions.length > 0 && (
                  <small>{selectedOptions.join(" · ")}</small>
                )}
              </div>
              <button type="button" onClick={() => onRemove(line.key)}>
                Remove
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="submit-request-button"
        type="button"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting
          ? "Sending…"
          : `Submit request · ${formatMoney(total)}`}
      </button>
    </aside>
  );
}

export default RequestCart;
