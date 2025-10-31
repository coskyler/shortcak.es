import { FaGoogle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { googleSignIn } from "../lib/googleSignIn";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <button onClick={() => navigate('/')} className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition">
        <FaArrowLeft className="text-base" />Back
      </button>

      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-2">
        Welcome Back
      </h1>

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

      {/* Password */}
      <div>
        <h3 className="text-sm text-neutral-400 mb-1">Password</h3>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Log In button */}
      <button
        className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition"
        onClick={() => handleLogin()}
      >
        Log In
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="h-px flex-1 bg-cream" />
        <span className="text-xs text-cream">or</span>
        <div className="h-px flex-1 bg-cream" />
      </div>

      {/* Google sign-in */}
      <button
        className="hover:cursor-pointer flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-cream text-cream rounded-lg hover:bg-cream/10 transition"
        onClick={() => googleSignIn(navigate)}
      >
        <FaGoogle className="text-lg" />
        <span>Sign In with Google</span>
      </button>

      {/* Sign up redirect */}
      <p className="mt-6 text-sm text-cream/70 text-center">
        Don’t have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="text-rose-400 hover:underline hover:text-rose-300 transition"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}