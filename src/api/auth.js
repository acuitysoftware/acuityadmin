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

/** Reset admin password */
export async function resetPassword(data) {
  try {
    const response = await apiClient.post("/api/admin/reset-password", data, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Reset Password API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** Send forgot password OTP */
export async function forgotPassword(data) {
  try {
    const response = await apiClient.post("/api/admin/forgot-password", data, {
      headers: {
        Accept: "application/json",
        // Content-Type is application/json by default in apiClient
      },
    });
    return response.data;
  } catch (error) {
    console.error("Forgot Password API Error:", error.response?.data ?? error.message);
    throw error;
  }
}

/** Check forgot password OTP */
export async function checkForgotPasswordOtp(data) {
  try {
    const response = await apiClient.post("/api/admin/forgot-password-check-otp", data, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Check OTP API Error:", error.response?.data ?? error.message);
    throw error;
  }
}
