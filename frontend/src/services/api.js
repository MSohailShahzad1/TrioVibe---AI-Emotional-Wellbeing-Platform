
const API_BASE_URL = "http://localhost:5000/api";

/* ----------------------------- Generic Request ----------------------------- */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 404) {
      throw new Error(`❌ Endpoint not found: ${endpoint}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Server returned non-JSON for ${endpoint} (status ${response.status}): ${text}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

/* --------------------------- Health Check --------------------------- */
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Backend connection failed:", error);
    return false;
  }
};

/* ------------------------------- Auth API ------------------------------- */
export const authAPI = {
  // User Registration
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: userData,
    }),

  // Login
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  // Logout
  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  // Verify Signup OTP
  verifySignupOtp: (email, otp) =>
    apiRequest("/auth/signup/verify-reset-otp", {
      method: "POST",
      body: { email, otp },
    }),

  // Send Password Reset OTP
  sendResetOtp: (email) =>
    apiRequest("/auth/send-reset-otp", {
      method: "POST",
      body: { email },
    }),

  // Verify Password Reset OTP
  verifyResetOtp: (email, otp) =>
    apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: { email, otp },
    }),

  // Reset Password
  resetPassword: (email, newPassword) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { email, newPassword },
    }),

  // Get Current User Profile
  getProfile: () => apiRequest("/auth/profile"),
};

/* ------------------------------- User API ------------------------------- */
export const userAPI = {
  getUserProfile: (userId) => apiRequest(`/user/profile/${userId}`),

  updateProfile: (profileData) =>
    apiRequest("/user/profile", {
      method: "PUT",
      body: profileData,
    }),

  searchUsers: (query) =>
    apiRequest(`/user/search?query=${encodeURIComponent(query)}`),

  advancedSearch: (filters) =>
    apiRequest("/user/search/advance", {
      method: "POST",
      body: filters,
    }),

  getSuggestedUsers: () => apiRequest("/user/suggested"),

  updateOnlineStatus: (statusData) =>
    apiRequest("/user/online-status", {
      method: "POST",
      body: statusData,
    }),

  removeAccount: () =>
    apiRequest("/user/remove", {
      method: "DELETE",
    }),
};

/* ------------------------------- Chat API ------------------------------- */
export const chatAPI = {
  startChat: (participantId) =>
    apiRequest("/chat/start", {
      method: "POST",
      body: { participantId },
    }),

  getChatRooms: () => apiRequest("/chat/rooms"),

  getMessages: (chatRoomId, page = 1, limit = 50) =>
    apiRequest(`/chat/${chatRoomId}/messages?page=${page}&limit=${limit}`),

  sendMessage: (chatRoomId, text, type = "text") =>
    apiRequest("/chat/message", {
      method: "POST",
      body: { chatRoomId, text, messageType: type },
    }),

  markMessagesRead: (chatRoomId) =>
    apiRequest(`/chat/${chatRoomId}/read`, {
      method: "PATCH",
    }),
};

/* ------------------------------- Meeting / Room API ------------------------------- */
export const roomAPI = {
  createRoom: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/room/create`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to create room`);
      return await res.json();
    } catch (err) {
      console.error("Error creating room:", err);
      throw err;
    }
  },

  validateRoom: async (roomId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/room/${roomId}/validate`);
      if (!res.ok) throw new Error(`Failed to validate room`);
      return await res.json();
    } catch (err) {
      console.error("Error validating room:", err);
      throw err;
    }
  },
};

/* ------------------------------- Therapist API ------------------------------- */
export const therapistAPI = {
  // User sends request to become therapist
  sendTherapistRequest: () =>
    apiRequest("/therapist/request", {
      method: "POST",
    }),

  // Admin gets all pending requests
  getPendingRequests: () => apiRequest("/therapist/requests"),

  // Admin approves or rejects request
  updateTherapistStatus: (userId, action) =>
    apiRequest(`/therapist/update/${userId}`, {
      method: "PUT",
      body: { action }, // "approve" or "reject"
    }),

  // Get list of all therapists
  getAllTherapists: () => apiRequest("/therapist/all"),

  // Get profile of single therapist (name, bio, experience, reviews)
getTherapistById: (therapistId) =>
    apiRequest(`/therapist/${therapistId}`, {
      method: "GET",
    }),
};


/* ------------------------------ Appointment API ------------------------------ */


export const appointmentAPI = {
  // Book appointment
  bookAppointment: (therapistId, date) =>
    apiRequest("/appointment/book", {
      method: "POST",
      body: { therapistId, date },
    }),

  // Get user appointments
  getMyAppointments: () =>
    apiRequest("/appointment/my", {
      method: "GET",
    }),

  // Get therapist appointments
  getTherapistAppointments: () =>
    apiRequest("/appointment/therapist", {
      method: "GET",
    }),

  // Approve appointment
  approveAppointment: (appointmentId) =>
    apiRequest(`/appointment/approve/${appointmentId}`, {
      method: "PUT",
    }),

  // Complete appointment
  completeAppointment: (appointmentId) =>
    apiRequest(`/appointment/complete/${appointmentId}`, {
      method: "PUT",
    }),

  // Add review
  addReview: (appointmentId, rating, review) =>
    apiRequest(`/appointment/review/${appointmentId}`, {
      method: "POST",
      body: { rating, review },
    }),
};



/* ------------------------------- Export Default ------------------------------- */
export default apiRequest;
