import React, { useState } from "react";
import { Modal, Form, DatePicker, Button, Alert, message } from "antd";
import { addNewBooking, getAllBookingsById } from "../../api/booking";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const BookingPage = ({ open, onclose, room, userId }) => {
  const [isAvailable, setIsAvailable] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    if (open && room?._id) getAllBookingForThisRoom();
  }, [open, room?._id]);

  const getAllBookingForThisRoom = async () => {
    try {
      const res = await getAllBookingsById(room?._id);
      const dates = res.data.map((booking) => booking.date.split("T")[0]);

      setBookedDates(dates);
    } catch (error) {
      console.error(error);
    }
  };

  const checkDateAvailabiltiy = (date) => {
    const selected = date.format("YYYY-MM-DD");
    setIsAvailable(!bookedDates.includes(selected));
  };

  const createNewBooking = async (payload) => {
    try {
      const response = await addNewBooking(payload);
      if (response.success) {
        return message.success(response.message);
      } else {
        return message.error(response.message);
      }
    } catch (error) {
      message.error(error);
    } finally {
      setBookedDates(null);
    }
  };

  const handleFinish = (values) => {
    const payload = {
      date: values.date.format("YYYY-MM-DD"),
      user: userId,
      room: room._id,
      amount: room.rate,
    };

    createNewBooking(payload);
    onclose();
  };

  return (
    <Modal
      open={open}
      onCancel={onclose}
      footer={null}
      centered
      title={null}
      className="
        [&_.ant-modal-content]:!bg-[#2E333B]
        [&_.ant-modal-content]:!rounded-2xl
        [&_.ant-modal-content]:!shadow-[0_30px_90px_rgba(0,0,0,0.6)]
      "
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100">{room?.name}</h3>
        <p className="text-sm text-slate-400">
          ₹{room?.rate} / hour • {room?.address}
        </p>
      </div>

      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={<span className="text-slate-300">Select Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            className="
              w-full
              !bg-[#262A30]
              !border-slate-600
              !text-slate-100

              [&_.ant-picker-input>input]:!text-slate-100
              [&_.ant-picker-input>input::placeholder]:!text-slate-500
              [&_.ant-picker-suffix]:!text-slate-400

              hover:!border-slate-500
              focus:!border-indigo-400
            "
            disabledDate={(current) =>
              current && current < new Date().setHours(0, 0, 0, 0)
            }
            onChange={checkDateAvailabiltiy}
          />
        </Form.Item>

        {/* Availability Status */}
        {isAvailable === false && (
          <Alert
            type="error"
            message="This room is not available on the selected date."
            showIcon
            className="!bg-red-500/10 !border-red-500/30 !text-red-300"
          />
        )}

        {isAvailable === true && (
          <Alert
            type="success"
            message="This room is available on the selected date."
            showIcon
            className="!bg-emerald-500/10 !border-emerald-500/30 !text-emerald-300"
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button
            onClick={onclose}
            className="!bg-[#262A30] !border-slate-600 !text-slate-300"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            disabled={!isAvailable}
            className="!bg-gradient-to-r from-indigo-500/80 to-sky-500/80 !border-none"
          >
            Confirm Booking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BookingPage;
