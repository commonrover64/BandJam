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
          +{" "}
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            Manage your room listings and rates
          </h1>
        </div>
        <button
          onClick={() => dispatch(showModal())}
          className="bg-gradient-to-r from-indigo-500/80 to-sky-500/80 text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:brightness-110"
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
              className="bg-[#2E333B] border border-slate-700/60 rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-slate-100 transition-colors">
                  {room.name}
                </h3>
                <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
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
                  className="flex-1 bg-[#262A30] hover:border-slate-500 border border-slate-700 text-slate-300 text-xs font-medium py-2 rounded-xl transition"
                >
                  <EditOutlined /> Edit
                </button>
                <button
                  onClick={() => deleteRoom(room._id)}
                  className="px-3 bg-[#262A30] border border-slate-700 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 text-xs font-medium py-2 rounded-xl transition"
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
