import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hideModal, showModal } from "../redux/modalSlice";
import { Layout, Menu, message } from "antd";
import { GetCurrentUser } from "../api/user";
import { useDispatch } from "react-redux";
import {
  HomeOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import { setUser } from "../redux/userSlice";
import { hideLoading, showLoading } from "../redux/loaderSlice";

const ProtectedRoute = ({ children }) => {
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
        navigate("/login");
      }
    } catch (error) {
      message.error(error);
      navigate("/login");
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
      label: "Home",
      onClick: () => navigate("/"),
      icon: <HomeOutlined />,
    },
    {
      key: "Profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
      icon: <ProfileOutlined />,
    },
    {
      key: "Logout",
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("tokenForBPR");
        navigate("/login");
      },
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <>
      <Layout className="min-h-screen !bg-[#20242A]">
        <Header className="sticky top-0 z-20 h-16 px-6 flex items-center justify-between !bg-[#262A30] border-b border-slate-700/60">
          {/* Brand */}
          <div
            onClick={() => navigate("/")}
            className="text-slate-100 font-semibold tracking-tight cursor-pointer"
          >
            Band Jam
          </div>

          {/* Navigation */}
          <Menu
            mode="horizontal"
            items={navItems}
            className="
              !bg-transparent border-none min-w-[260px]

              [&_.ant-menu-item]:rounded-xl
              [&_.ant-menu-item]:px-4
              [&_.ant-menu-item]:!text-slate-300
              [&_.ant-menu-item]:!transition-colors

              [&_.ant-menu-item:hover]:!text-slate-100

              [&_.ant-menu-item-selected]:!bg-slate-600/60
              [&_.ant-menu-item-selected]:!text-slate-100

              [&_.ant-menu-item-icon]:!text-slate-400
              [&_.ant-menu-item-selected_.ant-menu-item-icon]:!text-slate-200
            "
          />
        </Header>

        <Content className="px-6 py-6">{children}</Content>
      </Layout>
    </>
  );
};

export default ProtectedRoute;
