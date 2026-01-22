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
    <div className="min-h-screen !bg-[#20242A] px-6 py-6 text-slate-200">
      <Tabs
        defaultActiveKey="profile"
        items={tabs}
        tabPosition="left"
        className="
          [&_.ant-tabs-nav]:!bg-transparent
          [&_.ant-tabs-nav-wrap]:!px-2
          [&_.ant-tabs-nav::before]:!border-slate-700/60

          [&_.ant-tabs-tab]:!text-slate-400
          [&_.ant-tabs-tab]:!px-4
          [&_.ant-tabs-tab]:!rounded-lg
          [&_.ant-tabs-tab]:!transition

          [&_.ant-tabs-tab:hover]:!text-slate-200

          [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-100
          [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!font-medium

          [&_.ant-tabs-ink-bar]:!bg-slate-500
        "
      />
    </div>
  );
};

export default Profile;
