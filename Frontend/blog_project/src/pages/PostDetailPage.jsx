import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const PostDetailPage = () => {
  const { slug } = useParams(); // Get the slug from the URL
  const navigate = useNavigate(); // Navigation handler
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  // Toggle modal visibility
  const toggleModal = (image) => {
    setModalImage(image);
    setIsModalOpen((prevState) => !prevState);
  };

  const fetchPostDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${slug}/`);
      if (!response.ok) throw new Error("Failed to fetch post details.");
      const data = await response.json();
      setPost(data);
      setIsLiked(data.is_liked);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [slug]);

  const fetchRecentPosts = useCallback(async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/posts/recent/?limit=5"
      );
      if (!response.ok) throw new Error("Failed to fetch recent posts.");
      const data = await response.json();
      setRecentPosts(data);
    } catch (err) {
      console.error("Error fetching recent posts:", err);
    }
  }, []);

  const handleLike = async () => {
    try {
      const newLikeStatus = !isLiked;
      const response = await fetch(
        `http://127.0.0.1:8000/api/posts/${slug}/like/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error liking the post.");
      const data = await response.json();
      setIsLiked(newLikeStatus);
    } catch (err) {
      console.error("Error liking the post:", err);
      setIsLiked(isLiked);
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/posts/${slug}/comments_list/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch comments.");
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [slug]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Comment content is required.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/posts/${slug}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content: newComment,
            post: slug, // Ensure the post slug is correctly sent
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to post comment.");
      const data = await response.json();
      setComments([data, ...comments]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment.");
    }
  };
  useEffect(() => {
    fetchPostDetails();
    fetchRecentPosts();
    fetchComments();
    const incrementViews = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/posts/${slug}/increment_views/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to increment views");
        }

        const data = await response.json();
        setPost((prevPost) => ({ ...prevPost, views_count: data.views_count }));
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    };

    incrementViews();
  }, [slug, fetchPostDetails, fetchRecentPosts, fetchComments]);

  const formatContent = (content) => {
    return content.split("\n").map((item, index) => (
      <React.Fragment key={index}>
        {item}
        <br />
        <br />
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200" />
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
          <p className="text-lg font-semibold">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {post.title}
          </h1>
          <p className="text-gray-600">
            Published on {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row">
          <div className="w-full md:w-3/4 px-4">
            {post.image && (
              <div>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full max-w-2xl mx-auto h-[400px] object-cover rounded-lg shadow mb-8 cursor-pointer"
                  onClick={() => toggleModal(post.image)}
                />
              </div>
            )}
            <div className="prose max-w-none">
              {formatContent(post.content)}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleLike}
                className={`${
                  isLiked ? "bg-blue-600" : "bg-blue-500"
                } hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded`}
              >
                {isLiked ? "Liked" : "Like"}
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold">Comments</h3>
              <textarea
                className="w-full mt-4 p-2 border rounded-lg"
                rows="4"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                onClick={handleCommentSubmit}
              >
                Submit Comment
              </button>
              <div className="mt-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-6 rounded-lg shadow-lg mb-6 flex items-start space-x-4"
                    >
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <img
                          src={`http://127.0.0.1:8000${comment.author.profile_picture}`}
                          alt={`${comment.author.username} profile`}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer transition-transform transform hover:scale-105"
                        />
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1">
                        {/* Author Name and Content */}
                        <div className="mb-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {comment.author.username}
                          </p>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>

                        {/* Timestamp (Optional: you can display the time when the comment was posted) */}
                        <p className="text-sm text-gray-500">
                          Posted on{" "}
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-lg text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4 px-4">
            <div className="max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-blue-400 mb-7">
              <div className="relative">
                <img
                  src={post.author.profile_picture || "/default-profile.png"}
                  alt={`${post.author.username}'s Profile`}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => toggleModal(post.author.profile_picture)}
                />
              </div>
              <div className="p-4">
                <div className="px-6 py-4">
                  <p className="text-xl font-bold text-gray-800">
                    {post.author.username}
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/user/${post.author.username}/posts`)
                    }
                    className="mt-3 bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition-all duration-300"
                  >
                    View Posts
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Posts and Categories */}
            <div className="bg-white p-6 mb-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Recent Posts
              </h2>
              <ul>
                {recentPosts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center mb-4 border-b border-gray-200 pb-4"
                  >
                    {/* Image */}
                    <img
                      src={`http://127.0.0.1:8000${post.image}`} // Fallback image if post.image is missing
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />

                    {/* Post Title */}
                    <Link
                      to={`/posts/${post.slug}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`/categories`}
                className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View more
              </Link>
            </div>
          </div>
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
              alt="Modal Image"
              className="max-w-screen-sm max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
