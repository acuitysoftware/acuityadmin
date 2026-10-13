import apiClient from "../webApi.js";

/** 1. Fetch the list of blogs */
export async function getBlogsList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/blogs/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Blogs List API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 2. Create a new blog */
// Note: 'data' should be a FormData object to handle file uploads
export async function createBlog(token, data) {
  try {
    const response = await apiClient.post("/api/admin/blogs/create", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create Blog API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 3. View a specific blog */
export async function viewBlog(token, data) {
  try {
    const response = await apiClient.post("/api/admin/blogs/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("View Blog API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 4. Update a blog */
// Note: 'data' should be a FormData object to handle file uploads
export async function updateBlog(token, data) {
  try {
    const response = await apiClient.post("/api/admin/blogs/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update Blog API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 5. Delete blog(s) */
export async function deleteBlog(token, data) {
  try {
    const response = await apiClient.post("/api/admin/blogs/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete Blog API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** 6. Change blog status */
export async function changeBlogStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/blogs/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Change Blog Status API Error:", error.response?.data ?? error.message);
    throw error;
  }
}