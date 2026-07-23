function AdminAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="admin-alert" role="alert">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}

export default AdminAlert;
