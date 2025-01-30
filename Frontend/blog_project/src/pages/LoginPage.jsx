import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState("");

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isLoginSuccessful = await login(credentials);
      if (isLoginSuccessful) {
        toast.success("Login successful!"); // Success toast
        navigate("/");
      } else {
        setError("Invalid username or password. Please try again.");
        toast.error("Invalid username or password. Please try again."); // Error toast
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      toast.error("Something went wrong. Please try again later."); // Error toast
    }
  };

  return (
    <div
      className="w-full flex items-center justify-center py-12 px-6 sm:px-12"
      style={{
        backgroundImage: 'url("/images/login-background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "92.5vh",
      }}
    >
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl flex overflow-hidden">
        {/* Left Section: Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <div className="text-center">
            <img
              src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
              alt="Logo"
              className="w-24 mx-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mt-6">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Please log in to your account.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-sm"
                placeholder="Username"
              />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-sm"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
            >
              <svg
                className="w-8 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy={7} r={4} />
                <path d="M20 8v6M23 11h-6" />
              </svg>
              Login
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Forgot Password?{" "}
                <Link
                  to="/password-reset"
                  className="text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Reset here
                </Link>
              </p>
            </div>
          </form>
        </div>
        {/* Right Section: Background */}
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/background.jpg")' }}
        ></div>
      </div>
      {/* Toast Container for Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
