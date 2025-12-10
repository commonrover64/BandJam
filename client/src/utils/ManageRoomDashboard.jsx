import React, { useEffect } from "react";
import { Button, Card } from "antd";
import { useSelector } from "react-redux";
import { DeleteRoom, GetAllRoomsbyID } from "../api/rooms";
import { useState } from "react";

const ManageRoomDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const [mockRooms, setMockRooms] = useState([]);

  const deleteRoom = async(value) =>{
    await DeleteRoom(value)
    await fetchRoom();
  }

  const fetchRoom = async () => {
    const response = await GetAllRoomsbyID(user?._id);
    setMockRooms(response.data);
  };
  useEffect(() => {
    fetchRoom();
  }, []);

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
              <span className="font-semibold">Rate:</span> ₹{room.rate} / h
            </p>
            <p>
              <span className="font-semibold">Address:</span> {room.address}
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
              <Button danger onClick={(e) => deleteRoom(room._id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageRoomDashboard;
