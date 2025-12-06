import { Card } from "antd";
import React from "react";
import { useSelector } from "react-redux";


const ProfileDashBoard = () => {
  
  const {user} = useSelector((state) => state.user);

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl p-3">
        <h1 className="text-2xl font-bold text-center mb-6">Your Profile</h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Name: {user.name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email: {user.email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Role: {user.role}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileDashBoard;
