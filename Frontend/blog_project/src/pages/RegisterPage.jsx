import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Ensure correct path
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    date_of_birth: "",
    profilePicture: null,
  });
  const { register } = useAuth();

  const handleNext = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handlePrev = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      profilePicture: file,
    }));
  };

  const handleSubmit = async () => {
    if (step === 3) {
      try {
        const data = new FormData();
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("bio", formData.bio);
        data.append("date_of_birth", formData.date_of_birth);
        if (formData.profilePicture) {
          data.append("profile_picture", formData.profilePicture);
        }

        await register(data);
        navigate("/login");
      } catch (error) {
        toast.error("Registration failed!", error.message);
        navigate("/register");
      }
    }
  };

  return (
    <div
      className="w-full flex items-center justify-center py-12 px-6 sm:px-12"
      style={{
        backgroundImage: 'url("/images/register-background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "92.5vh",
      }}
    >
      {" "}
      <div className="w-full max-w-md md:max-w-3xl p-6 md:p-10 rounded-lg shadow-lg bg-white bg-opacity-70">
  {/* Progress Indicator */}
  <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
    <div className="flex items-center">
      <div
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${
          step === 1
            ? "bg-[#106C4F] text-white"
            : "bg-gray-300 text-gray-500"
        } text-sm md:text-base`}
      >
        1
      </div>
      <span className="ml-2 text-gray-700 text-sm md:text-base">
        Account Details
      </span>
    </div>
    <div className="flex items-center">
      <div
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${
          step === 2
            ? "bg-[#106C4F] text-white"
            : "bg-gray-300 text-gray-500"
        } text-sm md:text-base`}
      >
        2
      </div>
      <span className="ml-2 text-gray-700 text-sm md:text-base">
        Personal Info
      </span>
    </div>
    <div className="flex items-center">
      <div
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${
          step === 3
            ? "bg-[#106C4F] text-white"
            : "bg-gray-300 text-gray-500"
        } text-sm md:text-base`}
      >
        3
      </div>
      <span className="ml-2 text-gray-700 text-sm md:text-base">
        Confirmation
      </span>
    </div>
  </div>
  {/* Step Content */}
  {step === 1 && (
    <div>
      <h2 className="text-lg md:text-2xl font-semibold mb-4">
        Account Details
      </h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
            placeholder="username123"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
            placeholder="john@example.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
            placeholder="••••••••"
          />
        </div>
      </form>
    </div>
  )}
  {step === 2 && (
    <div>
      <h2 className="text-lg md:text-2xl font-semibold mb-4">
        Personal Info
      </h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
            placeholder="Write a short bio..."
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Birthdate
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm md:text-base">
            Profile Picture
          </label>
          <input
            type="file"
            name="profilePicture"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#106C4F]"
          />
        </div>
      </form>
    </div>
  )}
  {step === 3 && (
    <div>
      <h2 className="text-lg md:text-2xl font-semibold mb-4">
        Confirmation
      </h2>
      <div className="mb-4">
        <p className="text-gray-700">Username: {formData.username}</p>
        <p className="text-gray-700">Email: {formData.email}</p>
        <p className="text-gray-700">Bio: {formData.bio}</p>
        <p className="text-gray-700">
          Birthdate: {formData.date_of_birth}
        </p>
        {formData.profilePicture && (
          <img
            src={formData.profilePicture}
            alt="Profile Preview"
            className="w-20 h-20 object-cover rounded-full"
          />
        )}
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-[#106C4F] text-white py-2 px-4 rounded focus:outline-none"
      >
        Submit
      </button>
    </div>
  )}
  <div className="flex justify-between mt-6">
    {step > 1 && (
      <button
        onClick={handlePrev}
        className="bg-gray-300 py-2 px-4 rounded text-sm md:text-base"
      >
        Previous
      </button>
    )}
    {step < 3 && (
      <button
        onClick={handleNext}
        className="bg-[#106C4F] text-white py-2 px-4 rounded text-sm md:text-base"
      >
        Next
      </button>
    )}
  </div>
</div>

    </div>
  );
};

export default RegisterPage;
