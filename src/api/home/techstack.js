import apiClient from "../webApi";

/** Helper to extract response error message */
const getErrorMessage = (error) => {
    return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
};

/** 1. Fetch the list of technologies */
export async function getTechnologiesList(token, data = {}) {
    try {
        const response = await apiClient.post("/api/admin/technologies/list", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to fetch technologies list");
        }

        return response.data;
    } catch (error) {
        console.error("Get Technologies List API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 2. Create a new technology (multipart/form-data) */
export async function createTechnology(token, data) {
    try {
        const formData = new FormData();

        const nameVal = data.name ?? data.title;
        if (nameVal !== undefined && nameVal !== null) formData.append('name', nameVal);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/technologies/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to create technology");
        }

        return response.data;
    } catch (error) {
        console.error("Create Technology API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 3. View a specific technology */
export async function getTechnologyView(token, data) {
    try {
        const response = await apiClient.post("/api/admin/technologies/view", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to view technology");
        }

        return response.data;
    } catch (error) {
        console.error("View Technology API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 4. Update a specific technology (multipart/form-data) */
export async function updateTechnology(token, data) {
    try {
        const formData = new FormData();

        if (data.id !== undefined && data.id !== null) formData.append('id', data.id);
        const nameVal = data.name ?? data.title;
        if (nameVal !== undefined && nameVal !== null) formData.append('name', nameVal);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.existingImage) {
            formData.append('image', data.existingImage);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/technologies/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to update technology");
        }

        return response.data;
    } catch (error) {
        console.error("Update Technology API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 5. Delete technology/technologies */
export async function deleteTechnology(token, data) {
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

        const response = await apiClient.post("/api/admin/technologies/delete", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to delete technology");
        }

        return response.data;
    } catch (error) {
        console.error("Delete Technology API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 6. Change technology status */
export async function changeTechnologyStatus(token, data) {
    try {
        const response = await apiClient.post("/api/admin/technologies/status-change", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to change technology status");
        }

        return response.data;
    } catch (error) {
        console.error("Change Technology Status API Error:", getErrorMessage(error));
        throw error;
    }
}