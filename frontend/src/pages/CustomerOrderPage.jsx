import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getTableMenu, getTrackedRequest, submitRequest } from "../services/publicRequestApi.js";

const STEPS = ["accepted", "preparing", "ready", "completed"];
const COPY = {
  pending: ["Waiting for confirmation", "The restaurant has received your request."],
  accepted: ["Confirmed", "Your request was accepted."],
  preparing: ["Preparing", "The kitchen is preparing your order."],
  ready: ["Ready", "Your order is ready to be served."],
  completed: ["Completed", "Enjoy your meal!"],
  cancelled: ["Request rejected", "Please speak with a staff member or place a new request."],
};
const money = (value) => `$${Number(value).toFixed(2)}`;

function CustomerOrderPage() {
  const { qrCode } = useParams();
  const storageKey = `restaurant-requests:${qrCode}`;
  const legacyStorageKey = `restaurant-request:${qrCode}`;
  const [page, setPage] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [choices, setChoices] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [trackingTokens, setTrackingTokens] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {
      // Fall through to the previous single-request storage format.
    }
    const legacyToken = localStorage.getItem(legacyStorageKey);
    return legacyToken ? [legacyToken] : [];
  });
  const [trackedRequests, setTrackedRequests] = useState([]);
  const [trackingToken, setTrackingToken] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved) && saved.length) return saved.at(-1);
    } catch {
      // Fall through to the previous single-request storage format.
    }
    return localStorage.getItem(legacyStorageKey) || "";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getTableMenu(qrCode)
      .then((data) => active && setPage(data))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [qrCode]);

  useEffect(() => {
    if (!trackingTokens.length) return undefined;
    let active = true;
    const refresh = () => Promise.all(
      trackingTokens.map((token) =>
        getTrackedRequest(token)
          .then((data) => data.request)
          .catch(() => null),
      ),
    ).then((requests) => {
      if (active) setTrackedRequests(requests.filter(Boolean));
    });
    refresh();
    const interval = window.setInterval(refresh, 3500);
    return () => { active = false; window.clearInterval(interval); };
  }, [trackingTokens]);

  const trackedRequest = trackedRequests.find(
    (request) => request.tracking_token === trackingToken,
  );

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.item.price) * line.qty, 0),
    [cart],
  );

  const openItem = (item) => {
    const defaults = {};
    item.ingredients.forEach((ingredient) => {
      const option = ingredient.options.find((entry) => entry.isDefault) || ingredient.options[0];
      if (option) defaults[ingredient.id] = option.id;
    });
    setActiveItem(item);
    setChoices(defaults);
    setQuantity(1);
  };

  const addToCart = () => {
    const missing = activeItem.ingredients.some(
      (ingredient) => ingredient.options.length > 0 && !choices[ingredient.id],
    );
    if (missing) return setError("Please choose one option for every ingredient.");
    setCart((current) => [...current, {
      key: crypto.randomUUID(), item: activeItem, qty: quantity, choices,
    }]);
    setActiveItem(null);
    setError("");
  };

  const sendRequest = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const data = await submitRequest(qrCode, cart.map((line) => ({
        itemId: line.item.id,
        qty: line.qty,
        ingredients: Object.entries(line.choices).map(
          ([ingredientId, optionId]) => ({ ingredientId, optionId }),
        ),
      })));
      const token = data.request.tracking_token;
      setTrackingTokens((current) => {
        const next = current.includes(token) ? current : [...current, token];
        localStorage.setItem(storageKey, JSON.stringify(next));
        localStorage.removeItem(legacyStorageKey);
        return next;
      });
      setTrackingToken(token);
      setTrackedRequests((current) => [...current, data.request]);
      setCart([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewRequest = () => {
    setTrackingToken("");
    setError("");
  };

  const openMyRequests = () => {
    if (trackedRequests.length === 0) {
      setError("No requests have been saved on this device yet.");
      return;
    }
    setTrackingToken(trackedRequests.at(-1).tracking_token);
    setError("");
  };

  if (isLoading) return <main className="customer-state">Loading menu…</main>;
  if (!page) return <main className="customer-state customer-error">{error || "This table is unavailable."}</main>;

  if (trackingToken && trackedRequest) {
    const currentIndex = STEPS.indexOf(trackedRequest.status);
    const copy = COPY[trackedRequest.status] || COPY.pending;
    return (
      <main className="tracking-page">
        <div className="tracking-layout">
          {trackedRequests.length > 0 && (
            <nav className="customer-request-switcher" aria-label="My requests">
              <p>My requests</p>
              <div>
                {trackedRequests.map((request) => (
                  <button
                    className={request.tracking_token === trackingToken ? "active" : ""}
                    key={request.tracking_token}
                    type="button"
                    onClick={() => setTrackingToken(request.tracking_token)}
                  >
                    <strong>#{request.id}</strong>
                    <span>{COPY[request.status]?.[0] || request.status}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
          <section className={`tracking-card tracking-${trackedRequest.status}`}>
          <div className="tracking-icon">{trackedRequest.status === "cancelled" ? "×" : "✓"}</div>
          <p className="customer-kicker">Table {page.table.number} · Request #{trackedRequest.id}</p>
          <h1>{copy[0]}</h1><p>{copy[1]}</p>
          {trackedRequest.status !== "cancelled" && (
            <div className="tracking-steps">
              {STEPS.map((status, index) => (
                <div className={index <= currentIndex ? "active" : ""} key={status}>
                  <span>{index + 1}</span><small>{COPY[status][0]}</small>
                </div>
              ))}
            </div>
          )}
          <div className="tracking-summary"><span>Total</span><strong>{money(trackedRequest.price)}</strong></div>
          <button type="button" onClick={startNewRequest}>
            Place another request
          </button>
          <small className="live-note">Updates automatically</small>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-page">
      <header className="customer-header">
        <div>
          <p className="customer-kicker">Table {page.table.number}</p>
          <h1>{page.restaurant.name}</h1>
          <p>Choose your favorites and send one request to the kitchen.</p>
        </div>
        <div className="customer-header-actions">
          <button
            className="my-requests-button"
            type="button"
            onClick={openMyRequests}
          >
            My requests ({trackedRequests.length})
          </button>
          <div className="cart-pill">{cart.reduce((sum, line) => sum + line.qty, 0)} items</div>
        </div>
      </header>
      {error && <p className="customer-alert">{error}</p>}

      <div className="customer-category-filter">
        <label htmlFor="customer-category">Filter menu</label>
        <select
          id="customer-category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {page.menu.categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {page.menu.categories
        .filter(
          (category) =>
            categoryFilter === "all" ||
            String(category.id) === categoryFilter,
        )
        .map((category) => {
          const items = page.menu.items.filter(
            (item) => String(item.category_id) === String(category.id),
          );
          if (!items.length) return null;
          return (
            <section className="menu-section" key={category.id}>
              <div className="menu-section-heading"><p>Explore</p><h2>{category.name}</h2></div>
              <div className="customer-menu-grid">
                {items.map((item) => (
                  <article className="customer-item-card" key={item.id}>
                    <div className="customer-item-image">
                      {item.image_url ? <img src={item.image_url} alt="" /> : <span>{item.name[0]}</span>}
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description || "Freshly prepared for your table."}</p>
                      <div><strong>{money(item.price)}</strong><button type="button" onClick={() => openItem(item)}>Add</button></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
      })}

      {cart.length > 0 && (
        <aside className="customer-cart">
          <div className="customer-cart-title">
            <div><p>Your request</p><h2>Table {page.table.number}</h2></div><strong>{money(total)}</strong>
          </div>
          <div className="customer-cart-lines">
            {cart.map((line) => (
              <div key={line.key}>
                <span>{line.qty} × {line.item.name}</span>
                <button type="button" onClick={() => setCart((current) => current.filter((entry) => entry.key !== line.key))}>Remove</button>
              </div>
            ))}
          </div>
          <button className="submit-request-button" type="button" disabled={isSubmitting} onClick={sendRequest}>
            {isSubmitting ? "Sending…" : `Submit request · ${money(total)}`}
          </button>
        </aside>
      )}

      {activeItem && (
        <div className="request-modal-backdrop" onMouseDown={() => setActiveItem(null)}>
          <section className="customer-customizer" onMouseDown={(event) => event.stopPropagation()}>
            <button className="request-close" type="button" onClick={() => setActiveItem(null)}>×</button>
            <p className="customer-kicker">Customize</p><h2>{activeItem.name}</h2><p>{activeItem.description}</p>
            {activeItem.ingredients.map((ingredient) => ingredient.options.length > 0 && (
              <fieldset key={ingredient.id}>
                <legend>{ingredient.name}</legend>
                {ingredient.options.map((option) => (
                  <label key={option.id}>
                    <input type="radio" name={`ingredient-${ingredient.id}`}
                      checked={String(choices[ingredient.id]) === String(option.id)}
                      onChange={() => setChoices((current) => ({ ...current, [ingredient.id]: option.id }))} />
                    {option.optionName}
                  </label>
                ))}
              </fieldset>
            ))}
            <div className="quantity-row">
              <span>Quantity</span><div>
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <strong>{quantity}</strong>
                <button type="button" onClick={() => setQuantity((value) => Math.min(100, value + 1))}>+</button>
              </div>
            </div>
            <button className="submit-request-button" type="button" onClick={addToCart}>
              Add to request · {money(Number(activeItem.price) * quantity)}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default CustomerOrderPage;
