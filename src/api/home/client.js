import apiClient from "../webApi.js";

/** Helper to extract response error message */
const getErrorMessage = (error) => {
    return error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";
};

/** Fetch the list of clients */
export async function getClientsList(token, data = {}) {
    try {
        const response = await apiClient.post("/api/admin/clients/list", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to fetch clients list");
        }
        return response.data;
    } catch (error) {
        console.error("Get Clients List API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Create a new client */
export async function createClient(token, data) {
    try {
        const formData = new FormData();

        const nameVal = data.name ?? data.title;
        if (nameVal !== undefined && nameVal !== null) formData.append('name', nameVal);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/clients/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to create client");
        }

        return response.data;
    } catch (error) {
        const msg = getErrorMessage(error);
        console.error("Create Client API Error:", msg);
        throw error;
    }
}

/** View a specific client */
export async function getClientView(token, data) {
    try {
        const response = await apiClient.post("/api/admin/clients/view", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to view client");
        }

        return response.data;
    } catch (error) {
        console.error("View Client API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Update a specific client */
export async function updateClient(token, data) {
    try {
        const formData = new FormData();

        if (data.id !== undefined && data.id !== null) formData.append('id', data.id);
        const nameVal = data.name ?? data.title;
        if (nameVal !== undefined && nameVal !== null) formData.append('name', nameVal);
        if (data.status !== undefined && data.status !== null) formData.append('status', data.status);

        // Append image: if new File selected, append File. Else if existing image string present, append existing image string
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.existingImage) {
            formData.append('image', data.existingImage);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post("/api/admin/clients/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to update client");
        }

        return response.data;
    } catch (error) {
        const msg = getErrorMessage(error);
        console.error("Update Client API Error:", msg);
        throw error;
    }
}

/** Delete client(s) */
export async function deleteClient(token, data) {
    try {
        // Ensure ids is passed as a real Array: { ids: [1, 2] }
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

        const response = await apiClient.post("/api/admin/clients/delete", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to delete client(s)");
        }

        return response.data;
    } catch (error) {
        console.error("Delete Client API Error:", getErrorMessage(error));
        throw error;
    }
}

/** Change client status */
export async function changeClientStatus(token, data) {
    try {
        const response = await apiClient.post("/api/admin/clients/status-change", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.data && response.data.status === false) {
            throw new Error(response.data.message || "Failed to change client status");
        }

        return response.data;
    } catch (error) {
        console.error("Change Client Status API Error:", getErrorMessage(error));
        throw error;
    }
}