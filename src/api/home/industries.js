import apiClient from "../webApi";

/** Helper to extract response error message */
const getErrorMessage = (error) => {
    return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
};

/** 1. Fetch the list of industries */
export async function getIndustriesList(token, data = {}) {
    try {
        const response = await apiClient.post("/api/admin/industies/list", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to fetch industries list");
        }

        return response.data;
    } catch (error) {
        console.error("Get Industries List API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 2. Create a new industry (multipart/form-data) */
export async function createIndustry(token, data) {
    try {
        const formData = new FormData();

        const nameVal = data.name ?? data.title;
        if (nameVal !== undefined && nameVal !== null) formData.append('name', nameVal);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/industies/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to create industry");
        }

        return response.data;
    } catch (error) {
        console.error("Create Industry API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 3. View a specific industry */
export async function getIndustryView(token, data) {
    try {
        const response = await apiClient.post("/api/admin/industies/view", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to view industry");
        }

        return response.data;
    } catch (error) {
        console.error("View Industry API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 4. Update a specific industry (multipart/form-data) - matched with client.js */
export async function updateIndustry(token, data) {
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

        const response = await apiClient.post("/api/admin/industies/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to update industry");
        }

        return response.data;
    } catch (error) {
        console.error("Update Industry API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 5. Delete industry/industries */
export async function deleteIndustry(token, data) {
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

        const response = await apiClient.post("/api/admin/industies/delete", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to delete industry");
        }

        return response.data;
    } catch (error) {
        console.error("Delete Industry API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 6. Change industry status */
export async function changeIndustryStatus(token, data) {
    try {
        const response = await apiClient.post("/api/admin/industies/status-change", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to change industry status");
        }

        return response.data;
    } catch (error) {
        console.error("Change Industry Status API Error:", getErrorMessage(error));
        throw error;
    }
}