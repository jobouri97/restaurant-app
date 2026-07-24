import TableCard from "./TableCard.jsx";

function TableList({ tables, restaurantName, isLoading, onDelete }) {
  return (
    <section className="tables-section" aria-labelledby="tables-title">
      <div className="section-heading">
        <div>
          <h2 id="tables-title">Table QR cards</h2>
          <p>Print a card and place it on its matching table.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="table-grid" aria-label="Loading tables">
          {[1, 2, 3].map((item) => (
            <div className="table-card skeleton-card" key={item} />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">⌗</span>
          <h3>No table QR codes yet</h3>
          <p>Create your first table above to get its printable QR card.</p>
        </div>
      ) : (
        <div className="table-grid">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              restaurantName={restaurantName}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TableList;
