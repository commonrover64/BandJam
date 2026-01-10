import { Button, Form, Input, message, Radio } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../api/user";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await RegisterUser(values);
      if (response.success) {
        message.success(response?.message);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        message.warning(response?.message);
      }
    } catch (error) {
      message.error(error.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[450px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Register to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
              Book Practice Room
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Create your account to start booking
          </p>
        </div>

        {/* Register Card */}
        <main className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 mb-6">
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">Name</span>
              }
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-500 mr-2" />}
                placeholder="Enter your Name"
                className="bg-slate-900/50 border-slate-700 text-white hover:border-indigo-500 focus:border-indigo-500 h-11 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  Email
                </span>
              }
              name="email"
              rules={[{ required: true, message: "Email is required!" }]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-500 mr-2" />}
                type="email"
                placeholder="Enter your Email"
                className="bg-slate-900/50 border-slate-700 text-white hover:border-indigo-500 focus:border-indigo-500 h-11 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  Password
                </span>
              }
              name="password"
              rules={[{ required: true, message: "Password is required!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-500 mr-2" />}
                placeholder="Create a password"
                className="bg-slate-900/50 border-slate-700 text-white hover:border-indigo-500 focus:border-indigo-500 h-11 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  Register as a Studio Owner?
                </span>
              }
              name="role"
              initialValue={"user"}
              className="bg-slate-900/30 p-4 rounded-2xl border border-slate-700/50"
            >
              <Radio.Group className="w-full flex gap-4">
                <Radio value="owner" className="text-slate-300 custom-radio">
                  Yes
                </Radio>
                <Radio value="user" className="text-slate-300 custom-radio">
                  No
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item className="mt-8">
              <Button
                type="primary"
                block
                htmlType="submit"
                className="h-12 bg-indigo-500 hover:bg-indigo-600 border-none rounded-xl text-base font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Already a User?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Login Here
            </Link>
          </p>
        </main>

        <p className="text-center text-white text-sm">
          Book Practice Room by{" "}
          <a
            href="https://github.com/commonrover64"
            className="text-blue-400 hover:text-cyan-300 transition-colors"
          >
            Sid
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
