import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_ADMIN_API,
});

// Add an interceptor to handle 403 responses
api.interceptors.response.use(
    (response) => {
        // If the response is successful, return it
        return response;
    },
    (error) => {
        if (error.response.status === 403) {
            // If a 403 (Forbidden) response is received, redirect to the login page
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId'); // Remove the user's authentication information
            window.location.href = '/login'; // Redirect to the login page
        } else if (error.response.status === 401) {
            // If a 401 (Unauthorized) response is received, the token has likely expired
            // You can add additional logic to refresh the token or handle expiration here
            // For now, simply redirect to the login page
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
