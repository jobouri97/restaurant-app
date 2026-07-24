import { useMemo, useState } from "react";

const money = (value) => `$${Number(value).toFixed(2)}`;

const isSameDay = (value, date) => {
  const candidate = new Date(value);
  return candidate.getFullYear() === date.getFullYear()
    && candidate.getMonth() === date.getMonth()
    && candidate.getDate() === date.getDate();
};

function ProfitDashboard({ profits, isLoading }) {
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
              </tr>
            </thead>
            <tbody>
              {visibleProfits.map((profit, index) => (
                <tr key={profit.id}>
                  <td>#{visibleProfits.length - index}</td>
                  <td>Table {profit.table_number}</td>
                  <td>{new Date(profit.created_at).toLocaleString()}</td>
                  <td><strong>{money(profit.price)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ProfitDashboard;
