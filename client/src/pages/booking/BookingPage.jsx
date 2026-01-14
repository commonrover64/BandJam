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
      title="Book Practice Room"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{room?.name}</h3>
        <p className="text-sm text-gray-500">
          ₹{room?.rate} / hour • {room?.address}
        </p>
      </div>

      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Select Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            className="w-full"
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
          />
        )}

        {isAvailable === true && (
          <Alert
            type="success"
            message="This room is available on the selected date."
            showIcon
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onclose}>Cancel</Button>
          <Button type="primary" htmlType="submit" disabled={!isAvailable}>
            Confirm Booking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BookingPage;
