import { FaGoogle, FaArrowLeft } from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";

function Home() {
  const { pathname = '/' } = useLocation();
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen text-cream overflow-hidden p-10 flex items-center bg-gradient-to-br from-black/25 via-rose-500/25 to-black/25">
      <div className="relative z-10 flex flex-col items-stretch text-left w-full px-6">
        {/* Logo */}
        <img
          src="/favicon.svg"
          alt="Shortcak.es logo"
          className="w-30 h-30 mb-6 opacity-90"
        />

        {pathname === '/' && (
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

              <button className="hover:cursor-pointer flex items-center justify-center gap-2 px-6 py-3 border border-cream text-cream rounded-lg hover:bg-cream/10 transition">
                <FaGoogle className="text-lg" />
                <span>Sign In with Google</span>
              </button>
            </div>
          </>
        )}

        {pathname === '/signup' && (
          <div className="w-full max-w-lg flex flex-col gap-4">
            <button onClick={() => navigate('/')} className="hover:cursor-pointer flex items-center gap-2 text-sm text-cream/80 hover:text-cream transition">
              <FaArrowLeft className="text-base" />Back
            </button>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-2">
              Create Account
            </h1>

            {/* Email */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-1">Email</h3>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-1">Password</h3>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            {/* Verify Password */}
            <div>
              <h3 className="text-sm text-neutral-400 mb-1">Verify Password</h3>
              <input
                type="password"
                placeholder="Re-enter your password"
                className="w-full px-6 py-3 border-2 border-cream text-cream rounded-lg bg-transparent placeholder-cream/60 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            {/* Sign Up button */}
            <button className="hover:cursor-pointer w-full px-6 py-3 border-2 border-rose-400 text-rose-400 rounded-lg font-medium hover:bg-rose-400/10 transition">
              Sign Up
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-cream" />
              <span className="text-xs text-cream">or</span>
              <div className="h-px flex-1 bg-cream" />
            </div>

            {/* Google sign-up */}
            <button className="hover:cursor-pointer flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-cream text-cream rounded-lg hover:bg-cream/10 transition">
              <FaGoogle className="text-lg" />
              <span>Sign Up with Google</span>
            </button>
          </div>

        )}

      </div>

      {/* Decor */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        className="absolute bottom-0 right-0 w-[90vw] h-[100vh] opacity-90 text-cream fill-cream pointer-events-none select-none z-0 hidden lg:block"
      >
        <g mask="url(#mask)" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M724.06 829.09C875.96 797.44 902.36 433.48 1175.93 403.61 1449.51 373.74 1504.05 205.2 1627.81 200.61" />
          <path d="M172.5 758.27C309.7 738.5 381.12 417.78 608.08 415.16 835.03 412.54 825.86 502.66 1043.65 502.66 1261.44 502.66 1368.16 415.59 1479.23 415.16" />
          <path d="M954.16 735C1093.23 690.25 1082.31 333.94 1329.97 287.49 1577.63 241.04 1596.72 71.77 1705.78 63.49" />
          <path d="M926.51 779.53C1034.46 730.74 949.8 415.71 1193.48 388.05 1437.16 360.39 1586.97 215.26 1727.42 213.05" />
          <path d="M688.42 799.6C860.66 744.5 915.64 247.74 1154.55 246.44 1393.46 245.14 1477.1 571.63 1620.68 589.44" />
        </g>
        <defs>
          <mask id="mask">
            <rect width="1440" height="700" fill="white" />
          </mask>
        </defs>
      </svg>
    </main>
  );
}

export default Home;
