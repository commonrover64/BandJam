import { Button, Form, Input, message } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../api/user";

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await RegisterUser(values);
      if (response.success) {
        message.success(response?.message);

        // navigate to login screen
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        message.warning(response?.message);
      }
    } catch (error) {
      message.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-400 to-gray-700">
      <main>
        <section>
          <h1>Register to BandJam</h1>
        </section>

        <section>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Name"
              htmlFor="name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input
                id="name"
                type="text"
                placeholder="Enter your Name"
              ></Input>
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              htmlFor="email"
              rules={[{ required: true, message: "Email is required!" }]}
            >
              <Input type="email" placeholder="Enter your Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              htmlFor="password"
              rules={[{ required: true, message: "Password is required!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" block htmlFor="submit" htmlType="submit">
                Register
              </Button>
            </Form.Item>
          </Form>
        </section>

        <section>
          <p>
            Already a User ? <Link to="/login">Login Here</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Register;
