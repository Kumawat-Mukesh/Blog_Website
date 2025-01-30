import React, { useState } from "react";
import axios from "axios";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const handleRequestReset = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/password-reset-request/", { email });
      setResetToken(response.data.token);
      setUserId(response.data.user_id);
      setStep(2);
      setMessage(response.data.detail);
    } catch (error) {
      setMessage(error.response?.data?.detail || "An error occurred.");
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/password-reset/${userId}/${resetToken}/`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(response.data.detail);
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data?.detail || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Password Reset</h1>
        {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

        {step === 1 && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Enter your email address:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Email address"
            />
            <button
              onClick={handleRequestReset}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Request Reset
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              New Password:
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="New Password"
            />
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm New Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Confirm Password"
            />
            <button
              onClick={handlePasswordReset}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Reset Password
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <p>Your password has been reset successfully.</p>
            <p>You can now log in with your new password.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
