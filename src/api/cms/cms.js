import apiClient from "../webApi";

/** 1. Fetch the list of CMS pages */
export async function getCmsList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/cms/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Get CMS List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 2. Create a new CMS page */
export async function createCms(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/create", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Create CMS API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 3. View a specific CMS page */
export async function getCmsView(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("View CMS API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 4. Update a specific CMS page */
export async function updateCms(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Update CMS API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 5. Update Home CMS page */
export async function updateHomeCms(token, data) {
  try {
    const response = await apiClient.post("/api/admin/home-cms/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Update Home CMS API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 6. Delete CMS page(s) */
export async function deleteCms(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Delete CMS API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 7. Change CMS page status */
export async function changeCmsStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Change CMS Status API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 8. Update CMS page rank */
export async function updateCmsRank(token, data) {
  try {
    const response = await apiClient.post("/api/admin/cms/update-rank", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data;
    if (responseData?.status === false) throw new Error(responseData.message || "Something went wrong");
    return responseData;
  } catch (error) {
    console.error("Update CMS Rank API Error:", error.response?.data ?? error.message);
    throw error;
  }
}
