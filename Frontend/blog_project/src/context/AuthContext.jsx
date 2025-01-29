import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        credentials
      );
      setToken(response.data.access);
      setUser(response.data.user);
      localStorage.setItem("token", response.data.access);
      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      toast.error("Invalid credentials!");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Registered successfully! You can now log in.");
    } catch (error) {
      toast.error("Registration failed!", error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    toast.info("Logged out!");
  };

  // New: Function to update user data
  const updateUser = async (updatedUserData) => {
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile/",
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data); // Update the user state with new data
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          toast.error("Failed to fetch user data. Please log in again.");
          logout();
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser, // Add this to the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
