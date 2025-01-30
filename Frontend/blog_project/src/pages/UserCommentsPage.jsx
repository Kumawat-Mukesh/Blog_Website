import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [updatedContent, setUpdatedContent] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/?filter=mine&page=${currentPage}&page_size=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComments(response.data.results);
        const totalPages = Math.ceil(response.data.count / 10);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Failed to fetch user comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserComments();
  }, [token, currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(comments.filter((comment) => comment.id !== commentId));
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    }
  };

  const openEditModal = (comment) => {
    setEditingComment(comment);
    setUpdatedContent(comment.content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComment(null);
    setUpdatedContent("");
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/comments/${editingComment.id}/`,
        { content: updatedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(
        comments.map((comment) =>
          comment.id === editingComment.id
            ? { ...comment, ...response.data }
            : comment
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleRedirectToPost = (slug) => {
    if (slug) {
      navigate(`/posts/${slug}`);
    } else {
      alert("The post no longer exists.");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-6 text-center">
        My Comments
      </h1>

      {loading ? (
        <div className="text-center text-xl text-gray-500">
          Loading comments...
        </div>
      ) : comments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comments.map((comment, index) => (
                <tr key={comment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRedirectToPost(comment.post)}
                      className="text-blue-500 hover:underline"
                    >
                      {comment.post ? comment.post : "Post no longer exists"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words">
                    {comment.content}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        comment.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(comment)}
                      className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="ml-2 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Previous
            </button>

            <span className="text-lg text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-500">
          No comments posted yet.
        </p>
      )}

      {/* Modal for editing a comment */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-semibold mb-4">Edit Comment</h2>
            <textarea
              className="w-full h-32 p-2 border rounded-lg"
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCommentsPage;
