import React from "react";
import ProfileDashBoard from "../utils/ProfileDashBoard";
import StudioDashboard from "../utils/StudioDashboard";
import { Tabs } from "antd";

const Owner = () => {
  const tableItems = [
    {
      key: "profile",
      label: "Profile",
      children: <ProfileDashBoard />,
    },
    {
      key: "studio",
      label: "Manage Practice Rooms",
      children: <StudioDashboard />,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-center m-7">DashBoard</h1>
        <Tabs
          defaultActiveKey="profile"
          items={tableItems}
          tabPosition="left"
        />
      </div>
    </>
  );
};

export default Owner;
