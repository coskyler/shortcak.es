import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-rose-600 border-b border-rose-500/20 px-8 py-4">
      <nav className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-2xl font-semibold text-cream hover:text-rose-200 transition"
        >
          <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
          shortcak.es
        </button>


        <div className="flex gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-md text-cream hover:text-rose-300 transition"
          >
            Dashboard
          </button>

          <button
            onClick={async () => {
              await signOut(auth);
              navigate("/");
            }}
            className="text-md text-cream hover:text-rose-300 transition"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
