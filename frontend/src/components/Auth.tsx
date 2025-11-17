import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const oobCodeParam = params.get("oobCode");

  // Shared state
  const [loading, setLoading] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Reset password state
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Email verification state
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Handle Firebase action modes
  useEffect(() => {
    const handle = async () => {
      if (!oobCodeParam) {
        setLinkError("Invalid action link.");
        setLoading(false);
        return;
      }

      try {
        // Password reset flow
        if (mode === "resetPassword") {
          await verifyPasswordResetCode(auth, oobCodeParam);
          setOobCode(oobCodeParam);
          setLoading(false);
          return;
        }

        // Email verification flow
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCodeParam);
          setVerifySuccess(true);
          setLoading(false);
          return;
        }

        // Unsupported mode
        setLinkError("Invalid or unsupported action.");
        setLoading(false);
      } catch (err) {
        console.error("Error verifying action code:", err);
        setLinkError("This link is invalid or has expired.");
        setLoading(false);
      }
    };

    handle();
  }, [mode, oobCodeParam]);

  // Change password submit
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

      const code = err?.code as string;
      let message = "Something went wrong. Please try again.";

      if (code === "auth/expired-action-code") message = "This link has expired.";
      if (code === "auth/invalid-action-code") message = "This link is invalid.";
      if (code === "auth/weak-password") message = "Please choose a stronger password.";

      setErrorMessage(message);
    }
  };

  // --------------------
  // RENDER STARTS HERE
  // --------------------

  if (loading) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-4">
        <p className="text-sm text-neutral-300">Verifying link...</p>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-4">
        <button
          onClick={() => navigate("/login")}
          className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition"
        >
          <FaArrowLeft className="text-base" />
          Back to Login
        </button>

        <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-2">
          Link Error
        </h1>

        <p className="text-sm text-rose-400 mt-2">{linkError}</p>
      </div>
    );
  }

  // ✔ EMAIL VERIFICATION SUCCESS PAGE
  if (mode === "verifyEmail" && verifySuccess) {
    return (
      <div className="w-full max-w-lg flex flex-col gap-4">
        <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-2">
          Email Verified
        </h1>

        <p className="text-sm text-green-400">
          Your email has been successfully verified. You can now{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-rose-300 underline underline-offset-2 hover:text-rose-200 transition"
          >
            log in
          </button>.
        </p>
      </div>
    );
  }

  // ✔ PASSWORD RESET PAGE (original)
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

      {/* Confirm */}
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

      <button
        className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleChangePassword}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Updating..." : "Change Password"}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-400 mt-2">
          Your password has been updated. You can now{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-rose-300 underline underline-offset-2 hover:text-rose-200 transition"
          >
            log in
          </button>.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-rose-400 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
