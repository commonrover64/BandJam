import React from "react";
import { Button, Checkbox, Form, Input, InputNumber, Modal } from "antd";

const RoomForm = ({ open, onclose, onSubmit, initialValues, isEditMode }) => {
  const handleFinsh = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onclose}
      centered
      footer={null}
      className="rounded-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-center">
        {isEditMode ? "Update Room" : "Add Room"}
      </h2>

      <Form
        layout="vertical"
        onFinish={handleFinsh}
        initialValues={initialValues}
      >
        <Form.Item
          label="Room Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Room name is required!",
            },
          ]}
        >
          <Input placeholder="Enter Room Name" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              required: true,
              message: "Address is required!",
            },
          ]}
        >
          <Input placeholder="Enter Room Address" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Phone number is required!" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Phone number must be 10 digits",
            },
          ]}
        >
          <Input maxLength={10} placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          label="Available Equipments:"
          htmlFor="equipments"
          name="equipments"
          initialValue={null}
        >
          <Checkbox.Group
            options={[
              { label: "Drum Set", value: "Drums" },
              { label: "Amplifiers", value: "Amplifiers" },
              { label: "Microphones", value: "Microphones" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required!" }]}
        >
          <Input.TextArea
            placeholder="Add extra room details (e.g.. 2 mics, 4 amps)."
            rows={2}
          />
        </Form.Item>

        <Form.Item
          label="Rate (per day)"
          name="rate"
          rules={[{ required: true, message: "Rate is required!" }]}
        >
          <InputNumber min={0} className="!w-full" placeholder="Enter rate" />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onclose}>Cancel</Button>

          <Button type="primary" htmlType="submit">
            {isEditMode ? "Update Room" : "Add Room"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoomForm;
