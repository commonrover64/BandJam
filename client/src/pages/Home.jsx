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
  const userId = useSelector((store) => store.user.user._id);
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
    <div className="min-h-screen w-full bg-[#20242A] text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-100">
            Find your stage
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Practice rooms built for musicians and creators.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-3xl mx-auto">
          <Input
            prefix={<SearchOutlined className="text-slate-500" />}
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl bg-[#262A30] border border-slate-600 text-slate-100"
          />

          <Button
            onClick={getAllRooms}
            className="h-12 rounded-xl bg-[#262A30] border border-slate-600 text-slate-300 hover:text-slate-100"
            icon={<ReloadOutlined />}
          >
            Refresh
          </Button>
        </div>

        {isModalOpen && (
          <BookingPage
            open={isModalOpen}
            onclose={() => {
              dispatch(hideModal());
              setRoom(null);
            }}
            userId={userId}
            room={room}
            onSubmit={() => message.success("Room booked successfully!")}
          />
        )}

        {!isModalOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="relative bg-[#2E333B] border border-slate-700 rounded-3xl p-6 flex flex-col transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
              >
                {/* Price */}
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30">
                  ₹{room.rate} / day
                </div>

                <h2 className="text-xl font-semibold text-slate-100 mb-1">
                  {room.name}
                </h2>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <EnvironmentOutlined />
                  {room.address}
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2">
                  {room.description}
                </p>

                {/* Equipment */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {room.equipments?.length ? (
                    room.equipments.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-700/40 text-slate-300"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Standard setup
                    </span>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    setRoom(room);
                    dispatch(showModal());
                  }}
                  className="mt-auto h-11 rounded-xl font-medium text-slate-100 bg-linear-to-r from-indigo-500/70 to-sky-500/70 hover:brightness-110 transition"
                >
                  Book session
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
