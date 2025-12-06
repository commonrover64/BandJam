import { Button, Card } from "antd";
import React from "react";

const StudioDashboard = () => {
  const mockRooms = [
    {
      _id: 1,
      name: "Studio A",
      price: 500,
      location: "Lalpur, Ranchi",
      status: "Available",
    },
    {
      _id: 2,
      name: "Studio B",
      price: 400,
      location: "Hinoo, Ranchi",
      status: "Unavailable",
    },
    {
      _id: 3,
      name: "Studio C",
      price: 650,
      location: "Kadamkuan",
      status: "Available",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button type="primary">Add New Room</Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRooms.map((room) => (
          <Card
            key={room._id}
            className="shadow-sm border hover:shadow-md transition"
            title={<span className="font-semibold">{room.name}</span>}
          >
            <p>
              <span className="font-semibold">Price/hr:</span> ₹{room.price}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {room.location}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={
                  room.status === "Available"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {room.status}
              </span>
            </p>

            <div className="flex justify-between mt-4">
              <Button type="default">Edit</Button>
              <Button danger>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudioDashboard;
