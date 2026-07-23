export const validateImageUrl = (url) =>
  new Promise((resolve, reject) => {
    if (!url.trim()) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = resolve;
    image.onerror = () =>
      reject(
        new Error(
          "This URL is a webpage or cannot be loaded as an image. Use the direct image address.",
        ),
      );
    image.src = url;
  });
