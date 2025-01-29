import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div>
      <section
        id="about"
        className="min-h-screen text-gray-600 body-font mt-12 pt-12"
      >
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">
              &quot;Your Daily Source for Everything Now&quot;
            </h2>
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              &quot;Explore the World of Knowledge – Your Journey Starts
              Here&quot;
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              we bring you the freshest updates, trends, and ideas from around
              the world. Whether you&apos;re looking for the latest news,
              insightful tips, or just something to brighten your day,
              we&apos;ve got you covered. Stay in the moment, stay informed, and
              discover something new every day.
            </p>
          </div>
          <div className="flex flex-wrap">
            <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
              <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">
                Stay Informed & Engaged{" "}
              </h2>
              <p className="leading-relaxed text-base mb-4">
                Blogs keep you updated on trends, offering fresh insights across
                various fields. Today brings you relevant, timely content to
                stay in the know.
              </p>
            </div>
            <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
              <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">
                Learn & Grow{" "}
              </h2>
              <p className="leading-relaxed text-base mb-4">
                Blogs provide valuable information for skill development and
                learning. Today offers expert advice to help you grow
                professionally and personally.
              </p>
            </div>
            <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
              <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">
                Connect with Like-minded People
              </h2>
              <p className="leading-relaxed text-base mb-4">
                Blogs create communities where people share ideas and engage in
                meaningful discussions. Today connects you with a community of
                knowledge seekers.
              </p>
            </div>
            <div className="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
              <h2 className="text-lg sm:text-xl text-gray-900 font-medium title-font mb-2">
                Inspire & Motivate
              </h2>
              <p className="leading-relaxed text-base mb-4">
                Blogs offer motivational stories and tips for personal growth.
                Today fuels your ambition with uplifting and empowering content.
              </p>
            </div>
          </div>
          <Link to="/categories">
            <button className="flex mx-auto mt-8 text-white bg-indigo-600 border-0 py-3 px-10 rounded-xl text-lg font-semibold shadow-lg transform hover:bg-indigo-700 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Read Post
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
