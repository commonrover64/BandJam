import React from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../api/user";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

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
      message.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Login to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
              Book Practice Room
            </span>
          </h1>
        </div>

        {/* Login Card */}
        <main className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 mb-6">
          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  Email
                </span>
              }
              name="email"
              rules={[
                {
                  type: "email",
                  required: true,
                  message: "Enter a valid Email Address"
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-500 mr-2" />}
                placeholder="Enter your email"
                className="bg-slate-900/50 border-slate-700 text-white hover:border-indigo-500 focus:border-indigo-500 h-12 rounded-xl"
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
                placeholder="Enter your password"
                className="bg-slate-900/50 border-slate-700 text-white hover:border-indigo-500 focus:border-indigo-500 h-12 rounded-xl"
              />
            </Form.Item>

            <Form.Item className="pt-2">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="h-12 bg-indigo-500 hover:bg-indigo-600 border-none rounded-xl text-base font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            New User?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Register Here
            </Link>
          </p>
        </main>

        {/* Footer info */}
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

export default Login;
