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

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        const loginData = {
            role,
            password,
            [role === "student" ? "email_id" : "id"]: id,
            bus_id: busNumber
        };

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
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
                setError(data.error || "Invalid Credentials ❌");
            }
        } catch (error) {
            console.error("Login Error:", error);
            setError("Server connection failed ⚠️");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#262626] font-sans">
            {/* Soft Gradient Background Split */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(115deg, #facc15 0%, #facc15 40%, rgba(0,0,0,0.2) 42%, #262626 45%, #262626 100%)"
                }}
            />

            <div className="relative z-10 px-8 py-12 flex flex-col items-center min-h-screen">
                {/* Logo Section */}
                <div className="flex justify-center mb-12">
                    <img
                        src="/wctm-logo.png"
                        alt="WCTM Logo"
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Input Fields */}
                <div className="w-full max-w-sm space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={
                                role === "student" ? "Registered Email" : 
                                role === "driver" ? "Driver ID" : "Management ID"
                            }
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                        />
                    </div>

                    {role === "driver" && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Bus Number"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                                className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                        />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end pr-2">
                        <span
                            onClick={() => navigate("/forgot-password")}
                            className="text-cyan-400 font-black text-base cursor-pointer hover:underline uppercase tracking-tighter"
                        >
                            Forgot Password?
                        </span>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-black uppercase text-center tracking-widest bg-white/10 py-3 rounded-2xl border-2 border-red-500/20">
                            {error}
                        </p>
                    )}

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full bg-cyan-400 hover:bg-cyan-500 text-black py-5 rounded-[22px] font-black text-2xl uppercase tracking-[2px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "..." : "Log In"}
                    </button>

                    {/* Role Switcher Pill */}
                    <div className="flex bg-[#1a1a1a] rounded-full p-1 overflow-hidden shadow-inner border border-white/5">
                        {["student", "driver", "management"].map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRole(r);
                                    setError("");
                                }}
                                className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-tighter transition-all duration-300 ${role === r
                                    ? "bg-cyan-400 text-black shadow-lg scale-100"
                                    : "text-white hover:bg-white/5 scale-95 opacity-60"
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm font-bold pt-4 text-white">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-cyan-400 font-black cursor-pointer hover:underline"
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