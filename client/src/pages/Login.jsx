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

        // navigate to home screen
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
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-400 to-gray-700">
      <main>
        <section>
          <h1>Login to BandJam</h1>
        </section>

        <section>
          <Form layout="vertical" onFinish={onFinish}>
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
              <Button type="primary" block htmlType="submit">
                Login
              </Button>
            </Form.Item>
          </Form>
        </section>

        <section>
          <p>
            New User ? <Link to="/register">Register Here</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;
