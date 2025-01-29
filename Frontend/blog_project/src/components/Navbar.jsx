import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // To handle mobile menu toggle

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu on mobile
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900 bg-opacity-90 backdrop-blur-md border-b border-purple-700 shadow-lg sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-6 py-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {/* <span className="text-white font-semibold mr-4">
            Hello, {user.username}
          </span> */}
        </Link>

        {/* Right Section */}
        <div className="flex items-center lg:order-2">
          {!user ? (
            <p className="text-white">Access Your World.</p>
          ) : (
            <>
              <button
                onClick={logout}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 transition duration-300"
              >
                Logout
              </button>
            </>
          )}
          {/* Mobile Menu Button */}
          <button
            onClick={handleMenuToggle}
            className="inline-flex items-center p-2 ml-4 text-sm text-gray-400 rounded-lg lg:hidden hover:bg-gray-700 focus:ring-2 focus:ring-purple-600 transition"
            aria-controls="mobile-menu-2"
            aria-expanded={isMenuOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Navbar Links */}
        <div
          className={`lg:flex lg:w-auto w-full flex-col lg:flex-row lg:space-x-8 lg:mt-0 text-white font-medium ${
            isMenuOpen ? "block" : "hidden"
          }`}
          id="mobile-menu-2"
        >
          <ul className="flex flex-col lg:flex-row lg:space-x-8 lg:mt-0 text-white font-medium">
            {user ? (
              <>
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 pl-3 pr-4 rounded text-purple-400 hover:text-purple-400 transition duration-300"
                        : "block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                    }
                    aria-current="page"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 pl-3 pr-4 rounded text-purple-400 hover:text-purple-400 transition duration-300"
                        : "block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                    }
                  >
                    Category
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/user-list"
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 pl-3 pr-4 rounded text-purple-400 hover:text-purple-400 transition duration-300"
                        : "block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                    }
                  >
                    Users
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 pl-3 pr-4 rounded text-purple-400 hover:text-purple-400 transition duration-300"
                        : "block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                    }
                  >
                    User Profile
                  </NavLink>
                </li>
              </>
            ) : (
              <>
              <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive
                        ? "block py-2 pl-3 pr-4 rounded text-purple-400 hover:text-purple-400 transition duration-300"
                        : "block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                    }
                    aria-current="page"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className="block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                  >
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className="block py-2 pl-3 pr-4 rounded hover:text-purple-400 transition duration-300"
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
