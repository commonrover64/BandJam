import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#2B2F36] via-[#262A30] to-[#20242A] flex items-center justify-center p-6 relative overflow-hidden">
        {/* ambient light */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full" />
        </div>

        <div className="relative text-center max-w-md">
          <p className="text-8xl font-bold text-slate-600 tracking-tight">
            404
          </p>

          <h1 className="mt-4 text-2xl font-semibold text-slate-100 tracking-tight">
            Page not found
          </h1>

          <p className="mt-2 text-slate-400 text-sm">
            The page you’re looking for doesn’t exist or was moved.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="mt-8 h-11 px-8 rounded-xl font-medium border-none bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all active:scale-[0.97]"
          >
            Go back home
          </Button>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
