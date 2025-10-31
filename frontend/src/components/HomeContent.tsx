import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { googleSignIn } from "../lib/googleSignIn";

export default function HomeContent() {
  const navigate = useNavigate();

  return (
    <>
      {/* Text Content */}
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
        Smarter Links.<br />Deeper Insights.<br />
        <span className="text-rose-400">Shortcak.es</span>
      </h1>

      <p className="mt-4 text-cream max-w-lg">
        Transform every click into real data. Track engagement, location, and growth—all in one dashboard.
      </p>

      {/* Auth buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/signup')}
          className="hover:cursor-pointer px-6 py-3 border border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition"
        >
          Sign Up
        </button>

        <button
          className="hover:cursor-pointer flex items-center justify-center gap-2 px-6 py-3 border border-cream text-cream rounded-lg hover:bg-cream/10 transition"
          onClick={() => googleSignIn(navigate)}
        >
          <FaGoogle className="text-lg" />
          <span>Sign In with Google</span>
        </button>
      </div>

      <p className="mt-6 text-sm text-cream/70">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-rose-400 hover:underline hover:text-rose-300 transition"
        >
          Log in
        </button>
      </p>
    </>
  );
}