import { FaGoogle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { googleSignIn } from "../lib/googleSignIn";

export default function Signup() {
  const navigate = useNavigate();

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const handleEmailSignup = async () => {
    if (!email || !pw) return console.warn("Email and password required.");
    if (pw !== pw2) return console.warn("Passwords do not match.");

    try {
      await createUserWithEmailAndPassword(auth, email, pw);

      navigate("/dashboard");
    } catch (e) {
      console.error("Signup error:", e);
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <button onClick={() => navigate('/')} className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition">
        <FaArrowLeft className="text-base" />Back
      </button>

      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-2">
        Create Account
      </h1>

      {/* First & Last Name */}
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm text-neutral-400 mb-1">First Name</h3>
          <input
            type="text"
            placeholder="Enter your first name"
            className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-sm text-neutral-400 mb-1">Last Name</h3>
          <input
            type="text"
            placeholder="Enter your last name"
            className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
        </div>
      </div>

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

      {/* Password & Verify Password */}
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm text-neutral-400 mb-1">Password</h3>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-sm text-neutral-400 mb-1">Verify Password</h3>
          <input
            type="password"
            placeholder="Re-enter your password"
            className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </div>
      </div>

      {/* Sign Up button */}
      <button
        onClick={handleEmailSignup}
        className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition"
      >
        Sign Up
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="h-px flex-1 bg-cream" />
        <span className="text-xs text-cream">or</span>
        <div className="h-px flex-1 bg-cream" />
      </div>

      {/* Google sign-up */}
      <button
        className="hover:cursor-pointer flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-cream text-cream rounded-lg hover:bg-cream/10 transition"
        onClick={() => googleSignIn(navigate)}
      >
        <FaGoogle className="text-lg" />
        <span>Sign Up with Google</span>
      </button>

      {/* Log in redirect */}
      <p className="mt-6 text-sm text-cream/70 text-center">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-rose-400 hover:underline hover:text-rose-300 transition"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
