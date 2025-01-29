// Dashboard.jsx
import useFetch from "../hooks/useFetch";
import { useState, useEffect } from "react";
import { FaArrowDown } from "react-icons/fa";
import About from "./About";

const Dashboard = () => {
  const { data, loading, error } = useFetch("/api/data/");

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formattedTime = time
    .toLocaleString("en-US", options)
    .replace(" at ", " ");
  const scroll = () => {
    // This will scroll to the element with the 'about' id smoothly
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200" />
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        <p className="text-lg font-semibold">Loading users...</p>
      </div>
    </div>
    );
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-700 via-gray-900 to-black text-white">
        {/* Outer Container */}
        <div className="relative bg-gray-900 bg-opacity-95 p-12 rounded-3xl shadow-2xl transform transition hover:scale-105 hover:shadow-2xl">
          {/* Decorative Glowing Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-indigo-500 rounded-full animate-ping opacity-40"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500 rounded-full animate-pulse opacity-25"></div>

          {/* Header */}
          <p className="text-lg font-semibold text-gray-300 tracking-wide uppercase mb-6"></p>

          {/* Current Time */}
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Time */}
            <div className="text-6xl font-extrabold text-indigo-400 tracking-wide shadow-lg animate-fade-in-down">
              {formattedTime}
            </div>
          </div>

          {/* Divider */}
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-gray-600 to-blue-500 w-full my-8"></div>

          {/* Tagline */}
          <div className="italic text-gray-400 text-sm text-center">
            &quot;Each second, a new chance to shine.&quot;
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-gray-500 text-sm">
          Powered by{" "}
          <span className="text-indigo-400 font-bold">Your Website</span>.
        </div>
        <div className="flex justify-center items-center mt-12">
          <FaArrowDown
            className="text-white text-4xl animation-bounce"
            aria-label="Scroll down"
            onClick={scroll}
          />
        </div>
      </div>

      <About />
    </div>
  );
};

export default Dashboard;
