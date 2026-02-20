import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
    const token = localStorage.getItem('access_token');

    // If there's no token, redirect to the login page immediately.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child routes (e.g., AppLayout)
    return <Outlet />;
};

export default ProtectedRoute;
