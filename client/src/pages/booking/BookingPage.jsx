import React from "react";
import { Modal, Form, DatePicker, TimePicker, InputNumber, Button } from "antd";

const BookingPage = ({ open, onclose, room, onSubmit }) => {
  const handleFinish = (values) => {
    const payload = {
      roomId: room?._id,
      ...values,
    };

    console.log("Booking payload:", payload);
    onSubmit;
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
      {/* Room Info */}
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
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          label="Start Time"
          name="time"
          rules={[{ required: true, message: "Please select start time" }]}
        >
          <TimePicker className="w-full" format="HH:mm" />
        </Form.Item>

        <Form.Item
          label="Duration (hours)"
          name="duration"
          rules={[{ required: true, message: "Enter duration" }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onclose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Confirm Booking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BookingPage;
