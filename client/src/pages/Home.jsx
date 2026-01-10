import React, { useState, useEffect } from "react";
import { Input, message, Button } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { GetAllRooms } from "../api/rooms";
import BookingPage from "./booking/BookingPage";
import { useDispatch, useSelector } from "react-redux";
import { hideModal, showModal } from "../redux/modalSlice";

const Home = () => {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const { isModalOpen } = useSelector((store) => store.modal);
  const dispatch = useDispatch();

  const getAllRooms = async () => {
    try {
      const response = await GetAllRooms();
      setRooms(response.data);
    } catch (error) {
      message.error("Failed to load rooms");
    }
  };

  useEffect(() => {
    getAllRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      {/* Mesh Gradient Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            Find Your Stage.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Premium practice spaces for creators, musicians, and performers.
            Book your next session in seconds.
          </p>
        </header>

        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-16 max-w-3xl mx-auto">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchOutlined className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name or equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500 backdrop-blur-sm"
            />
          </div>

          <button
            onClick={getAllRooms}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl border border-slate-700 transition-all active:scale-95"
          >
            <ReloadOutlined />
            <span>Refresh</span>
          </button>
        </div>

        {isModalOpen && (
          <BookingPage
            open={isModalOpen}
            onclose={() => {
              dispatch(hideModal());
              setRoom(null);
            }}
            room={room}
            onSubmit={() => message.success("Room booked successfully!")}
          />
        )}

        {!isModalOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="group relative bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md flex flex-col"
              >
                {/* Price Tag */}
                <div className="absolute top-6 right-6 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20">
                  ₹{room.rate}
                  <span className="text-xs font-normal opacity-80">/day</span>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {room.name}
                  </h2>

                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 italic">
                    <EnvironmentOutlined />
                    <span>{room.address}</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Equipment Chips */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      <ToolOutlined />
                      <span>Gear Included</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.equipments?.length > 0 ? (
                        room.equipments.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg capitalize"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600">
                          Standard Setup
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modern CTA Button */}
                <button
                  onClick={() => {
                    setRoom(room);
                    dispatch(showModal());
                  }}
                  className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-indigo-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Book Session
                </button>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="text-slate-600 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-slate-400">
                  No rooms match your search
                </h3>
                <p className="text-slate-500">
                  Try adjusting your filters or refreshing the list.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
