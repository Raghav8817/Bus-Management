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
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-yellow-400 font-sans">
            {/* Background Decoration */}
            <div
                className="absolute inset-0 bg-yellow-400"
                style={{
                    clipPath: "polygon(0 0, 65% 0, 45% 100%, 0% 100%)"
                }}
            />

            <div className="relative z-10 px-6 py-10 flex flex-col min-h-screen">
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/wctm-logo.png"
                        alt="WCTM Logo"
                        className="w-40 h-40 object-contain"
                    />
                </div>

                <h1 className="text-center text-white font-black text-2xl mb-8 tracking-widest uppercase">
                    WCTM Transport
                </h1>

                {/* Form Card */}
                <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-w-md mx-auto w-full">
                    <h2 className="text-xl font-black mb-8 text-center text-gray-800 uppercase tracking-widest border-b-2 border-gray-100 pb-4">
                        {role} Login
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder={
                                role === "student" ? "Registered Email" : 
                                role === "driver" ? "Driver ID" : "Management ID"
                            }
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-cyan-500 transition-all font-bold text-gray-700"
                        />

                        {role === "driver" && (
                            <input
                                type="text"
                                placeholder="Bus Number"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-cyan-500 transition-all font-bold text-gray-700"
                            />
                        )}

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-cyan-500 transition-all font-bold text-gray-700"
                        />

                        {error && (
                            <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest bg-red-50 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className={`w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Verifying..." : "Sign In"}
                        </button>
                    </div>
                </div>

                {/* Role Switcher */}
                <div className="mt-auto max-w-md mx-auto w-full">
                    <div className="flex justify-between border-2 border-white rounded-full p-1 mb-6 backdrop-blur-sm bg-black/10">
                        {["student", "driver", "management"].map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRole(r);
                                    setError("");
                                }}
                                className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${role === r
                                    ? "bg-cyan-500 text-white shadow-lg"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="text-center text-xs text-white font-bold pb-4 uppercase tracking-widest">
                        New User?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-cyan-400 font-black cursor-pointer hover:underline"
                        >
                            Register Here
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;