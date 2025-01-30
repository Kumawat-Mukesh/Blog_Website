import { useState } from "react";
import useFetch from "../hooks/useFetch"; // Adjust path as necessary
import { Link } from "react-router-dom";

const Categories = () => {
  const [query, setQuery] = useState(""); // Search query for post titles
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1); // Track current page

  // Fetch categories data
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch("http://127.0.0.1:8000/api/categories");

  // Fetch posts based on selected category and pagination
  const {
    data: posts,
    loading: postsLoading,
    error: postsError,
  } = useFetch(
    selectedCategory
      ? `http://127.0.0.1:8000/api/posts/?category=${selectedCategory.slug}&page=${page}&page_size=10&q=${query}`
      : `http://127.0.0.1:8000/api/posts/?page=${page}&page_size=10&q=${query}`
  );

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedCategorySlug = e.target.value;
    const category = categories?.find(
      (cat) => cat.slug === selectedCategorySlug
    );
    setSelectedCategory(category);
    setPage(1); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and Filter Section */}
      <div className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="bg-white h-10 px-5 rounded-lg border border-gray-300 dark:border-gray-700 w-full sm:w-auto"
            onChange={handleCategoryChange}
            value={selectedCategory ? selectedCategory.slug : ""}
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search posts..."
            className="h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-700 w-full sm:flex-grow"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Error Handling */}
      {categoriesError && (
        <p className="text-red-500">Failed to load categories.</p>
      )}
      {categoriesLoading && (
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200" />
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
            <p className="text-lg font-semibold">Loading users...</p>
          </div>
        </div>
      )}

      {/* Posts Section */}
      {postsError && <p className="text-red-500">Failed to load posts.</p>}
      {postsLoading && <p className="text-gray-500">Loading posts...</p>}

      {!postsLoading && posts?.results?.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {posts.results.map((post) => (
            <div
              key={post.id}
              className="flex flex-col p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Post Thumbnail */}
              <Link
                to={`/posts/${post.slug}`}
                className="overflow-hidden rounded-lg"
              >
                <img
                  src={post.image || "https://via.placeholder.com/300x200"}
                  alt={post.title}
                  className="object-cover w-full h-48 hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Post Details */}
              <div className="flex flex-col mt-4">
                <Link
                  to={`/posts/${post.slug}`}
                  className="text-lg font-semibold text-gray-800 hover:text-fuchsia-600"
                >
                  {post.title}
                </Link>
                <p className="mt-2 text-sm text-gray-600">
                  {post.content && post.content.length > 100
                    ? `${post.content.slice(0, 100)}...`
                    : post.content || "No description available"}
                </p>

                {/* Post Analytics */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <span>Views: {post.analytics?.views || 0}</span>
                  <span>Likes: {post.analytics?.likes || 0}</span>
                  <span>Comments: {post.analytics?.comments || 0}</span>
                </div>

                {/* Read More Button */}
                <Link
                  to={`/posts/${post.slug}`}
                  className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-fuchsia-600 text-center rounded-lg hover:bg-fuchsia-700"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!postsLoading && posts?.results?.length > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!posts?.next}
            className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Categories;
