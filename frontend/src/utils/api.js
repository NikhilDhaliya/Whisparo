import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem("token");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const postService = {
  // Get posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vote on a post
  votePost: async (postId, voteType) => {
    try {
      const response = await api.post(`/posts/${postId}/vote`, { voteType });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get vote status for a post
  getVoteStatus: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/vote-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
