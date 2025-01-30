import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user, onViewPosts }) => {
  const [followersCount, setFollowersCount] = useState(null);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followersError, setFollowersError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle modal visibility
  const toggleModal = (image) => {
    setModalImage(image);
    setIsModalOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchFollowersCount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/${user.id}/followers-count/`
        );
        setFollowersCount(response.data.followers_count);
      } catch (err) {
        setFollowersError("Error fetching followers count");
      } finally {
        setFollowersLoading(false);
      }
    };

    fetchFollowersCount();
  }, [user.id]);

  return (
    <div className="p-6 lg:w-1/4 md:w-1/2 w-full">
      <div className="h-full flex items-center border-gray-200 border p-6 rounded-lg  shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img
          alt="user"
          className="w-20 h-20 object-cover object-center flex-shrink-0 rounded-full mr-6"
          src={
            user.profile_picture
              ? `http://localhost:8000${user.profile_picture}`
              : "https://via.placeholder.com/150"
          }
          onClick={() =>
            toggleModal(`http://localhost:8000${user.profile_picture}`)
          }
        />
        <div className="flex-grow ">
          <h2 className="text-xl text-white font-semibold text-gray-800">
            {user.username}
          </h2>

          {/* Followers Count */}
          {followersLoading ? (
            <div className="text-gray-500 text-sm mt-2">
              Loading followers...
            </div>
          ) : followersError ? (
            <div className="text-red-500 text-sm mt-2">{followersError}</div>
          ) : (
            <div className="text-white text-sm mt-2">
              <strong>{followersCount}</strong> Followers
            </div>
          )}

          <button
            onClick={() => onViewPosts(user.username)}
            className="mt-4 text-indigo-500 hover:text-indigo-700 text-sm"
          >
            View Posts
          </button>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => toggleModal(null)}
        >
          <div className="max-w-full max-h-full overflow-hidden">
            <img
              src={modalImage}
              alt="Image"
              className="max-w-screen-sm max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/users-list/"
        );
        setUsers(response.data);
        setFilteredUsers(response.data); // Initially, display all users
      } catch (err) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    setSearchTerm(searchQuery);

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleViewPostsClick = (username) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate(`/user/${username}/posts`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200" />
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
          <p className="text-lg font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-blue-800 via-black to-purple-900 text-white bg-cover bg-center">
      <section className="body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4">
              Users
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              &quot;Explore Ideas, Discover Stories – Your Go-To Blog for
              Inspiration and Insights!&quot;
            </p>
  
            {/* Search Input */}
            <div className="relative mt-6">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-2 px-4 rounded-lg text-black focus:outline-none"
                placeholder="Search users by username..."
              />
            </div>
          </div>
          <div className="flex flex-wrap -m-2">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.username}
                user={user}
                onViewPosts={handleViewPostsClick}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
  
};

export default UserListPage;
