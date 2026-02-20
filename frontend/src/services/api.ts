import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Token Refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login or attempt refresh)
            localStorage.removeItem('access_token');
            // Use window.location as fallback to router
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
