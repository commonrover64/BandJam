import { Card } from "antd";
import React from "react";
import { useSelector } from "react-redux";

const ProfileDashBoard = () => {
  const { user } = useSelector((store) => store.user);

  return (
    <div className="flex justify-center items-start py-10">
      <Card
        className="
          w-full max-w-md
          !bg-[#2E333B]
          !border-slate-700/60
          !rounded-2xl
          !shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        "
      >
        <div className="p-6">
          <h1 className="text-lg font-semibold text-slate-100 mb-6">
            Profile Details
          </h1>

          <div className="space-y-4">
            {/* Name */}
            <div className="p-4 rounded-xl bg-[#262A30] border border-slate-700/50">
              <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                Full name
              </p>
              <p className="text-slate-100 text-sm font-medium">
                {user?.name || "Member"}
              </p>
            </div>

            {/* Email */}
            <div className="p-4 rounded-xl bg-[#262A30] border border-slate-700/50">
              <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                Email address
              </p>
              <p className="text-slate-100 text-sm font-medium">
                {user?.email}
              </p>
            </div>

            {/* Role */}
            <div className="p-4 rounded-xl bg-[#262A30] border border-slate-700/50">
              <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                Account role
              </p>
              <p className="text-slate-200 text-sm font-semibold uppercase">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileDashBoard;
