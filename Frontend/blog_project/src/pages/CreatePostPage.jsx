import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const CreatePostPage = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
    is_published: false,
  });
  const [imagePreview, setImagePreview] = useState(null); // State to store image preview

  // Axios config for authorization
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories/",
          axiosConfig
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories. Please try again.");
      }
    };

    fetchCategories();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle file input and set image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({ ...prevState, image: file }));
    
    // Set image preview
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = new FormData();

    // Ensure category is sent as a number
    const categoryId = parseInt(formData.category, 10);
    if (!isNaN(categoryId)) {
      postData.append("category", categoryId);
    } else {
      toast.error("Invalid category ID");
      return;
    }

    // Append other data to FormData for file upload
    for (const key in formData) {
      if (key !== "category") {
        // Skip category as we already appended it
        postData.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts/",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Post created successfully:", response.data);
      toast.success("Post created successfully!");
      navigate("/profile"); // Redirect to user profile page

    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      toast.error(
        `Failed to create post: ${
          error.response?.data?.detail || "Check the server logs for details."
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-2xl font-mono">
                i
              </div>
              <div className="block pl-2 font-semibold text-xl text-gray-700">
                <h2 className="leading-relaxed">New Post</h2>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">
                  Create a new post then press the create button
                </p>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 space-y-4">
                <div className="flex flex-col">
                  <label className="leading-loose">Post Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Event title"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Write your post content here"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData((prevState) => ({
                        ...prevState,
                        is_published: e.target.checked,
                      }))
                    }
                  />
                  <label className="leading-loose">Publish</label>
                </div>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <Link
                  to={"/profile"}
                  type="button"
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CreatePostPage;
