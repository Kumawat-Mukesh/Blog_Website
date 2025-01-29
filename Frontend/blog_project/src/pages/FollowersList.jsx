import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // to get the userId from the URL

const FollowersList = () => {
  const { id: userId } = useParams(); // Accessing userId from the URL
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token'); // Get token from localStorage

  useEffect(() => {
    if (!token) {
      setError("No valid token found. Please log in again.");
      setLoading(false);
      return;
    }

    // Fetch the list of followers for the user
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/followers/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired
            setError("Token is invalid or expired. Please log in again.");
          } else {
            throw new Error(`Failed to fetch followers: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setFollowers(data);
        }
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError("Failed to load followers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, token]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-wrap -m-4">
          {followers.length > 0 ? (
            followers.map((user) => (
              <div key={user.id} className="lg:w-1/4 md:w-1/2 p-4 w-full">
                <a className="block relative h-48 rounded overflow-hidden">
                  <img
                    alt="profile"
                    className="object-cover object-center w-full h-full block"
                    src={
                        user.profile_picture
                          ? `http://localhost:8000${user.profile_picture}`
                          : "https://via.placeholder.com/150"
                      }
                  />
                </a>
                <div className="mt-4">
                  <h3 className="text-gray-500 text-xs tracking-widest title-font mb-1">
                    Follower
                  </h3>
                  <h2 className="text-gray-900 title-font text-lg font-medium">
                    {user.username}
                  </h2>
                  <p className="mt-1">User ID: {user.id}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No followers found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FollowersList;
