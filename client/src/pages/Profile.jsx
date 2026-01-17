// import React from "react";
// import ManageRoomDashboard from "./owner/ManageRoomDashboard";
// import ProfileDashBoard from "./ProfileDashBoard";
// import { Tabs } from "antd";
// import { useSelector } from "react-redux";

// const Profile = () => {
//   const { user } = useSelector((state) => state.user);
//   const tabs = [
//     {
//       key: "profile",
//       label: "Profile",
//       children: <ProfileDashBoard />,
//     },
//   ];

//   if (user?.role === "owner") {
//     tabs.push({
//       key: "studio",
//       label: "Manage Practice Rooms",
//       children: <ManageRoomDashboard />,
//     });
//   }

//   return (
//     <div>
//       <h1 className="text-center m-7">DashBoard</h1>
//       <Tabs defaultActiveKey="profile" items={tabs} tabPosition="left" />
//     </div>
//   );
// };

// export default Profile;


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
    <div className="min-h-screen bg-[#0f172a] p-4 text-slate-200">
      
      {/* Dark Mode Themed Tabs */}
      <Tabs 
        defaultActiveKey="profile" 
        items={tabs} 
        tabPosition="left" 
        className="dark-tabs"
      />

      <style jsx global>{`
        /* Changes tab text color to Slate */
        .dark-tabs .ant-tabs-tab {
          color: #94a3b8 !important; 
        }
        /* Changes active tab color to Indigo */
        .dark-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #818cf8 !important;
          font-weight: 600;
        }
        /* Changes the indicator bar to Indigo */
        .dark-tabs .ant-tabs-ink-bar {
          background: #6366f1 !important;
        }
        /* Adjusts the vertical divider line */
        .dark-tabs .ant-tabs-nav::before {
          border-color: #1e293b !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;