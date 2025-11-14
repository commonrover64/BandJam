import React from "react";
import { Button, Form, Input } from "antd";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-400 to-gray-700">
      <main>
        <section>
          <h1>Login to BandJam</h1>
        </section>

        <section>
          <Form layout="vertical">
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
