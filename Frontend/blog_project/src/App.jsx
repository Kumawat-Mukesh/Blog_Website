import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile";
import Categories from "./components/Categories";
import PostDetailPage from "./pages/PostDetailPage";
import UserListPage from "./components/UserListPage";
import UserPostsPage from "./components/UserPostsPage";
import UserCommentsPage from "./pages/UserCommentsPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import "react-toastify/dist/ReactToastify.css";
import PasswordReset from "./pages/PasswordReset";
import FollowingList from "./pages/FollowingList";
import FollowersList from "./pages/FollowersList";
const App = () => (
  <AuthProvider>
    <ToastContainer />
    <Router>
      <Navbar /> {/* Add Navbar globally for all routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/user/comments" element={<UserCommentsPage />} />
        <Route path="/user-list" element={<UserListPage />} />
        <Route path="/followers-list/:id" element={<FollowersList />} />
        <Route path="/following-list/:id" element={<FollowingList />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/password-reset" element={<PasswordReset />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-profile"
          element={
            <PrivateRoute>
              <UpdateProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/:slug"
          element={
            <PrivateRoute>
              <PostDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/:username/posts"
          element={
            <PrivateRoute>
              <UserPostsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <PrivateRoute>
              <CreatePostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-post/:slug"
          element={
            <PrivateRoute>
              <EditPostPage />
            </PrivateRoute>
          }
        />

        {/* Default route that redirects to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
