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
    <div className="min-h-screen w-full bg-linear-to-br from-[#2B2F36] via-[#262A30] to-[#20242A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* ambient light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-25%] right-[-20%] w-[520px] h-[520px] bg-indigo-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-25%] left-[-20%] w-[520px] h-[520px] bg-sky-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">
            Login to{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-sky-400">
              Band Jam
            </span>
          </h1>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl bg-[#2E333B] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <main className="p-8">
            <Form
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="space-y-5"
            >
              <Form.Item
                label={
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Email
                  </span>
                }
                name="email"
                rules={[{ type: "email", required: true }]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-500" />}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl bg-[#262A30] border border-slate-600 text-slate-100 focus:border-indigo-400 hover:border-slate-500"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Password
                  </span>
                }
                name="password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-500" />}
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-[#262A30] border border-slate-600 text-slate-100 focus:border-indigo-400 hover:border-slate-500"
                />
              </Form.Item>

              <Form.Item className="pt-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="h-12 rounded-xl font-semibold text-base border-none bg-gradient-to-r from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <p className="text-center text-slate-400 mt-6 text-sm">
              New here?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Create an account
              </Link>
            </p>
          </main>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Built by{" "}
          <a
            href="https://github.com/commonrover64"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Sid
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
