import apiClient from "../webApi";

/** 1. Fetch the list of footer menus */
export async function getFooterMenusList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Footer Menus List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 2. Create a new footer menu */
export async function createFooterMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/create", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create Footer Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 3. View a specific footer menu */
export async function getFooterMenuView(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("View Footer Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 4. Update a specific footer menu */
export async function updateFooterMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Footer Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 5. Delete footer menu(s) */
export async function deleteFooterMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete Footer Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 6. Change footer menu status */
export async function changeFooterMenuStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Change Footer Menu Status API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 7. Update footer menu rank */
export async function updateFooterMenuRank(token, data) {
  try {
    const response = await apiClient.post("/api/admin/footer-menus/update-rank", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Footer Menu Rank API Error:", error.response?.data ?? error.message);
    throw error;
  }
}