import React from "react";

function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-blue-500 text-white">
      <h1 className="text-5xl font-bold mb-4">Welcome to Rojgar</h1>
      <p className="text-lg mb-6">
        A platform connecting freelancers with clients. Explore jobs and find opportunities!
      </p>
      <div className="flex gap-4">
        <a href="/login" className="bg-white text-blue-500 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-200">
          Login
        </a>
        <a href="/signup" className="bg-white text-blue-500 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-200">
          Signup
        </a>
      </div>
    </div>
  );
}

export default Home;
