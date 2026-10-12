import apiClient from "../webApi.js";

/** 1. Fetch the list of social links */
export async function getSocialLinksList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/social-links/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Social Links List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 2. Create a new social link */
export async function createSocialLink(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/create", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create Social Link API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 3. View a specific social link */
export async function viewSocialLink(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("View Social Link API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 4. Update a social link */
export async function updateSocialLink(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Social Link API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 5. Delete social link(s) */
export async function deleteSocialLink(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete Social Link API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 6. Change social link status */
export async function changeSocialLinkStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Change Social Link Status API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 7. Update social link rank */
export async function updateSocialLinkRank(token, data) {
  try {
    const response = await apiClient.post("/api/admin/social-links/update-rank", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Social Link Rank API Error:", error.response?.data ?? error.message);
    throw error;
  }
}