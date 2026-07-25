function CustomerHeader({
  restaurant,
  tableNumber,
  requestCount,
  cartCount,
  onOpenRequests,
}) {
  return (
    <header className="customer-header">
      <div>
        <p className="customer-kicker">Table {tableNumber}</p>
        <h1>{restaurant}</h1>
        <p>Choose your favorites and send one request to the kitchen.</p>
      </div>
      <div className="customer-header-actions">
        <button
          className="my-requests-button"
          type="button"
          onClick={onOpenRequests}
        >
          My requests ({requestCount})
        </button>
        <div className="cart-pill">{cartCount} items</div>
      </div>
    </header>
  );
}

export default CustomerHeader;
