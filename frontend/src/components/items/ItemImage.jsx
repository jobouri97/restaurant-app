import { useState } from "react";

function ItemImage({ item }) {
  const [failedUrl, setFailedUrl] = useState("");

  if (!item.image_url || failedUrl === item.image_url) {
    return (
      <span className="category-initial" aria-hidden="true">
        {item.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={item.image_url}
      alt={item.name}
      onError={() => setFailedUrl(item.image_url)}
    />
  );
}

export default ItemImage;
