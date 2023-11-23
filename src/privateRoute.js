import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Custom PrivateRoute component
 *
 * Author: Ali Haider
 * Date: 19 Sep, 2023
 */
const PrivateRoute = ({ element, isAuthenticated }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
