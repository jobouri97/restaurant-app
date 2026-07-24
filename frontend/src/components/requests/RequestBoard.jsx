const LABELS = {
  pending: "New",
  accepted: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Rejected",
};

const ACTIONS = {
  pending: [["accepted", "Accept request", true], ["cancelled", "Reject"]],
  accepted: [["preparing", "Start preparing", true], ["cancelled", "Cancel"]],
  preparing: [["ready", "Mark as ready", true], ["cancelled", "Cancel"]],
  ready: [["completed", "Complete", true]],
  cancelled: [["accepted", "Re-accept request", true]],
};

const money = (value) => `$${Number(value).toFixed(2)}`;

function RequestBoard({
  requests,
  selected,
  isLoading,
  isSaving,
  dateFilter,
  customDate,
  onDateFilterChange,
  onCustomDateChange,
  onOpen,
  onClose,
  onStatusChange,
}) {
  if (isLoading) return <div className="request-board-empty">Loading requests…</div>;

  return (
    <>
      <div className="request-date-filter">
        <label>
          Request date
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value)}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="custom">Choose a date</option>
            <option value="all">All dates</option>
          </select>
        </label>
        {dateFilter === "custom" && (
          <label>
            Date
            <input
              type="date"
              value={customDate}
              onChange={(event) => onCustomDateChange(event.target.value)}
            />
          </label>
        )}
      </div>
      <section className="request-board">
        {requests.length === 0 ? (
          <div className="request-board-empty">
            <span>✓</span><h3>No requests yet</h3>
            <p>New table requests will appear here automatically.</p>
          </div>
        ) : requests.map((request) => (
          <button className={`request-ticket status-${request.status}`} key={request.id} type="button" onClick={() => onOpen(request.id)}>
            <div>
              <span className="request-number">#{request.id}</span>
              <span className={`request-status status-${request.status}`}>{LABELS[request.status]}</span>
            </div>
            <h3>Table {request.table_number}</h3>
            <p>{request.item_count} items · {money(request.price)}</p>
            <time>{new Date(request.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
          </button>
        ))}
      </section>

      {selected && (
        <div className="request-modal-backdrop" onMouseDown={onClose}>
          <section className="request-detail" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="request-close" type="button" onClick={onClose}>×</button>
            <p className="eyebrow">Table {selected.table_number}</p>
            <div className="request-detail-title">
              <h2>Request #{selected.id}</h2>
              <span className={`request-status status-${selected.status}`}>{LABELS[selected.status]}</span>
            </div>
            <div className="request-detail-items">
              {selected.items.map((item) => (
                <article key={item.id}>
                  <div><strong>{item.qty} × {item.name}</strong><span>{money(Number(item.price) * item.qty)}</span></div>
                  {item.ingredients.map((choice, index) => (
                    <p key={`${choice.ingredientName}-${index}`}>{choice.ingredientName}: {choice.optionName}</p>
                  ))}
                </article>
              ))}
            </div>
            <div className="request-total"><span>Total</span><strong>{money(selected.price)}</strong></div>
            <div className="request-actions">
              {(ACTIONS[selected.status] || []).map(([status, label, primary]) => (
                <button className={primary ? "request-action-primary" : ""} key={status} type="button" disabled={isSaving} onClick={() => onStatusChange(status)}>{label}</button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default RequestBoard;
