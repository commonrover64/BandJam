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
      getValidUser()
    } else {
      navigate("/login");
    }
  }, 1000);

  return (
    <>
      <div>Home</div>
      <div>Hello: {userInfo?.name}</div>
      <div>Email: {userInfo?.email}</div>
      <Link
        to="/login"
        onClick={() => {
          localStorage.removeItem("tokenForBPR");
        }}
      >
        Logout
      </Link>
    </>
  );
};

export default Home;
