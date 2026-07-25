import { formatMoney, REQUEST_COPY, REQUEST_STEPS, } from "./customerPresentation.js";

function RequestTracker({ request, requests, tableNumber, trackingToken, onSelect, onNewRequest, }) {
  const currentIndex = REQUEST_STEPS.indexOf(request.status);
  const copy = REQUEST_COPY[request.status] || REQUEST_COPY.pending;

  return (
    <main className="tracking-page">
      <div className="tracking-layout">
        <nav className="customer-request-switcher" aria-label="My requests">
          <p>My requests</p>
          <div>
            {requests.map((entry) => (
              <button
                className={
                  entry.tracking_token === trackingToken ? "active" : ""
                }
                key={entry.tracking_token}
                type="button"
                onClick={() => onSelect(entry.tracking_token)}
              >
                <strong>#{entry.id}</strong>
                <span>
                  {REQUEST_COPY[entry.status]?.[0] || entry.status}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <section className={`tracking-card tracking-${request.status}`}>
          <div className="tracking-icon">
            {request.status === "cancelled" ? "×" : "✓"}
          </div>
          <p className="customer-kicker">
            Table {tableNumber} · Request #{request.id}
          </p>
          <h1>{copy[0]}</h1>
          <p>{copy[1]}</p>
          {request.status !== "cancelled" && (
            <div className="tracking-steps">
              {REQUEST_STEPS.map((status, index) => (
                <div
                  className={index <= currentIndex ? "active" : ""}
                  key={status}
                >
                  <span>{index + 1}</span>
                  <small>{REQUEST_COPY[status][0]}</small>
                </div>
              ))}
            </div>
          )}
          <div className="tracking-summary">
            <span>Total</span>
            <strong>{formatMoney(request.price)}</strong>
          </div>
          <button type="button" onClick={onNewRequest}>
            Place another request
          </button>
          <small className="live-note">Updates automatically</small>
        </section>
      </div>
    </main>
  );
}

export default RequestTracker;
