export const createPreviewUrl = (file) => URL.createObjectURL(file);

export const revokePreviewUrls = (urls) => {
  urls.forEach((url) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
};
