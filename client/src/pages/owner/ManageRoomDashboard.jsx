import React, { useEffect } from "react";
import { Button, Card, message } from "antd";
import { useSelector } from "react-redux";
import { DeleteRoom, GetAllRoomsbyID, RegisterRoom, UpdateRoomByID } from "../../api/rooms";
import { useState } from "react";
import RoomForm from "./RoomForm";

const ManageRoomDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mockRooms, setMockRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  const deleteRoom = async (value) => {
    await DeleteRoom(value);
    fetchRoom();
  };

  const fetchRoom = async () => {
    const response = await GetAllRoomsbyID(user?._id);
    setMockRooms(response.data);
  };

  const addNewRoom = async (values) => {
    try {
      const payload = {
        ...values,
        owner: user._id,
      };
      const response = await RegisterRoom(payload);

      if (response.success) {
        console.log("created room");
        return message.success(response.message);
      } else {
        return message.error(response.message);
      }
    } catch (error) {
      message.error(error);
    } finally {
      closeModal();
      setIsEditMode(false)
      setSelectedRoom(null)
      fetchRoom();
    }
  };

  const updateRoom = async (values) => {
    try {
      const payload = {
        ...values,
        _id: selectedRoom._id
      }
      
      const response = await UpdateRoomByID(payload);
      if(response.success) {
        console.log("update section", payload, "success")
      }
      
    } catch (error) {
      message.error(error);
      console.log("update failed")
    }finally {
      closeModal();
      setIsEditMode(false)
      setSelectedRoom(null)
      fetchRoom();
    }
  }
  
  useEffect(() => {
    fetchRoom();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button type="primary" onClick={openModal}>
          Add New Room
        </Button>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <RoomForm
          open={isModalOpen}
          onclose={() => {
            closeModal();
            setIsEditMode(false);
            setSelectedRoom(null);
          }}
          onSubmit={isEditMode ? updateRoom : addNewRoom}
          initialValues={isEditMode ? selectedRoom : null}
          isEditMode={isEditMode}
        />
      )}

      {/* Rooms Grid */}
      {!isModalOpen && (
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
                <Button
                  type="primary"
                  onClick={() => {
                    setIsEditMode(true);
                    setSelectedRoom(room);
                    openModal();
                  }}
                >
                  Edit
                </Button>

                <Button danger onClick={(e) => deleteRoom(room._id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRoomDashboard;
