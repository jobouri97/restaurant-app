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
  if (!cart.length) return null;

  return (
    <aside className="customer-cart">
      <div className="customer-cart-title">
        <div>
          <p>Your request</p>
          <h2>Table {tableNumber}</h2>
        </div>
        <strong>{formatMoney(total)}</strong>
      </div>
      <div className="customer-cart-lines">
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
