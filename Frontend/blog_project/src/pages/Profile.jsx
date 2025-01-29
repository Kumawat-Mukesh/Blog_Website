import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import UserCommentsPage from "./UserCommentsPage";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const Profile = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [followersCount, setFollowersCount] = useState("N/A");
  const [followingCount, setFollowingCount] = useState("N/A");
  const [postCount, setPostCount] = useState("N/A");
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Toggle modal visibility
  const toggleModal = (image) => {
    setModalImage(image);
    setIsModalOpen((prevState) => !prevState);
  };

  const profilePicUrl = user?.profile_picture
    ? `http://127.0.0.1:8000${user.profile_picture}`
    : "https://via.placeholder.com/150";

  useEffect(() => {
    if (user?.id && token) {
      // Fetch followers count
      fetch(`http://127.0.0.1:8000/api/user/${user.id}/followers-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setFollowersCount(data.followers_count || "N/A"))
        .catch(() => setFollowersCount("N/A"));

      // Fetch following count
      fetch(`http://127.0.0.1:8000/api/user/${user.id}/following-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setFollowingCount(data.following_count || "N/A"))
        .catch(() => setFollowingCount("N/A"));

      // Fetch post count
      fetch(`http://127.0.0.1:8000/api/user/${user.id}/post-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setPostCount(data.post_count || "N/A"))
        .catch(() => setPostCount("N/A"));

      // Fetch posts for the logged-in user
      fetch(`http://127.0.0.1:8000/api/users/${user.id}/posts/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUserPosts(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
          setError("Error fetching posts");
          setLoading(false);
        });
    }
  }, [user?.id, token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeletePost = (slug) => {
    fetch(`http://127.0.0.1:8000/api/posts/${slug}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setUserPosts(userPosts.filter((post) => post.slug !== slug));
          toast.success("Post deleted successfully!");
        } else {
          setError("Failed to delete the post");
          toast.error("Failed to delete the post");
        }
      })
      .catch(() => {
        setError("Failed to delete the post");
        toast.error("Failed to delete the post");
      });
  };
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto mt-16 bg-white shadow-2xl rounded-2xl text-gray-900 overflow-hidden">
        {/* Background Image Section */}
        <div className="relative w-full h-40 md:h-48 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-40"></div>
        </div>

        {/* Profile Picture */}
        <div className="relative -mt-16 w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl overflow-hidden transform transition duration-300 hover:scale-105">
          <img
            className="object-cover w-full h-full"
            src={profilePicUrl}
            alt="Profile"
          />
        </div>

        {/* Profile Information */}
        <div className="text-center p-6 bg-white">
          <h2 className="font-semibold text-2xl text-gray-800">
            {user?.username || "Guest"}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            {user?.email || "No email available"}
          </p>
          {user?.bio && (
            <p className="text-gray-600 mt-4 border-t pt-4 text-sm italic">
              {user?.bio}
            </p>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-around py-4 bg-gray-50 border-t">
          <div
            className="text-center space-y-1"
            onClick={() => navigate(`/followers-list/${user.id}`)}
          >
            <h3 className="text-lg font-medium text-gray-700">Followers</h3>
            <p className="text-xl font-semibold text-indigo-600">
              {followersCount}
            </p>
          </div>
          <div
            className="text-center space-y-1"
            onClick={() => navigate(`/following-list/${user.id}`)}
          >
            <h3 className="text-lg font-medium text-gray-700">Following</h3>
            <p className="text-xl font-semibold text-indigo-600">
              {followingCount}
            </p>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-medium text-gray-700">Posts</h3>
            <p className="text-xl font-semibold text-indigo-600">{postCount}</p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col md:flex-row justify-between gap-4 p-6 bg-white border-t">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full md:w-auto rounded-full bg-red-600 text-white py-2 px-6 hover:bg-red-700 transition-transform duration-300 transform hover:scale-105 shadow-lg"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full md:w-auto rounded-full bg-gray-900 text-white py-2 px-6 hover:bg-gray-800 transition-transform duration-300 transform hover:scale-105 shadow-lg"
            >
              Login
            </Link>
          )}
          <Link
            to="/create-post"
            className="w-full md:w-auto rounded-full bg-indigo-600 text-white py-2 px-6 hover:bg-indigo-500 transition-transform duration-300 transform hover:scale-105 shadow-lg"
          >
            Create Post
          </Link>
          <Link
            to="/update-profile"
            className="w-full md:w-auto rounded-full bg-blue-600 text-white py-2 px-6 hover:bg-blue-500 transition-transform duration-300 transform hover:scale-105 shadow-lg"
          >
            Update Profile
          </Link>
          <Link
            to="/password-reset"
            className="w-full md:w-auto rounded-full bg-blue-600 text-white py-2 px-6 hover:bg-blue-500 transition-transform duration-300 transform hover:scale-105 shadow-lg"
          >
            Reset Password
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 my-12">
        {/* Loading and Error States */}
        {loading && <p className="text-gray-600 text-lg">Loading posts...</p>}
        {error && (
          <p className="text-red-500 text-lg">Error loading posts: {error}</p>
        )}

        {/* Posts Table */}
        {!loading && !error && userPosts.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPosts.map((post) => (
                  <tr
                    key={post.slug}
                    className="hover:bg-gray-50 transition-colors duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link
                        to={`/posts/${post.slug}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {post.content.length > 100
                        ? `${post.content.slice(0, 100)}...`
                        : post.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.image && (
                        <img
                          src={`http://127.0.0.1:8000${post.image}`}
                          onClick={() =>
                            toggleModal(`http://127.0.0.1:8000${post.image}`)
                          }
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {post.analytics?.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {post.analytics?.likes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {post.analytics?.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                      <Link
                        to={`/edit-post/${post.slug}`}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors duration-300"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.slug)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-300"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* If No Posts */}
        {!loading && !error && userPosts.length === 0 && (
          <p className="text-gray-600 text-lg">No posts available.</p>
        )}
      </div>

      <UserCommentsPage />

      {/* Toast Container for Notifications */}
      <ToastContainer />

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => toggleModal(null)}
        >
          <div className="max-w-full max-h-full overflow-hidden">
            <img
              src={modalImage}
              alt="Modal Image"
              className="max-w-screen-sm max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
