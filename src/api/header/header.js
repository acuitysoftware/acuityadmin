import apiClient from "../webApi.js";

/** 1. Fetch the list of menus */
export async function getMenusList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/menus/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Menus List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 2. Fetch the list of parent menus */
export async function getParentMenusList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/parent-menus/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Parent Menus List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 3. Create a new menu */
export async function createMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/menus/create", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 4. View a specific menu */
export async function getMenuView(token, data) {
  try {
    const response = await apiClient.post("/api/admin/menus/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("View Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 5. Update a specific menu */
export async function updateMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/menus/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 6. Delete menu(s) */
export async function deleteMenu(token, data) {
  try {
    const response = await apiClient.post("/api/admin/menus/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete Menu API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 7. Update menu rank */
export async function updateMenuRank(token, data) {
  try {
    const response = await apiClient.post("/api/admin/menus/update-rank", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Menu Rank API Error:", error.response?.data ?? error.message);
    throw error;
  }
}