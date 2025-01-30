import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // to get the userId from the URL

const FollowingList = () => {
  const { id: userId } = useParams(); // Accessing userId from the URL
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token"); // Get token from localStorage
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("No valid token found. Please log in again.");
      setLoading(false);
      return;
    }

    // Fetch the list of users the current user is following
    const fetchFollowingUsers = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/${userId}/following/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError("Token is invalid or expired. Please log in again.");
          } else {
            throw new Error(
              `Failed to fetch following users: ${response.status}`
            );
          }
        } else {
          const data = await response.json();
          setFollowingUsers(data);
        }
      } catch (err) {
        console.error("Error fetching following users:", err);
        setError("Failed to load following users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [userId, token]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Following</h1>
        <div className="flex flex-wrap justify-start gap-4">
          {followingUsers.length > 0 ? (
            followingUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/user/${user.username}/posts`)}
                className="flex items-center space-x-3 cursor-pointer p-2 border rounded-lg hover:bg-gray-50"
              >
                <img
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                  src={
                    user.profile_picture
                      ? `http://localhost:8000${user.profile_picture}`
                      : "https://via.placeholder.com/150"
                  }
                />
                <div>
                  <h2 className="text-sm text-gray-900 font-medium">
                    {user.username}
                  </h2>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You are not following anyone yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FollowingList;
