import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { Layout, Menu, message } from "antd";
import { GetCurrentUser } from "../api/user";
import { useDispatch, useSelector } from "react-redux";
import {
  HomeOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { setUser } from "../redux/userSlice";

const ProtectedRoute = ({ children }) => {
  //get curr usee for showing dynamic profile
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getValidUser = async () => {
    try {
      dispatch(showLoading());
      const response = await GetCurrentUser();
      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        message.warning(response?.message);
      }
    } catch (error) {
      message.error(error);
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    if (localStorage.getItem("tokenForBPR")) {
      // token is present
      getValidUser();
    } else {
      navigate("/login");
    }
  }, []);

  const navItems = [
    {
      key: "Home",
      label: <span onClick={() => navigate("/")}>Home</span>,
      icon: <HomeOutlined />,
    },
    {
      key: "Profile",
      label: (
        <span
          onClick={() => {
            if (user?.role === "owner") {
              navigate("/owner");
            } else {
              navigate("/user");
            }
          }}
        >
          Profile
        </span>
      ),
      icon: <ProfileOutlined />,
    },
    {
      key: "Logout",
      label: (
        <span
          onClick={() => {
            localStorage.removeItem("tokenForBPR");
            navigate("/login");
          }}
        >
          Logout
        </span>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <>
      <Layout>
        <Header className="flex items-center sticky z-10 top-0">
          <h2 className="text-white" onClick={() => navigate("/")}>
            Book Practice Room
          </h2>
          <Menu theme="dark" mode="horizontal" items={navItems} />
        </Header>
        <Content>{children}</Content>
        <Footer className="fixed bottom-0 w-full text-center !bg-[#001529] !text-white">
          Book Practice Room Created by{" "}
          <a href="https://github.com/commonrover64">Siddhartha</a>
        </Footer>
      </Layout>
    </>
  );
};

export default ProtectedRoute;
