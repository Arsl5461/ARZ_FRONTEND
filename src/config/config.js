export const ENV = {
    appBaseUrl: process.env.REACT_APP_BASE_ADMIN_API,
    appClientUrl: process.env.REACT_APP_BASE_URL,
    serverUrl: process.env.REACT_APP_SERVER_URL,
    Authorization: `Bearer ${process.env.REACT_APP_AUTHORIZATION}`,
    x_access_token: JSON.parse(localStorage.getItem('token')),
    x_auth_token: process.env.REACT_APP_X_AUTH_TOKEN,
    adminPrivateKey: process.env.REACT_APP_ADMIN_PRIVATE_KEY,
    file_Url: process.env.REACT_APP_BACKEND_FILE_URL,
    appPageInsightsUrl: process.env.REACT_APP_BASE_API_PAGEINSIGHTS,

    encryptUserData(data, token, id) {
        if (data) {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('userId', JSON.stringify(id));
        }
        if (token) {
            localStorage.setItem('token', JSON.stringify(token));
        }
        return true;
    },
    getUserKeys(keys = null) {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData;
    },
    getToken() {
        const userData = localStorage.getItem('token');
        if (userData) {
            return userData;
        }
        return {};
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
    },
    objectToQueryString(body) {
        const qs = Object.keys(body)
            .map((key) => `${key}=${body[key]}`)
            .join('&');
        return qs;
    },
};
