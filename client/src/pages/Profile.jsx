import React from "react";
import ManageRoomDashboard from "./owner/ManageRoomDashboard";
import ProfileDashBoard from "./ProfileDashBoard";
import { Tabs } from "antd";
import { useSelector } from "react-redux";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const tabs = [
    {
      key: "profile",
      label: "Profile",
      children: <ProfileDashBoard />,
    },
  ];

  if (user?.role === "owner") {
    tabs.push({
      key: "studio",
      label: "Manage Practice Rooms",
      children: <ManageRoomDashboard />,
    });
  }

  return (
    <div>
      <h1 className="text-center m-7">DashBoard</h1>
      <Tabs defaultActiveKey="profile" items={tabs} tabPosition="left" />
    </div>
  );
};

export default Profile;
