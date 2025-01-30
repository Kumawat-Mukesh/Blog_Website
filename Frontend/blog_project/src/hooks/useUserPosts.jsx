import { useState, useEffect } from "react";
import axios from "axios";

const useUserPosts = (userId, token) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserPosts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/posts/?mine=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserPosts(response.data.results || response.data); // If using pagination
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId, token]);

  return { userPosts, loading, error };
};

export default useUserPosts;
