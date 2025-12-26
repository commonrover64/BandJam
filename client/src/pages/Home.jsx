import React, { useState, useEffect } from "react";
import { Input, Card, message, Button } from "antd";
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
      message.error(error);
    }
  };

  useEffect(() => {
    getAllRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center text-white tracking-wide mb-12">
          Search Practice Rooms
        </h1>

        {/* Search Bar + Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Input
            placeholder="Search for a practice room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-lg shadow-md"
          />

          <Button
            onClick={getAllRooms}
            type="primary"
            className="px-8 py-5 rounded-lg text-white font-medium"
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
            room={room}
            onSubmit={console.log("Room booked")}
          />
        )}

        {!isModalOpen && (
          <>
            {/* Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredRooms.map((room) => (
                <Card
                  key={room._id}
                  title={
                    <h2 className="text-lg font-semibold text-gray-800">
                      {room.name}
                    </h2>
                  }
                  className="bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl p-5 flex flex-col"
                >
                  <div className="flex-1">
                    {/* Equipment */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Available Equipment:
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {room.equipments && room.equipments.length > 0 ? (
                          room.equipments.map((equipment, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full capitalize"
                            >
                              {equipment}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            No equipment provided
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold">Description:</span>{" "}
                      {room.description}
                    </p>

                    {/* Rate */}
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Rate:</span> ₹{room.rate}{" "}
                      / hr
                    </p>

                    {/* Address */}
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Address:</span>{" "}
                      {room.address}
                    </p>
                  </div>

                  {/* Action */}
                  <Button
                    type="primary"
                    block
                    className="rounded-lg font-medium mt-6"
                    onClick={() => {
                      setRoom(room);
                      dispatch(showModal());
                    }}
                  >
                    Book Room
                  </Button>
                </Card>
              ))}

              {filteredRooms.length === 0 && (
                <p className="text-center text-gray-400 col-span-3 text-lg">
                  No rooms found.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
