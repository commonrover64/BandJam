// import React from "react";
// import { Modal, Form, DatePicker, TimePicker, InputNumber, Button } from "antd";

// const BookingPage = ({ open, onclose, room, onSubmit }) => {
//   const handleFinish = (values) => {
//     const payload = {
//       roomId: room?._id,
//       ...values,
//     };

//     console.log("Booking payload:", payload);
//     onSubmit;
//     onclose();
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={onclose}
//       footer={null}
//       centered
//       title="Book Practice Room"
//     >
//       {/* Room Info */}
//       <div className="mb-4">
//         <h3 className="text-lg font-semibold">{room?.name}</h3>
//         <p className="text-sm text-gray-500">
//           ₹{room?.rate} / hour • {room?.address}
//         </p>
//       </div>

//       <Form layout="vertical" onFinish={handleFinish}>
//         <Form.Item
//           label="Select Date"
//           name="date"
//           rules={[{ required: true, message: "Please select a date" }]}
//         >
//           <DatePicker
//             className="w-full"
//             disabledDate={(current) => {
//               return current && current < new Date().setHours(0, 0, 0, 0);
//             }}
//           />
//         </Form.Item>

//         <div className="flex justify-end gap-3 mt-4">
//           <Button onClick={onclose}>Cancel</Button>
//           <Button type="primary" htmlType="submit">
//             Confirm Booking
//           </Button>
//         </div>
//       </Form>
//     </Modal>
//   );
// };

// export default BookingPage;



import React, { useState } from "react";
import { Modal, Form, DatePicker, Button, Alert } from "antd";

const BookingPage = ({ open, onclose, room }) => {
  const [isAvailable, setIsAvailable] = useState(null);

  // 🔴 Mock unavailable dates (YYYY-MM-DD)
  const unavailableDates = ["2026-01-10", "2026-01-15"];

  const checkAvailability = (date) => {
    const selected = date.format("YYYY-MM-DD");
    setIsAvailable(!unavailableDates.includes(selected));
  };

  const handleFinish = (values) => {
    console.log("Booking confirmed:", values);
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
            onChange={checkAvailability}
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
          <Button
            type="primary"
            htmlType="submit"
            disabled={!isAvailable}
          >
            Confirm Booking
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BookingPage;
