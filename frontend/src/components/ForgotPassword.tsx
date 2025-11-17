import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleReset = async () => {
        if (!email) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Password reset email sent");
            setStatus("success");
        } catch (err) {
            console.error("Password reset failed:", err);
            setStatus("error");

            const error = err as { code?: string; message?: string };

            setErrorMessage(
                error.code === "auth/user-not-found"
                    ? "No account found with that email."
                    : `Something went wrong: ${error.code ?? error.message ?? "Unknown error"}`
            );
        }
    };


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
                Reset Password
            </h1>

            <p className="text-sm text-neutral-300 mb-2">
                Enter the email associated with your account and we’ll send you a link to reset your password.
            </p>

            {/* Email */}
            <div>
                <h3 className="text-sm text-neutral-400 mb-1">Email</h3>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Reset button */}
            <button
                className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleReset}
                disabled={!email || status === "loading"}
            >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Status messages */}
            {status === "success" && (
                <p className="text-sm text-green-400 mt-2">
                    Password reset email sent. Check your inbox for further instructions.
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
