import React, { useState } from "react";
import { Input, Card } from "antd";

const rooms = [
  {
    id: 1,
    name: "Studio Alpha",
    description: "Fully equipped drum kit, No Amps / Guitars",
    rate: 100,
    location: "Usa",
  },
  {
    id: 2,
    name: "Kusai",
    description: "Fully equipped drum kit & Amps",
    rate: 250,
    location: "Kusai",
  },
  {
    id: 3,
    name: "Studio Bravo",
    description: "Perfect for solo practice",
    rate: 120,
    location: "China",
  },
  {
    id: 4,
    name: "Studio Reverb",
    description: "Acoustic-treated large room",
    rate: 300,
    location: "Nepal",
  },
  
];

const RoomCards = () => {
  const [search, setSearch] = useState("");

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

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
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
