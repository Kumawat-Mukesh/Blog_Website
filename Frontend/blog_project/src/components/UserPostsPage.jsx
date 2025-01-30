import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useFetch from "../hooks/useFetch";
import { FaEye, FaThumbsUp, FaComment } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Profile Stats Component
const ProfileStats = ({ stats }) => (
  <div className="flex justify-evenly w-full py-6 bg-gray-200 rounded-xl shadow-md mt-4">
    {stats.map((stat, index) => (
      <div key={index} className="text-center">
        <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
        <p className="text-lg text-gray-600">{stat.label}</p>
      </div>
    ))}
  </div>
);

// Profile Card Component
const ProfileCard = memo(({ user, isFollowing, handleFollowToggle, stats }) => (
  <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
    {/* Image Section */}
    <div className="relative">
      <img
        className="w-full object-cover h-56"
        src={`${user?.profile_picture || "https://via.placeholder.com/100"}`}
        alt={`${user?.username || "User"}'s Profile`}
      />
      <div className="absolute bottom-0 left-0 top-0 right-0 bg-blue-700 bg-opacity-50 p-4 text-white flex flex-col justify-end items-center">
        <h2 className="text-2xl font-semibold">{user?.username || "Unknown User"}</h2>
      </div>
      <div className="absolute bottom-0 right-0 mb-6 mr-6 rounded-full h-16 w-16 flex items-center bg-green-400 justify-center text-4xl font-thin text-white shadow-2xl cursor-pointer">
        +
      </div>
    </div>

    {/* Profile Info */}
    <div className="pt-3 pb-5 px-5 flex flex-col items-center">
      <p className="font-bold text-3xl">{user?.username || "Unknown User"}</p>
      <p className="text-gray-500 mb-2">{user?.email || "Email not available"}</p>
      <p className="text-center mb-2">
        {user?.bio || "No bio available."}
      </p>

      {/* Stats Section */}
      <ProfileStats stats={stats} />

      {/* Follow Button */}
      {user?.username !== JSON.parse(localStorage.getItem("user"))?.username && (
        <button
          onClick={handleFollowToggle}
          className={`mt-4 px-6 py-3 rounded-full text-white transition-all duration-300 ${
            isFollowing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  </div>
));

ProfileCard.displayName = "ProfileCard";


// Post Card Component
const PostCard = ({ post, onReadMore }) => (
  <div className="w-full max-w-md text-center relative group overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transform transition-all duration-300">
    <div onClick={() => onReadMore(post.slug)} className="cursor-pointer">
      {post.image && (
        <div className="relative h-56 w-full">
          <img
            src={post.image}
            alt={post.title}
            className="object-cover w-full h-full rounded-t-xl transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
    </div>
    <div className="p-6">
      <h5
        className="text-xl font-semibold text-gray-800 mb-4 cursor-pointer"
        onClick={() => onReadMore(post.slug)}
      >
        {post.title}
      </h5>
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {post.content?.length > 100
          ? `${post.content.slice(0, 100)}...`
          : post.content}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <FaEye />
          <span>{post.analytics.views}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaThumbsUp />
          <span>{post.analytics.likes}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaComment />
          <span>{post.analytics.comments || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

// User Posts Page Component
const UserPostsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isFollowing, setIsFollowing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { data: postsResponse, loading, error } = useFetch(`http://127.0.0.1:8000/api/posts/?username=${username}`);
  const posts = postsResponse?.results || [];

  const stats = [
    {
      label: "Likes",
      value: posts.reduce((acc, post) => acc + post.analytics.likes, 0),
    },
    {
      label: "Views",
      value: posts.reduce((acc, post) => acc + post.analytics.views, 0),
    },
    {
      label: "Comments",
      value: posts.reduce((acc, post) => acc + post.analytics.comments, 0),
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/users/${username}/profile/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserProfile(response.data);

        const storedFollowState = localStorage.getItem(`isFollowing_${username}`);
        setIsFollowing(
          storedFollowState
            ? JSON.parse(storedFollowState)
            : response.data.is_followed_by_current_user
        );
      } catch (err) {
        toast.error("Error fetching user profile.");
      }
    };

    fetchUserProfile();
  }, [username, token]);

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("You must be logged in to follow.");
      return;
    }

    if (!userProfile) {
      toast.error("User profile not loaded. Please try again.");
      return;
    }

    if (JSON.parse(localStorage.getItem("user"))?.username === userProfile?.username) {
      toast.error("You cannot follow yourself.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/users/${userProfile.id}/follow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      localStorage.setItem(
        `isFollowing_${userProfile.username}`,
        JSON.stringify(newFollowState)
      );
      toast.success(newFollowState ? "Followed" : "Unfollowed");
    } catch (error) {
      if (error.response?.data?.detail === "You cannot follow yourself.") {
        toast.error("You cannot follow yourself.");
      } else {
        toast.error("Failed to update follow status.");
      }
    }
  };

  const handleReadMore = (slug) => {
    if (!token) {
      toast.error("You must be logged in to view this post.");
      navigate("/login");
      return;
    }
    navigate(`/posts/${slug}`);
  };

  return (
    <section className="flex flex-col lg:flex-row bg-gray-100 p-6">
      <ToastContainer />
      <aside className="w-full lg:w-1/3 p-6">
        {userProfile ? (
          <ProfileCard
            user={userProfile}
            isFollowing={isFollowing}
            handleFollowToggle={handleFollowToggle}
            stats={stats}
          />
        ) : (
          <div className="text-center text-gray-500">Loading profile...</div>
        )}
      </aside>
      <main className="w-full lg:w-2/3 p-6">
        <h4 className="text-3xl font-bold mb-6 text-gray-800">
          Posts by {userProfile?.username || "Unknown User"}
        </h4>
        {loading ? (
          <div className="text-center text-gray-600">Loading posts...</div>
        ) : posts.length ? (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReadMore={handleReadMore} />
            ))}
          </div>
        ) : (
          <p>No posts available.</p>
        )}
      </main>
    </section>
  );
};

export default UserPostsPage;
