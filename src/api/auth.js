import apiClient from "./webApi.js";

/** Sign in an admin and return the API response data. */
export async function adminLogin(email, password) {
  try {
    const response = await apiClient.post("/api/admin/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data ?? error.message);
    throw error;
  }
}
