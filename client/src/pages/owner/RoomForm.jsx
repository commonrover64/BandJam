import { Button, Checkbox, Form, Input, InputNumber, Modal, Radio } from "antd";
import React from "react";

const RoomForm = ({ open, onclose, onSubmit }) => {
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
      <h2 className="text-xl font-semibold mb-4 text-center">Add Room</h2>

      <Form layout="vertical" onFinish={handleFinsh}>
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
            { required: true, message: "Phone number is required" }, 
            { pattern: /^[0-9]{10}$/, message: "Phone number must be 10 digits"}
          ]}
        >
          <Input
            maxLength={10}
            placeholder="Enter phone number"
          />
        </Form.Item>

        <Form.Item
          label="Room provides:"
          htmlFor="role"
          name="role"
          initialValue={"drum"}
        >
          <Checkbox.Group
            options={[
              { label: "Drum Set", value: "drum" },
              { label: "Amps", value: "amps" },
              { label: "Mic", value: "mic" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea
            placeholder="Add extra room details (e.g., 1 drum set, 2 mics, 4 amps)."
            rows={2}
          />
        </Form.Item>

        <Form.Item
          label="Rate (per hour)"
          name="rate"
          rules={[{ required: true, message: "Rate is required" }]}
        >
          <InputNumber min={0} className="!w-full" placeholder="Enter rate" />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onclose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Add Room
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoomForm;
