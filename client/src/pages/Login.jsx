import React from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../api/user";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await LoginUser(values);
      if (response.success) {
        message.success(response?.message);

        setTimeout(() => {
          localStorage.setItem("tokenForBPR", response?.token);
          navigate("/");
        }, 1500);
      } else {
        message.warning(response?.message);
      }
    } catch (error) {
      message.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-400 to-gray-700 px-4">
      {/* Tighter, cleaner card */}
      <main className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login to <span className="text-blue-600">BandJam</span>
        </h1>

        {/* Form */}
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="[&_.ant-form-item-explain-error]:text-red-500 [&_.ant-form-item-explain-error]:text-sm"
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium">Email</span>}
            name="email"
            rules={[{ required: true, message: "Email is required!" }]}
          >
            <Input placeholder="Enter your email" className="py-2" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Password</span>}
            name="password"
            rules={[{ required: true, message: "Password is required!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="py-2"
            />
          </Form.Item>

          <Form.Item className="mt-5">
            <Button
              type="primary"
              htmlType="submit"
              block
              className="!py-2 !text-base"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        {/* Register link */}
        <p className="text-center mt-4 text-gray-600">
          New User?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register Here
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Login;
