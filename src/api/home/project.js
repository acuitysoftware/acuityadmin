import apiClient from "../webApi";

const getErrorMessage = (error) =>
  error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";

const throwIfRequestFailed = (response, fallback) => {
  if (response.data?.status === false) {
    throw new Error(response.data.message || fallback);
  }
};

/** 1. Fetch the list of projects */
export async function getProjectsList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/projects/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    throwIfRequestFailed(response, "Failed to fetch projects list");
    return response.data;
  } catch (error) {
    console.error("Get Projects List API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 2. Create a new project (multipart/form-data) */
export async function createProject(token, data) {
  try {
    const formData = new FormData();

    if (data.title !== undefined && data.title !== null) formData.append("title", data.title);
    if (data.description !== undefined && data.description !== null) formData.append("description", data.description);
    if (data.image && typeof File !== "undefined" && data.image instanceof File) formData.append("image", data.image);

    const response = await apiClient.post("/api/admin/projects/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    throwIfRequestFailed(response, "Failed to create project");
    return response.data;
  } catch (error) {
    console.error("Create Project API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 3. View a specific project */
export async function getProjectView(token, data) {
  try {
    const response = await apiClient.post("/api/admin/projects/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to view project");
    return response.data;
  } catch (error) {
    console.error("View Project API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 4. Update a specific project (multipart/form-data) */
export async function updateProject(token, data) {
  try {
    const formData = new FormData();

    if (data.id !== undefined && data.id !== null) formData.append("id", data.id);
    if (data.title !== undefined && data.title !== null) formData.append("title", data.title);
    if (data.description !== undefined && data.description !== null) formData.append("description", data.description);
    if (data.image && typeof File !== "undefined" && data.image instanceof File) formData.append("image", data.image);

    const response = await apiClient.post("/api/admin/projects/update", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    throwIfRequestFailed(response, "Failed to update project");
    return response.data;
  } catch (error) {
    console.error("Update Project API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 5. Delete project(s) */
export async function deleteProject(token, data) {
  try {
    const response = await apiClient.post("/api/admin/projects/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to delete project(s)");
    return response.data;
  } catch (error) {
    console.error("Delete Project API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 6. Change project status */
export async function changeProjectStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/projects/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to change project status");
    return response.data;
  } catch (error) {
    console.error("Change Project Status API Error:", getErrorMessage(error));
    throw error;
  }
}
