import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center pt-20">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">My Profile</h2>
                    <button onClick={() => navigate("/")} className="text-blue-400 hover:text-blue-300">
                        Back to Dashboard
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Username</span>
                        <span className="font-semibold">{user?.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Email</span>
                        <span className="font-semibold">{user?.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">Credits</span>
                        <span className="font-semibold text-yellow-400">{user?.credits || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <span className="text-gray-400">User ID</span>
                        <span className="font-mono text-xs">{user?.id}</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white p-3 rounded font-bold transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
