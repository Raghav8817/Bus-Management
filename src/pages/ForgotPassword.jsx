import { useNavigate } from "react-router-dom"
import { useState } from "react"

function ForgotPassword() {
    const navigate = useNavigate()
    const [role, setRole] = useState("student")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const handleSendOTP = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/api/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role, type: 'forgot' })
            });
            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
                alert("OTP sent to " + email);
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    }

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            setError("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role, otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password reset successfully!");
                navigate("/login");
            } else {
                setError(data.error || "Reset failed");
            }
        } catch (err) {
            setError("Server error during reset");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-900 font-sans">
            <div className="absolute inset-0 bg-yellow-400" style={{ clipPath: "polygon(0 0, 65% 0, 45% 100%, 0% 100%)" }} />

            <div className="relative z-10 px-6 py-10 flex flex-col min-h-screen">
                <div className="flex justify-center mb-8">
                    <img src="/wctm-logo.png" alt="WCTM Logo" className="w-32 h-32 object-contain" />
                </div>

                <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-2xl max-w-md w-full mx-auto">
                    <h2 className="text-xl font-black mb-6 text-center text-gray-800 uppercase tracking-widest border-b-2 border-gray-100 pb-4">
                        Reset Password
                    </h2>

                    <div className="flex mb-6 bg-gray-100 rounded-full p-1">
                        {["student", "driver", "management"].map((r) => (
                            <button
                                key={r}
                                onClick={() => { setRole(r); setError(""); setIsOtpSent(false); }}
                                className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter ${role === r ? "bg-cyan-500 text-white shadow-md" : "text-gray-500"}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Registered Email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setIsOtpSent(false); }}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 font-bold text-gray-700"
                        />

                        {isOtpSent && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter 6-Digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 font-bold text-gray-700"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 font-bold text-gray-700"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 font-bold text-gray-700"
                                />
                            </>
                        )}

                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

                        <button
                            onClick={isOtpSent ? handleResetPassword : handleSendOTP}
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : (isOtpSent ? "Update Password" : "Send OTP")}
                        </button>
                        
                        <button 
                            onClick={() => navigate("/login")}
                            className="w-full text-gray-400 text-[10px] font-bold uppercase hover:text-gray-600 transition"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword