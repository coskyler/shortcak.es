import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-rose-600 backdrop-blur-sm border-b border-rose-500/20 px-8 py-4">
      <nav className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-cream">LinkShortener</h1>
        <div className="flex gap-6">
          <button
            onClick={async () => {
              await signOut(auth);
              navigate("/");
            }}
            className="text-md text-cream hover:text-rose-300 transition"
          >
            Logout
          </button>{" "}
        </div>
      </nav>
    </header>
  );
}
