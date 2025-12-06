import React, { Children } from "react";
import ProfileDashBoard from "../utils/ProfileDashBoard";
import { Tabs } from "antd";

const User = () => {
  const tableItems = [
    {
      key: "profile",
      label: "Profile",
      children: <ProfileDashBoard />,
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

export default User;
