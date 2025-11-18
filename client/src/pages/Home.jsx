import { message } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetCurrentUser } from "../api/user";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const getValidUser = async () => {
    try {
      const response = await GetCurrentUser();
      if (response.success) {
        setUserInfo(response.data);
      }
    } catch (error) {
      message.error(error);
    }
  };

  setTimeout(() => {
    if (localStorage.getItem("tokenForBPR")) {
      // token is present
      getValidUser();
    } else {
      navigate("/login");
    }
  }, 1000);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            Home
          </h1>

          <div className="text-gray-700">
            <p className="text-lg">
              <span className="font-medium text-gray-900">Hello:</span>{" "}
              {userInfo?.name}
            </p>
            <p className="text-lg">
              <span className="font-medium text-gray-900">Email:</span>{" "}
              {userInfo?.email}
            </p>
          </div>

          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem("tokenForBPR");
            }}
            className="block w-full text-center mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
