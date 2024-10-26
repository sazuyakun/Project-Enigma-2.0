import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const OTPVerification = ({ userId, isLogin = false }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = isLogin ? "/verify-login-otp" : "/verify-email";
      const res = await axios.post(
        `http://localhost:3000/api/v1/user${endpoint}`,
        {
          userId,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        if (isLogin) {
          dispatch(setAuthUser(res.data.user));
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      const endpoint = isLogin ? "/resend-login-otp" : "/resend-signup-otp";
      const res = await axios.post(
        `http://localhost:3000/api/v1/user${endpoint}`,
        {
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("New OTP sent to your email");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form onSubmit={verifyOTP} className="shadow-lg flex flex-col gap-5 p-8">
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">Verify OTP</h1>
          <p className="text-sm text-center">
            Please enter the OTP sent to your email
          </p>
        </div>
        <div>
          <span className="font-medium">Enter OTP</span>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="focus-visible:ring-transparent my-2"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            required
          />
        </div>
        {loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying
          </Button>
        ) : (
          <Button type="submit">Verify OTP</Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={resendOTP}
          disabled={loading}
        >
          Resend OTP
        </Button>
      </form>
    </div>
  );
};

export default OTPVerification;
