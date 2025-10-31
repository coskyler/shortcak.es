import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-cream">
            <button
                onClick={async () => { await signOut(auth); navigate('/'); }}
                className="absolute top-6 right-6 text-sm text-rose-400 hover:text-rose-300 transition"
            >
                Logout
            </button>


            <h1 className="text-5xl font-semibold mb-4">Dashboard</h1>
            <p className="text-cream/70">Welcome to the dashboard</p>
        </main>
    );
}

export default Dashboard;
