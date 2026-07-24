import { QRCodeSVG } from "qrcode.react";

function TableCard({ table, restaurantName, onDelete }) {
  const cardId = `print-table-${table.id}`;

  const printCard = () => {
    const card = document.getElementById(cardId);
    card?.classList.add("print-target");
    window.print();
    card?.classList.remove("print-target");
  };

  return (
    <article className="table-card" id={cardId}>
      <div className="table-print-card">
        <p className="table-restaurant">{restaurantName}</p>
        <p className="table-label">TABLE</p>
        <h3>{table.number}</h3>
        <div className="qr-frame">
          <QRCodeSVG
            value={table.qrUrl}
            size={220}
            level="H"
            marginSize={2}
            title={`QR code for table ${table.number}`}
          />
        </div>
        <strong>Scan to view our menu</strong>
        <p className="table-hint">Point your phone camera at the QR code</p>
      </div>

      <div className="table-card-actions">
        <button type="button" onClick={printCard}>Print QR card</button>
        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(table)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TableCard;
