// import { Card } from "antd";
// import React from "react";
// import { useSelector } from "react-redux";

// const ProfileDashBoard = () => {
//   const { user } = useSelector((store) => store.user);

//   return (
//     <div className="flex justify-center items-center p-4">
//       {/* Lightened Shadow & Soft Slate Palette */}
//       <Card className="w-full max-w-md shadow-xl rounded-2xl p-2 !bg-[#1e293b] !border-slate-700/50">
//         <div className="p-6">
//           <h1 className="text-xl font-semibold text-white mb-8">
//             Profile Details
//           </h1>

//           <div className="space-y-4">
//             {/* Soft Floating Blocks instead of harsh lines */}
//             <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
//               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
//                 Full Name
//               </p>
//               <p className="text-slate-200 text-sm font-medium">
//                 {user?.name || "Member"}
//               </p>
//             </div>

//             <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
//               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
//                 Email Address
//               </p>
//               <p className="text-slate-200 text-sm font-medium">
//                 {user?.email}
//               </p>
//             </div>

//             <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
//               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
//                 Account Role
//               </p>
//               <p className="text-indigo-400 text-sm font-bold uppercase tracking-tighter italic">
//                 {user?.role}
//               </p>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default ProfileDashBoard;


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
