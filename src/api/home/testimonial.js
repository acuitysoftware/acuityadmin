import apiClient from "../webApi";

const getErrorMessage = (error) => error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
const throwIfRequestFailed = (response, fallback) => {
  if (response.data?.status === false) throw new Error(response.data.message || fallback);
};

/** 1. Fetch the list of testimonials */
export async function getTestimonialsList(token, data = {}) {
  try {
    const response = await apiClient.post("/api/admin/testimonials/list", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to fetch testimonials list");
    return response.data;
  } catch (error) {
    console.error("Get Testimonials List API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 2. Create a new testimonial (multipart/form-data) */
export async function createTestimonial(token, data) {
  try {
    const formData = new FormData();

    if (data.name !== undefined && data.name !== null) formData.append("name", data.name);
    if (data.designation !== undefined && data.designation !== null) formData.append("designation", data.designation);
    if (data.description !== undefined && data.description !== null) formData.append("description", data.description);
    if (data.rating !== undefined && data.rating !== null) formData.append("rating", data.rating);
    if (data.image && typeof File !== "undefined" && data.image instanceof File) formData.append("image", data.image);

    const response = await apiClient.post("/api/admin/testimonials/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    throwIfRequestFailed(response, "Failed to create testimonial");
    return response.data;
  } catch (error) {
    console.error("Create Testimonial API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 3. View a specific testimonial */
export async function getTestimonialView(token, data) {
  try {
    const response = await apiClient.post("/api/admin/testimonials/view", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to view testimonial");
    return response.data;
  } catch (error) {
    console.error("View Testimonial API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 4. Update a specific testimonial (multipart/form-data) */
export async function updateTestimonial(token, data) {
  try {
    const formData = new FormData();

    if (data.id !== undefined && data.id !== null) formData.append("id", data.id);
    if (data.name !== undefined && data.name !== null) formData.append("name", data.name);
    if (data.designation !== undefined && data.designation !== null) formData.append("designation", data.designation);
    if (data.description !== undefined && data.description !== null) formData.append("description", data.description);
    if (data.rating !== undefined && data.rating !== null) formData.append("rating", data.rating);

    if (data.image && typeof File !== "undefined" && data.image instanceof File) {
      formData.append("image", data.image);
    } else if (data.existingImage) {
      formData.append("image", data.existingImage);
    } else if (data.image) {
      formData.append("image", data.image);
    }

    const response = await apiClient.post("/api/admin/testimonials/update", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    throwIfRequestFailed(response, "Failed to update testimonial");
    return response.data;
  } catch (error) {
    console.error("Update Testimonial API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 5. Delete testimonial(s) */
export async function deleteTestimonial(token, data) {
  try {
    const response = await apiClient.post("/api/admin/testimonials/delete", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to delete testimonial(s)");
    return response.data;
  } catch (error) {
    console.error("Delete Testimonial API Error:", getErrorMessage(error));
    throw error;
  }
}

/** 6. Change testimonial status */
export async function changeTestimonialStatus(token, data) {
  try {
    const response = await apiClient.post("/api/admin/testimonials/status-change", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    throwIfRequestFailed(response, "Failed to change testimonial status");
    return response.data;
  } catch (error) {
    console.error("Change Testimonial Status API Error:", getErrorMessage(error));
    throw error;
  }
}
