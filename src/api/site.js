import apiClient from "./webApi.js";

/** Apply the configured favicon to the current document. */
export function applySiteFavicon(faviconUrl) {
  if (!faviconUrl || typeof document === "undefined") return;

  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }

  icon.href = faviconUrl;
}

/** Fetch site settings */
export async function getSiteSettings(token) {
  try {
    const response = await apiClient.post(
      "/api/admin/site-settings",
      {}, // Empty body for the POST request
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get Site Settings API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** Update site settings */
export async function updateSiteSettings(token, data) {
  try {
    const formData = new FormData();

    // Append all fields dynamically to FormData
    Object.keys(data).forEach((key) => {
      // Handle file uploads separately
      if (['logo', 'favicon', 'footer_logo', 'cover_image'].includes(key)) {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      } else {
        // Append text fields (convert null to empty string if needed by backend)
        if (data[key] !== undefined) {
          formData.append(key, data[key] === null ? '' : data[key]);
        }
      }
    });

    const response = await apiClient.post(
      "/api/admin/site-settings/update",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update Site Settings API Error:", error.response?.data ?? error.message);
    throw error;
  }
}
