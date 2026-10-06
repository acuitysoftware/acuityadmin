import apiClient from "../webApi";

/** Helper to extract response error message */
const getErrorMessage = (error) => {
    return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
};

/** 1. Fetch the list of our solutions */
export async function getSolutionsList(token, data = {}) {
    try {
        const response = await apiClient.post("/api/admin/our-solutions/list", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to fetch solutions list");
        }

        return response.data;
    } catch (error) {
        console.error("Get Solutions List API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 2. Create a new our solution (multipart/form-data) */
export async function createSolution(token, data) {
    try {
        const formData = new FormData();

        const titleVal = data.title ?? data.name;
        if (titleVal !== undefined && titleVal !== null) formData.append('title', titleVal);
        if (data.short_description !== undefined && data.short_description !== null) formData.append('short_description', data.short_description);
        if (data.description !== undefined && data.description !== null) formData.append('description', data.description);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/our-solutions/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to create solution");
        }

        return response.data;
    } catch (error) {
        console.error("Create Solution API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 3. View a specific our solution */
export async function getSolutionView(token, data) {
    try {
        const response = await apiClient.post("/api/admin/our-solutions/view", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to view solution");
        }

        return response.data;
    } catch (error) {
        console.error("View Solution API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 4. Update a specific our solution (multipart/form-data) */
export async function updateSolution(token, data) {
    try {
        const formData = new FormData();

        if (data.id !== undefined && data.id !== null) formData.append('id', data.id);
        const titleVal = data.title ?? data.name;
        if (titleVal !== undefined && titleVal !== null) formData.append('title', titleVal);
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

        const response = await apiClient.post("/api/admin/our-solutions/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to update solution");
        }

        return response.data;
    } catch (error) {
        console.error("Update Solution API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 5. Delete our solution(s) */
export async function deleteSolution(token, data) {
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

        const response = await apiClient.post("/api/admin/our-solutions/delete", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to delete solution(s)");
        }

        return response.data;
    } catch (error) {
        console.error("Delete Solution API Error:", getErrorMessage(error));
        throw error;
    }
}

/** 6. Change our solution status */
export async function changeSolutionStatus(token, data) {
    try {
        const response = await apiClient.post("/api/admin/our-solutions/status-change", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to change solution status");
        }

        return response.data;
    } catch (error) {
        console.error("Change Solution Status API Error:", getErrorMessage(error));
        throw error;
    }
}