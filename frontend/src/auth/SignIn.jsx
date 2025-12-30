import { useState } from "react";
import { signIn } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn } from "lucide-react";

export default function SignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await signIn(formData);
            login(data.result, data.token);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Signin failed! " + (error.response?.data?.message || "Check your credentials."));
        }
        setLoading(false);
    };

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[20%] right-[30%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] left-[30%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]" />

            <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-400 text-sm mt-2">Sign in to continue your learning journey</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 ml-1">Email</label>
                        <input
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                            placeholder="you@example.com"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 ml-1">Password</label>
                        <input
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                            placeholder="••••••••"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-blue-600/20"
                    >
                        {loading ? "Signing In..." : "Sign In"} <LogIn size={20} />
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-gray-400">
                        Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium ml-1">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
