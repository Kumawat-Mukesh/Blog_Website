// LogoutPage.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';  // Import the AuthContext
import { useNavigate } from 'react-router-dom';  // For redirecting after logout

const LogoutPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();  // For redirecting user after logout

    useEffect(() => {
        logout();  // Call the logout function to clear user data
        navigate('/login');  // Redirect to login page after logout
    }, [logout, navigate]);

    return (
        <div>
            <h1>Logging out...</h1>
            {/* You can add a loader/spinner here if needed */}
        </div>
    );
};

export default LogoutPage;
