import { useNavigate } from "react-router-dom";
import { useState } from "react";

function StudentLogin() {
    const [role, setRole] = useState("student");
    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [busNumber, setBusNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // --- DYNAMIC URL SETUP ---
    // If VITE_API_URL is set in Vercel, it uses that. Otherwise, it defaults to localhost.
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            // FIXED: Using template literal with BASE_URL
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, id, password, busNumber }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                if (data.role === "driver") {
                    navigate("/driver-dashboard", { replace: true });
                } else if (data.role === "management") {
                    navigate("/management-dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } else {
                setError(data.error || "Login failed ❌");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Server connection failed ⚠️");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-yellow-400">
            {/* Background Decoration */}
            <div
                className="absolute inset-0 bg-yellow-400"
                style={{
                    clipPath: "polygon(0 0, 65% 0, 45% 100%, 0% 100%)"
                }}
            />

            <div className="relative z-10 px-6 py-10 flex flex-col min-h-screen">
                {/* Logo Section */}
                <div className="flex justify-center mb-12">
                    <img
                        src="/wctm-logo.png"
                        alt="WCTM Logo"
                        className="w-40 h-40 object-contain"
                    />
                </div>

                {/* Form Card */}
                <div className="bg-white border border-black rounded-2xl p-6 shadow-md max-w-md mx-auto w-full">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
                        {role.toUpperCase()} LOGIN
                    </h2>

                    <input
                        type="text"
                        placeholder={
                            role === "student"
                                ? "Student Email"
                                : role === "driver"
                                    ? "Driver ID"
                                    : "Management ID"
                        }
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-cyan-500 transition-colors"
                    />

                    {role === "driver" && (
                        <input
                            type="text"
                            placeholder="Bus Number"
                            value={busNumber}
                            onChange={(e) => setBusNumber(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-cyan-500 transition-colors"
                        />
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 outline-none focus:border-cyan-500 transition-colors"
                    />

                    {error && (
                        <p className="text-red-500 text-sm mb-3 text-center font-medium">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold shadow-md transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Verifying..." : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
                    </button>
                </div>

                {/* Role Switcher */}
                <div className="mt-auto max-w-md mx-auto w-full">
                    <div className="flex justify-between border border-white rounded-full p-1 mb-6 backdrop-blur-sm">
                        {["student", "driver", "management"].map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRole(r);
                                    setError("");
                                }}
                                className={`flex-1 py-2 rounded-full font-medium transition-all duration-300 ${role === r
                                    ? "bg-cyan-500 text-white shadow-lg"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="text-center text-sm text-white pb-4">
                        Don’t have an account?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-cyan-400 font-bold cursor-pointer hover:underline"
                        >
                            Sign Up
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;