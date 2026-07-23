import { useState } from "react";

function CategoryImage({ category }) {
  const [failedUrl, setFailedUrl] = useState("");

  if (!category.image_url || failedUrl === category.image_url) {
    return (
      <span className="category-initial" aria-hidden="true">
        {category.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={category.image_url}
      alt={`${category.name} category`}
      onError={() => setFailedUrl(category.image_url)}
    />
  );
}

export default CategoryImage;
