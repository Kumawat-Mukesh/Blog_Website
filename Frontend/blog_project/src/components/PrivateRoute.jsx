import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Redirect unauthorized users to the login page, saving the attempted path for after login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
