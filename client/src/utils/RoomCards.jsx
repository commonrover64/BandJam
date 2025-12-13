import React, { useState, useEffect } from "react";
import { Input, Card, message, Button } from "antd";
import { GetAllRooms } from "../api/rooms";

const RoomCards = () => {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);

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
        <h1 className="text-4xl font-extrabold text-center text-white tracking-wide mb-10">
          Search Practice Rooms
        </h1>

        {/* Search Bar + Refresh */}
        <div className="flex gap-4 mb-10">
          <Input
            placeholder="Search for a practice room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-lg shadow-md"
          />

          <Button
            onClick={() => getAllRooms()}
            type="primary"
            className="px-6 py-5 rounded-lg text-white font-medium"
          >
            Refresh
          </Button>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <Card
              key={room._id}
              title={room.name}
              bordered={false}
              className="bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-200 rounded-xl p-4"
            >
              <p className="text-gray-700">
                <span className="font-semibold">Description:</span>{" "}
                {room.description}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Rate:</span> ₹{room.rate} / hr
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {room.location}
              </p>
            </Card>
          ))}

          {filteredRooms.length === 0 && (
            <p className="text-center text-gray-400 col-span-3 text-lg">
              No rooms found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCards;
