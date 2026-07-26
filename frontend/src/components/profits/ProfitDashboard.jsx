import { useMemo, useState } from "react";

const money = (value) => `$${Number(value).toFixed(2)}`;

const isSameDay = (value, date) => {
  const candidate = new Date(value);
  return candidate.getFullYear() === date.getFullYear()
    && candidate.getMonth() === date.getMonth()
    && candidate.getDate() === date.getDate();
};

function ProfitDashboard({
  profits,
  isLoading,
  selected,
  loadingProfitId,
  onOpen,
  onClose,
}) {
  const [period, setPeriod] = useState("all");
  const today = new Date();

  const todayTotal = profits
    .filter((profit) => isSameDay(profit.created_at, today))
    .reduce((sum, profit) => sum + Number(profit.price), 0);
  const total = profits.reduce((sum, profit) => sum + Number(profit.price), 0);

  const visibleProfits = useMemo(() => {
    if (period === "all") return profits;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (period === "today") {
      return profits.filter((profit) => isSameDay(profit.created_at, start));
    }
    if (period === "last7") start.setDate(start.getDate() - 6);
    if (period === "month") start.setDate(1);
    return profits.filter((profit) => new Date(profit.created_at) >= start);
  }, [period, profits]);

  if (isLoading) return <div className="request-board-empty">Loading profits…</div>;

  return (
    <section className="profit-dashboard">
      <div className="profit-summary-grid">
        <article>
          <span>All-time profit</span>
          <strong>{money(total)}</strong>
          <small>From completed requests</small>
        </article>
        <article>
          <span>Today</span>
          <strong>{money(todayTotal)}</strong>
          <small>{today.toLocaleDateString()}</small>
        </article>
        <article>
          <span>Completed requests</span>
          <strong>{profits.length}</strong>
          <small>Recorded once per request</small>
        </article>
      </div>

      <div className="profit-list-heading">
        <div>
          <p className="eyebrow">Transaction history</p>
          <h2>Completed requests</h2>
        </div>
        <label>
          Period
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="month">This month</option>
          </select>
        </label>
      </div>

      {visibleProfits.length === 0 ? (
        <div className="request-board-empty">
          <h3>No completed requests</h3>
          <p>Profits appear here when requests are marked Completed.</p>
        </div>
      ) : (
        <div className="profit-table-wrap">
          <table className="profit-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Table</th>
                <th>Completed</th>
                <th>Profit</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {visibleProfits.map((profit) => (
                <tr key={profit.id}>
                  <td data-label="Request">#{profit.request_id}</td>
                  <td data-label="Table">Table {profit.table_number}</td>
                  <td data-label="Completed">{new Date(profit.created_at).toLocaleString()}</td>
                  <td data-label="Profit"><strong>{money(profit.price)}</strong></td>
                  <td data-label="Order">
                    <button
                      className="profit-view-button"
                      type="button"
                      disabled={loadingProfitId !== null}
                      onClick={() => onOpen(profit.id)}
                    >
                      {loadingProfitId === profit.id ? "Loading…" : "View order"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="request-modal-backdrop" onMouseDown={onClose}>
          <section
            className="request-detail profit-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profit-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="request-close"
              type="button"
              onClick={onClose}
              aria-label="Close order details"
            >
              &times;
            </button>
            <p className="eyebrow">Table {selected.table_number}</p>
            <div className="request-detail-title">
              <h2 id="profit-detail-title">Request #{selected.request_id}</h2>
              <strong>{money(selected.price)}</strong>
            </div>
            <p className="profit-detail-meta">
              Completed {new Date(selected.created_at).toLocaleString()}
            </p>
            <div className="request-detail-items">
              {selected.items.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.qty} &times; {item.name}</strong>
                    <span>{money(Number(item.price) * item.qty)}</span>
                  </div>
                  {item.ingredients.length > 0 ? (
                    item.ingredients.map((choice, index) => (
                      <p key={`${choice.ingredientName}-${index}`}>
                        {choice.ingredientName}: {choice.optionName}
                      </p>
                    ))
                  ) : (
                    <p>No options selected</p>
                  )}
                </article>
              ))}
            </div>
            <div className="request-total">
              <span>Total profit</span>
              <strong>{money(selected.price)}</strong>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ProfitDashboard;
