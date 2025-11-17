import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Extract and verify the reset code from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("oobCode");

    if (!code) {
      setVerificationError("Invalid password reset link.");
      setIsVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        await verifyPasswordResetCode(auth, code);
        setOobCode(code);
        setIsVerifying(false);
      } catch (err) {
        console.error("Error verifying reset code:", err);
        setVerificationError("This password reset link is invalid or has expired.");
        setIsVerifying(false);
      }
    };

    verify();
  }, [location.search]);

  const handleChangePassword = async () => {
    if (!oobCode) return;

    if (!password || !confirm) {
      setErrorMessage("Please enter and confirm your new password.");
      setStatus("error");
      return;
    }

    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch (err: any) {
      console.error("Error changing password:", err);
      setStatus("error");

      const code = err?.code as string | undefined;
      let message = "Something went wrong. Please try again.";

      if (code === "auth/expired-action-code") {
        message = "This password reset link has expired. Please request a new one.";
      } else if (code === "auth/invalid-action-code") {
        message = "This password reset link is invalid. Please request a new one.";
      } else if (code === "auth/weak-password") {
        message = "Please choose a stronger password.";
      }

      setErrorMessage(message);
    }
  };

  if (isVerifying) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-4">
        <p className="text-sm text-neutral-300">Verifying your reset link...</p>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-4">
        <button
          onClick={() => navigate("/login")}
          className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition"
        >
          <FaArrowLeft className="text-base" />
          Back to Login
        </button>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-2">
          Link Error
        </h1>

        <p className="text-sm text-rose-400 mt-2">
          {verificationError}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <button
        onClick={() => navigate("/login")}
        className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition"
      >
        <FaArrowLeft className="text-base" />
        Back to Login
      </button>

      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-2">
        Set New Password
      </h1>

      <p className="text-sm text-neutral-300 mb-2">
        Enter a new password for your account.
      </p>

      {/* New password */}
      <div>
        <h3 className="text-sm text-neutral-400 mb-1">New Password</h3>
        <input
          type="password"
          placeholder="Enter a new password"
          className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Confirm password */}
      <div>
        <h3 className="text-sm text-neutral-400 mb-1">Confirm Password</h3>
        <input
          type="password"
          placeholder="Re-enter your new password"
          className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {/* Change password button */}
      <button
        className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleChangePassword}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Updating..." : "Change Password"}
      </button>

      {/* Status messages */}
      {status === "success" && (
        <p className="text-sm text-green-400 mt-2">
          Your password has been updated. You can now{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-rose-300 underline underline-offset-2 hover:text-rose-200 transition"
          >
            log in
          </button>
          .
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-rose-400 mt-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
