import apiClient from "../webApi";

/** Helper to extract response error message */
const getErrorMessage = (error) => {
    return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
};

/** Fetch the list of services */
export async function getServicesList(token, data = {}) {
    try {
        const response = await apiClient.post("/api/admin/services/list", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to fetch services list");
        }

        return response.data;
    } catch (error) {
        console.error("Get Services List API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Create a new service (multipart/form-data) */
export async function createService(token, data) {
    try {
        const formData = new FormData();

        if (data.title !== undefined && data.title !== null) formData.append('title', data.title);
        if (data.short_description !== undefined && data.short_description !== null) formData.append('short_description', data.short_description);
        if (data.description !== undefined && data.description !== null) formData.append('description', data.description);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/services/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to create service");
        }

        return response.data;
    } catch (error) {
        console.error("Create Service API Error:", getErrorMessage(error));
        throw error;
    }
}

/** View a specific service */
export async function getServiceView(token, data) {
    try {
        const response = await apiClient.post("/api/admin/services/view", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to view service");
        }

        return response.data;
    } catch (error) {
        console.error("View Service API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Update a specific service (multipart/form-data) */
export async function updateService(token, data) {
    try {
        const formData = new FormData();

        if (data.id !== undefined && data.id !== null) formData.append('id', data.id);
        if (data.title !== undefined && data.title !== null) formData.append('title', data.title);
        if (data.short_description !== undefined && data.short_description !== null) formData.append('short_description', data.short_description);
        if (data.description !== undefined && data.description !== null) formData.append('description', data.description);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.existingImage) {
            formData.append('image', data.existingImage);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/services/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to update service");
        }

        return response.data;
    } catch (error) {
        console.error("Update Service API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Delete service(s) */
export async function deleteService(token, data) {
    try {
        let payload = data;
        if (Array.isArray(data)) {
            payload = { ids: data };
        } else if (typeof data?.ids === "string") {
            try {
                payload = { ids: JSON.parse(data.ids) };
            } catch {
                payload = data;
            }
        }

        const response = await apiClient.post("/api/admin/services/delete", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to delete service(s)");
        }

        return response.data;
    } catch (error) {
        console.error("Delete Service API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Change service status */
export async function changeServiceStatus(token, data) {
    try {
        const response = await apiClient.post("/api/admin/services/status-change", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to change service status");
        }

        return response.data;
    } catch (error) {
        console.error("Change Service Status API Error:", getErrorMessage(error));
        throw error;
    }
}