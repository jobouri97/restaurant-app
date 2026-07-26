import { useEffect, useMemo, useState } from "react"; // Gives us React tools for state, side effects, and saved calculations.
import { useParams } from "react-router-dom"; // Lets us read the QR code written inside the page URL.
import { io } from "socket.io-client";
import CategoryFilter from "../components/customer/CategoryFilter.jsx"; // The buttons used to filter food by category.
import CustomerHeader from "../components/customer/CustomerHeader.jsx"; // The top part of the customer page.
import CustomerMenu from "../components/customer/CustomerMenu.jsx"; // The component that shows all menu items.
import ItemCustomizer from "../components/customer/ItemCustomizer.jsx"; // The popup used to choose quantity and ingredients.
import RequestCart from "../components/customer/RequestCart.jsx"; // The component that shows the customer's cart.
import RequestTracker from "../components/customer/RequestTracker.jsx"; // The screen that shows request progress.
import {
  getTableMenu, // Asks the backend for this table's menu.
  getTrackedRequest, // Asks the backend for the newest request information.
  submitRequest, // Sends the customer's cart to the backend.
} from "../services/publicRequestApi.js";
import {
  getRequestExpiryTime,
  isRequestExpired,
} from "../utils/requestExpiry.js";

const readTrackingTokens = (storageKey) => { // Reads saved request tokens from this browser.
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey) || "[]", // Uses an empty list when nothing has been saved yet.
    );

    return Array.isArray(saved) ? saved : []; // Accepts the saved value only if it is an array.
  } catch {
    return []; // Returns an empty list if the saved text is invalid.
  }
};

const haveSameChoices = (firstChoices, secondChoices) => {
  const firstEntries = Object.entries(firstChoices);
  const secondEntries = Object.entries(secondChoices);

  return (
    firstEntries.length === secondEntries.length &&
    firstEntries.every(
      ([ingredientId, optionId]) =>
        String(secondChoices[ingredientId]) === String(optionId),
    )
  );
};

function CustomerOrderPage() {
  const { qrCode } = useParams(); // For example, /order/ABC123 gives us "ABC123".

  const storageKey = `restaurant-requests:${qrCode}`; // Creates a separate storage name for each table.

  const [page, setPage] = useState(null); // Holds the restaurant, table, and menu received from the backend.
  const [cart, setCart] = useState([]); // Holds everything the customer adds to the cart.
  const [activeItem, setActiveItem] = useState(null); // Holds the item currently open in the customizer.
  const [categoryFilter, setCategoryFilter] = useState("all"); // Remembers which menu category is selected.
  const [choices, setChoices] = useState({}); // Matches each ingredient ID with its chosen option ID.
  const [quantity, setQuantity] = useState(1); // Remembers how many of the selected item the customer wants.

  const [trackingTokens, setTrackingTokens] = useState(
    () => readTrackingTokens(storageKey), // Reads the saved tokens when the component is first created.
  );

  const [trackedRequests, setTrackedRequests] = useState([]); // Holds the submitted requests received from the server.

  const [trackingToken, setTrackingToken] = useState(
    () =>
      readTrackingTokens(storageKey).at(-1) || "", // Selects the newest saved token, or an empty string if none exists.
  );

  const [isLoading, setIsLoading] = useState(true); // Tells us whether the menu is still loading.
  const [isSubmitting, setIsSubmitting] = useState(false); // Tells us whether a request is currently being sent.
  const [error, setError] = useState(""); // Holds an error message that can be shown to the customer.

  useEffect(() => {
    let active = true; // Remembers whether this component is still displayed.

    getTableMenu(qrCode) // Requests the table and menu information from the backend.
      .then((data) => active && setPage(data)) // Saves the data only if the component is still displayed.
      .catch(
        (requestError) => active && setError(requestError.message), // Saves an error message if loading fails.
      )
      .finally(
        () => active && setIsLoading(false), // Stops the loading state after success or failure.
      );

    return () => {
      active = false; // Prevents state updates after the component is removed.
    };
  }, [qrCode]); // Runs again if the QR code in the URL changes.

  useEffect(() => {
    if (!trackingTokens.length) return undefined; // Stops if there are no submitted requests to track.

    let active = true; // Remembers whether this effect is still active.

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { trackingTokens }, // Sends the saved tokens when connecting to the Socket.IO server.
    });

    socket.on("connect", () => {
      Promise.all(
        trackingTokens.map((token) =>
          getTrackedRequest(token) // Loads the latest information for this token.
            .then((data) => data.request) // Keeps only the request from the response.
            .catch(() => null), // Uses null if this request cannot be loaded.
        ),
      ).then((requests) => {
        if (active) setTrackedRequests(requests.filter(Boolean)); // Removes null values and saves the valid requests.
      });
    });

    socket.on("request:updated", (updatedRequest) => {
      setTrackedRequests((current) =>
        current.map((request) =>
          request.tracking_token === updatedRequest.tracking_token
            ? updatedRequest // Replaces the old request with its updated version.
            : request, // Keeps other requests unchanged.
        ),
      );
    });

    return () => {
      active = false; // Prevents the effect from updating state after cleanup.
      socket.disconnect(); // Disconnects the socket when the component or tokens change.
    };
  }, [trackingTokens]); // Reconnects when the saved tracking tokens change.

  useEffect(() => {
    const now = Date.now(); // Gets the current time in milliseconds.

    const expiryTimes = trackedRequests
      .map(getRequestExpiryTime) // Gets the expiry time of every tracked request.
      .filter((expiryTime) => expiryTime !== null); // Removes requests that do not have an expiry time.

    if (!expiryTimes.length) return undefined; // Stops if none of the requests has an expiry time.

    const delay = Math.max(0, Math.min(...expiryTimes) - now); // Calculates how long to wait for the nearest expiry.

    const timeout = window.setTimeout(() => {
      const expiryCheckTime = Date.now(); // Gets the time again when the timer finishes.

      const expiredTokens = new Set(
        trackedRequests
          .filter((request) =>
            isRequestExpired(request, expiryCheckTime), // Keeps only requests that have expired.
          )
          .map((request) => request.tracking_token), // Keeps only their tracking tokens.
      );

      setTrackedRequests((current) =>
        current.filter(
          (request) => !expiredTokens.has(request.tracking_token), // Removes expired requests from the state.
        ),
      );

      setTrackingTokens((current) => {
        const next = current.filter(
          (token) => !expiredTokens.has(token), // Removes expired tokens from the saved token list.
        );

        localStorage.setItem(storageKey, JSON.stringify(next)); // Saves the updated token list in the browser.

        return next; // Updates the trackingTokens state.
      });

      setTrackingToken((current) =>
        expiredTokens.has(current) ? "" : current, // Closes the tracker if its selected request expired.
      );
    }, delay);

    return () => window.clearTimeout(timeout); // Removes the old timer before creating a new one.
  }, [storageKey, trackedRequests]); // Runs again when the tracked requests change.

  const trackedRequest = trackedRequests.find(
    (request) => request.tracking_token === trackingToken, // Finds the request currently selected by the customer.
  );

  const cartCount = cart.reduce(
    (sum, line) => sum + line.qty, // Adds the quantity of every cart item.
    0, // Starts the total at zero.
  );

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, line) =>
          sum + Number(line.item.price) * line.qty, // Adds each item's price multiplied by its quantity.
        0, // Starts the price total at zero.
      ),
    [cart], // Recalculates the total only when the cart changes.
  );

  const openItem = (item) => {
    const defaults = {}; // Will hold the default choice for every ingredient.

    item.ingredients.forEach((ingredient) => {
      const option =
        ingredient.options.find((entry) => entry.isDefault) || // First looks for an option marked as default.
        ingredient.options[0]; // Otherwise, uses the first available option.

      if (option) {
        defaults[ingredient.id] = option.id; // Connects the ingredient ID to the selected option ID.
      }
    });

    setActiveItem(item); // Opens this item inside the customization popup.
    setChoices(defaults); // Selects the item's default ingredient choices.
    setQuantity(1); // Resets the quantity to one.
  };

  const addToCart = () => {
    const missing = activeItem.ingredients.some(
      (ingredient) =>
        ingredient.options.length > 0 && // Checks only ingredients that have selectable options.
        !choices[ingredient.id], // Becomes true if this ingredient has no selected option.
    );

    if (missing) {
      setError("Please choose one option for every ingredient."); // Shows a validation error.
      return; // Stops before adding the incomplete item.
    }

    setCart((current) => {
      const matchingLine = current.find(
        (line) =>
          String(line.item.id) === String(activeItem.id) &&
          haveSameChoices(line.choices, choices),
      );

      if (matchingLine) {
        return current.map((line) =>
          line.key === matchingLine.key
            ? { ...line, qty: line.qty + quantity }
            : line,
        );
      }

      return [
        ...current, // Keeps all items already in the cart.
        {
          key: crypto.randomUUID(), // Creates a unique key for this cart entry.
          item: activeItem, // Saves the selected menu item.
          qty: quantity, // Saves the selected quantity.
          choices: { ...choices }, // Saves the selected ingredient options.
        },
      ];
    });

    setActiveItem(null); // Closes the item customization popup.
    setError(""); // Clears any previous error message.
  };

  const sendRequest = async () => {
    try {
      setIsSubmitting(true); // Marks the request as currently being sent.
      setError(""); // Clears any previous error message.

      const data = await submitRequest(
        qrCode, // Tells the backend which table is sending the request.
        cart.map((line) => ({
          itemId: line.item.id, // Sends the ID of the requested menu item.
          qty: line.qty, // Sends the requested quantity.

          ingredients: Object.entries(line.choices).map(
            ([ingredientId, optionId]) => ({
              ingredientId, // Sends the ingredient ID.
              optionId, // Sends the selected option ID.
            }),
          ),
        })),
      );

      const token = data.request.tracking_token; // Gets the new request's tracking token.

      setTrackingTokens((current) => {
        const next = current.includes(token)
          ? current // Keeps the current array if the token is already saved.
          : [...current, token]; // Otherwise, adds the new token.

        localStorage.setItem(storageKey, JSON.stringify(next)); // Saves all tracking tokens in the browser.

        return next; // Updates the trackingTokens state.
      });

      setTrackingToken(token); // Selects the newly submitted request.
      setTrackedRequests((current) => [...current, data.request]); // Adds the new request to the tracked requests.
      setCart([]); // Empties the cart after submission succeeds.
    } catch (requestError) {
      setError(requestError.message); // Shows the error if submission fails.
    } finally {
      setIsSubmitting(false); // Ends the submitting state after success or failure.
    }
  };

  const openMyRequests = () => {
    if (!trackedRequests.length) {
      setError("No requests have been saved on this device yet."); // Tells the customer that there are no saved requests.
      return; // Stops because there is no request to open.
    }

    setTrackingToken(
      trackedRequests.at(-1).tracking_token, // Selects the newest tracked request.
    );

    setError(""); // Clears any previous error.
  };

  if (isLoading) {
    return <main className="customer-state">Loading menu…</main>; // Shows this while waiting for the menu.
  }

  if (!page) {
    return (
      <main className="customer-state customer-error">
        {error || "This table is unavailable."}{/* Shows the backend error or a default message. */}
      </main>
    );
  }

  if (trackingToken && trackedRequest) {
    return (
      <RequestTracker
        request={trackedRequest} // The request currently being displayed.
        requests={trackedRequests} // All requests saved and loaded on this device.
        tableNumber={page.table.number} // The customer's table number.
        trackingToken={trackingToken} // The token belonging to the selected request.
        onSelect={setTrackingToken} // Changes the displayed request.
        onNewRequest={() => {
          setTrackingToken(""); // Hides the tracker and returns to the menu.
          setError(""); // Clears any previous error.
        }}
      />
    );
  }

  return (
    <main className="customer-page">
      <CustomerHeader
        restaurant={page.restaurant.name} // Displays the restaurant's name.
        tableNumber={page.table.number} // Displays the current table number.
        requestCount={trackedRequests.length} // Displays how many requests are being tracked.
        cartCount={cartCount} // Displays the total quantity of items in the cart.
        onOpenRequests={openMyRequests} // Opens the customer's newest submitted request.
      />

      {error && (
        <p className="customer-alert">{error}</p> // Displays this paragraph only when an error exists.
      )}

      <CategoryFilter
        categories={page.menu.categories} // Gives the filter all available categories.
        value={categoryFilter} // Tells it which category is currently selected.
        onChange={setCategoryFilter} // Updates the selected category.
      />

      <CustomerMenu
        categories={page.menu.categories} // Gives the menu its category information.
        items={page.menu.items} // Gives the menu all available items.
        categoryFilter={categoryFilter} // Tells the menu which category to display.
        onAdd={openItem} // Opens the selected item for customization.
      />

      <RequestCart
        cart={cart} // Gives the cart component all selected items.
        tableNumber={page.table.number} // Gives it the customer's table number.
        total={total} // Gives it the calculated cart total.
        isSubmitting={isSubmitting} // Tells it whether the request is being sent.
        onRemove={(key) =>
          setCart(
            (current) =>
              current.filter((entry) => entry.key !== key), // Keeps every cart entry except the selected one.
          )
        }
        onSubmit={sendRequest} // Sends the cart to the backend.
      />

      <ItemCustomizer
        item={activeItem} // Gives the customizer the currently selected item.
        choices={choices} // Gives it the selected ingredient options.
        quantity={quantity} // Gives it the selected quantity.
        onChoiceChange={(ingredientId, optionId) =>
          setChoices((current) => ({
            ...current, // Keeps the choices made for the other ingredients.
            [ingredientId]: optionId, // Updates the option chosen for this ingredient.
          }))
        }
        onQuantityChange={setQuantity} // Updates the selected quantity.
        onClose={() => setActiveItem(null)} // Closes the customizer without adding the item.
        onAdd={addToCart} // Validates and adds the customized item to the cart.
      />
    </main>
  );
}

export default CustomerOrderPage; // Allows this component to be imported into another file.
