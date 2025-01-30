import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditPostPage = () => {
  const { slug } = useParams(); // Get slug from the URL
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
    is_published: false,
  });
  const [currentImageURL, setCurrentImageURL] = useState(null); // To handle the image preview

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/categories/");
        setCategories(response.data);
      } catch (error) {
        toast.error("Failed to load categories.");
      }
    };

    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/posts/${slug}/`
        );
        const postData = response.data;
        setFormData({
          title: postData.title || "",
          content: postData.content || "",
          category: postData.category || "", // Use category ID
          image: null, // Keep image null to handle uploads
          is_published: postData.is_published || false,
        });
        setCurrentImageURL(postData.image); // Store the current image URL
      } catch (error) {
        toast.error("Failed to load post details.");
        navigate("/not-found");
      }
    };

    fetchCategories();
    fetchPost();
  }, [slug, navigate]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({ ...prevState, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please do login");
      return;
    }

    const postData = new FormData();
    postData.append("title", formData.title);
    postData.append("content", formData.content);
    postData.append("category", formData.category);
    if (formData.image) {
      postData.append("image", formData.image); // Append new image if provided
    }
    postData.append("is_published", formData.is_published);

    try {
      await axios.put(`http://127.0.0.1:8000/api/posts/${slug}/`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Post updated successfully!");
      navigate(`/posts/${slug}`);
    } catch (error) {
      toast.error("Failed to update the post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col">
              <label className="leading-loose text-sm sm:text-base">Post Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="leading-loose text-sm sm:text-base">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="leading-loose text-sm sm:text-base">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="leading-loose text-sm sm:text-base">Image</label>
              {currentImageURL && !formData.image && (
                <div className="mb-4">
                  <img
                    src={currentImageURL}
                    alt="Current Post"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {formData.image && (
                <div className="mb-4">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="New Upload"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
              />
            </div>
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
              <label className="leading-loose text-sm sm:text-base">Publish</label>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center space-x-4 space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={() => navigate(`/posts/${slug}`)}
                className="flex justify-center items-center w-full sm:w-auto text-gray-900 px-4 py-3 rounded-md focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 flex justify-center items-center w-full sm:w-auto text-white px-4 py-3 rounded-md focus:outline-none"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;
