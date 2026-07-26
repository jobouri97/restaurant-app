function AdminHeader({ section, count, soundEnabled, onEnableSound }) {
  const isItems = section === "items";
  const isTables = section === "tables";
  const isRequests = section === "requests";
  const isProfits = section === "profits";
  const title = isProfits ? "Profits" : isRequests ? "Live requests" : isTables ? "Tables & QR" : isItems ? "Menu items" : "Categories";
  const description = isProfits
    ? "Review revenue recorded from every completed request."
    : isRequests
    ? "Accept incoming requests and keep every table updated in real time."
    : isTables
    ? "Create, manage, and print a unique QR card for every dining table."
    : isItems
      ? "Create dishes and shape every choice your guests can make."
      : "Organize your dishes into clear, inviting collections.";
  const singular = isProfits ? "record" : isRequests ? "request" : isTables ? "table" : isItems ? "item" : "category";
  const plural = isProfits ? "records" : isRequests ? "requests" : isTables ? "tables" : isItems ? "items" : "categories";

  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">{isProfits ? "Business overview" : isRequests ? "Restaurant operations" : "Menu management"}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="admin-header-actions">
        {isRequests && (
          <button
            className={`sound-toggle ${soundEnabled ? "enabled" : ""}`}
            type="button"
            onClick={onEnableSound}
            disabled={soundEnabled}
          >
            <span aria-hidden="true">{soundEnabled ? "♪" : "♩"}</span>
            {soundEnabled ? "Order sounds on" : "Enable order sounds"}
          </button>
        )}
        <span className="category-count">
          {count} {count === 1 ? singular : plural}
        </span>
      </div>
    </header>
  );
}

export default AdminHeader;
