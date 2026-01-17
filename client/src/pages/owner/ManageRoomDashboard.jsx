import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteRoom,
  GetAllRoomsbyID,
  RegisterRoom,
  UpdateRoomByID,
} from "../../api/rooms";
import RoomForm from "./RoomForm";
import { hideModal, showModal } from "../../redux/modalSlice";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const ManageRoomDashboard = () => {
  const { user } = useSelector((store) => store.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setrooms] = useState([]);
  const { isModalOpen } = useSelector((store) => store.modal);
  const dispatch = useDispatch();

  const deleteRoom = async (value) => {
    await DeleteRoom(value);
    fetchRoom();
  };

  const fetchRoom = async () => {
    const response = await GetAllRoomsbyID(user?._id);
    setrooms(response.data);
  };

  const addNewRoom = async (values) => {
    try {
      const payload = { ...values, owner: user._id };
      const response = await RegisterRoom(payload);
      if (response.success) message.success(response.message);
      else message.error(response.message);
    } catch (error) {
      message.error(error);
    } finally {
      dispatch(hideModal());
      setIsEditMode(false);
      setSelectedRoom(null);
      fetchRoom();
    }
  };

  const updateRoom = async (values) => {
    try {
      const payload = { ...values, _id: selectedRoom._id };
      console.log("payload ", payload);
      const response = await UpdateRoomByID(payload);
      if (response.success) message.success(response.message);
    } catch (error) {
      message.error(error);
    } finally {
      dispatch(hideModal());
      setIsEditMode(false);
      setSelectedRoom(null);
      fetchRoom();
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Manage your room listings and rates
          </h1>
        </div>
        <button
          onClick={() => dispatch(showModal())}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <PlusOutlined /> Add Room
        </button>
      </div>

      {isModalOpen && (
        <RoomForm
          open={isModalOpen}
          onclose={() => {
            dispatch(hideModal());
            setIsEditMode(false);
            setSelectedRoom(null);
          }}
          onSubmit={isEditMode ? updateRoom : addNewRoom}
          initialValues={isEditMode ? selectedRoom : null}
          isEditMode={isEditMode}
        />
      )}

      {!isModalOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 shadow-md group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                  {room.name}
                </h3>
                <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <span className="text-indigo-400 text-xs font-bold flex items-center gap-1">
                    <DollarOutlined /> {room.rate}{" "}
                    <span className="text-slate-500 font-normal">/day</span>
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-slate-500 mt-1" />
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      Location
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {room.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-700/50 flex gap-4">
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setSelectedRoom(room);
                    dispatch(showModal());
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <EditOutlined /> Edit
                </button>
                <button
                  onClick={() => deleteRoom(room._id)}
                  className="px-3 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 text-xs font-semibold py-2 rounded transition-colors"
                >
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRoomDashboard;
