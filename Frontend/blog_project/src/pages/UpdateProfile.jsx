import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdateProfile = () => {
  const { user, token,updateUser } = useAuth();
  const [redirect, setRedirect] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    date_of_birth: user?.date_of_birth || "",
    bio: user?.bio || "",
    profile_picture: null,
    existing_profile_picture: user?.profile_picture || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      profile_picture: file || null,
    }));
  };

  const handleSubmit = async () => {
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "profile_picture") {
        if (formData.profile_picture) {
          form.append(key, formData.profile_picture);
        }
      } else {
        form.append(key, formData[key]);
      }

    });
    await updateUser(formData);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setRedirect(true);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error("An error occurred while updating the profile.");
    }
  };

  const confirmUpdate = () => {
    setShowModal(true); // Show confirmation modal
  };

  const closeModal = () => {
    setShowModal(false); // Close modal without submitting
  };

  if (redirect) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div>
      <form className="max-w-md mx-auto mt-10">
        <h2 className="text-center text-xl font-bold mb-4">Update Profile</h2>
        <div className="mb-4">
          <label className="block font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Profile Picture</label>
          {formData.profile_picture ? (
            <img
              src={URL.createObjectURL(formData.profile_picture)}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-full mb-4"
            />
          ) : formData.existing_profile_picture ? (
            <img
              src={`http://127.0.0.1:8000${formData.existing_profile_picture}`}
              alt="Existing Profile"
              className="w-24 h-24 object-cover rounded-full mb-4"
            />
          ) : (
            <p>No profile picture available.</p>
          )}
          <input
            type="file"
            name="profile_picture"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="button"
          onClick={confirmUpdate}
          className="block w-full bg-blue-600 text-white rounded px-4 py-2 hover:shadow-lg"
        >
          Update Profile
        </button>
      </form>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" />
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Update
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm leading-5 text-gray-500">
                      Are you sure you want to update your profile?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
                  Yes, Update
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
