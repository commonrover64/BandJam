import React, { useState } from "react";
import { Input, Card, message, Button } from "antd";
import { GetAllRooms } from "../api/rooms";
import { useEffect } from "react";

const RoomCards = () => {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([])

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Search Practice Room
        </h1>

        {/* Search bar */}
        <Input
          placeholder="Search for a practice room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 p-2"
        />

        {/* Refresh Rooms */}
        <div>
          <Button onClick={()=>{getAllRooms()}}>Refresh rooms</Button>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room._id}
              title={room.name}
              className="shadow-md hover:shadow-xl transition rounded-lg"
            >
              <p>Description: {room.description}</p>
              <p>Rate: {room.rate} / hr</p>
              <p>Location: {room.location}</p>
            </Card> 
          ))}

          {filteredRooms.length === 0 && (
            <p className="text-center text-gray-500 col-span-2">
              No rooms found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCards;
