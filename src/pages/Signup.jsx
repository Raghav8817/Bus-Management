import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Input = ({ type = "text", placeholder, value, setValue, error }) => (
    <div className="w-full">
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg ${error ? 'ring-4 ring-red-500/50' : ''} transition-all`}
        />
        {error && <p className="text-[12px] text-red-500 font-black mt-2 ml-4 uppercase tracking-tighter">{error}</p>}
    </div>
)

function Signup() {
    const navigate = useNavigate()
    const [role, setRole] = useState("student")

    const [fullName, setFullName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})

    const [studentBusId, setStudentBusId] = useState("")
    const [course, setCourse] = useState("")
    const [branchSem, setBranchSem] = useState("")
    const [studentContact, setStudentContact] = useState("")
    const [studentEmail, setStudentEmail] = useState("")
    const [studentAddress, setStudentAddress] = useState("")

    const [busId, setBusId] = useState("")
    const [driverId, setDriverId] = useState("")
    const [busNumber, setBusNumber] = useState("")
    const [driverEmail, setDriverEmail] = useState("")
    const [driverContact, setDriverContact] = useState("")
    const [driverAddress, setDriverAddress] = useState("")

    const [managementId, setManagementId] = useState("")
    const [managementEmail, setManagementEmail] = useState("")
    const [managementAddress, setManagementAddress] = useState("")

    const [otp, setOtp] = useState("")
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const validate = () => {
        const errors = {};
        if (!fullName) errors.fullName = "Required";
        if (!password || password.length < 6) errors.password = "Min 6 chars";
        if (role === 'student') {
            if (!studentEmail) errors.studentEmail = "Required";
            // if (!studentBusId) errors.studentBusId = "Required";
        }
        if (role === 'driver') {
            if (!driverEmail) errors.driverEmail = "Email Required";
        }
        if (role === 'management') {
            if (!managementEmail) errors.managementEmail = "Required";
        }
        if (!otp) errors.otp = "OTP Required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const getCurrentEmail = () => {
        if (role === 'student') return studentEmail;
        if (role === 'driver') return driverEmail;
        return managementEmail;
    };

    const handleSendOTP = async () => {
        const email = getCurrentEmail();
        if (!email) {
            setError("Enter email first");
            return;
        }

        setOtpLoading(true);
        setError("");

        try {
            const res = await fetch(`${BASE_URL}/api/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role, type: 'signup' })
            });
            const data = await res.json();
            if (res.ok) {
                setIsOtpSent(true);
                alert("OTP Sent to " + email);
            } else {
                setError(data.details || data.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Server error while sending OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSignup = async () => {
        setError("")
        if (!validate()) return;

        const newUser = {
            role,
            fullName,
            password,
            email: getCurrentEmail(),
            contact: role === "student" ? studentContact : driverContact,
            address: role === "student" ? studentAddress : (role === "driver" ? driverAddress : managementAddress),
            studentBusId,
            course,
            branchSem,
            driverId,
            busId,
            busNumber,
            managementId,
            otp
        };

        try {
            const response = await fetch(`${BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
                credentials: "include",
            });

            const result = await response.json()

            if (response.ok) {
                alert("Account Created Successfully")
                if (role === "student") navigate("/")
                else if (role === "driver") navigate("/driver-dashboard")
                else navigate("/management-dashboard")
            } else {
                setError(result.error || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            setError("Server connection failed");
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#262626] font-sans pb-10">
            {/* Top Yellow Header Section with Gradient */}
            <div className={`transition-all duration-700 ${isOtpSent ? 'h-[25vh]' : 'h-[35vh]'} bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center relative shadow-xl border-b-4 border-black/10`}>
                <img src="/wctm-logo.png" alt="WCTM Logo" className="w-52 h-52 object-contain drop-shadow-2xl translate-y-6" />
            </div>

            <div className="relative z-10 px-8 py-8 flex flex-col items-center">
                {/* Title Pill */}
                <div className="bg-[#0e7490] text-white px-10 py-3 rounded-full font-black text-lg uppercase mb-8 shadow-lg text-center w-full max-w-sm">
                    Sign Up New User
                </div>

                {/* Role Switcher Pill */}
                <div className="flex bg-[#1a1a1a] rounded-full p-1 w-full max-w-sm mb-8 border border-white/5">
                    {["student", "driver", "management"].map((r) => (
                        <button
                            key={r}
                            onClick={() => { setRole(r); setFieldErrors({}); }}
                            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${role === r ? "bg-cyan-400 text-black shadow-md" : "text-white opacity-40 hover:opacity-100"}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-sm space-y-6">
                    <Input placeholder="Full Name" value={fullName} setValue={setFullName} error={fieldErrors.fullName} />

                    {role === "student" && (
                        <>
                            <Input placeholder="Course" value={course} setValue={setCourse} />
                            {/* <Input placeholder="Branch + Semester" value={branchSem} setValue={setBranchSem} /> */}
                            <Input placeholder="Contact Number" value={studentContact} setValue={setStudentContact} />
                            {/* <Input placeholder="Address" value={studentAddress} setValue={setStudentAddress} /> */}
                            <div className="flex gap-2">
                                <Input placeholder="EMail I'd" value={studentEmail} setValue={setStudentEmail} error={fieldErrors.studentEmail} />
                                <button
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="bg-black text-white px-6 rounded-[22px] text-sm font-black whitespace-nowrap disabled:opacity-50 h-[60px] shadow-lg border-2 border-yellow-400/20 active:scale-95 transition-all"
                                >
                                    {otpLoading ? "..." : (isOtpSent ? "RESEND" : "SEND OTP")}
                                </button>
                            </div>
                        </>
                    )}

                    {role === "driver" && (
                        <>
                            <Input placeholder="Driver ID" value={driverId} setValue={setDriverId} />
                            <Input placeholder="Bus ID" value={busId} setValue={setBusId} />
                            <Input placeholder="Bus Number" value={busNumber} setValue={setBusNumber} />
                            <Input placeholder="Contact Number" value={driverContact} setValue={setDriverContact} />
                            <div className="flex gap-2">
                                <Input placeholder="EMail I'd" value={driverEmail} setValue={setDriverEmail} error={fieldErrors.driverEmail} />
                                <button
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="bg-black text-white px-6 rounded-[22px] text-sm font-black whitespace-nowrap disabled:opacity-50 h-[60px] shadow-lg border-2 border-yellow-400/20 active:scale-95 transition-all"
                                >
                                    {otpLoading ? "..." : (isOtpSent ? "RESEND" : "SEND OTP")}
                                </button>
                            </div>
                        </>
                    )}

                    {role === "management" && (
                        <>
                            <Input placeholder="Management ID" value={managementId} setValue={setManagementId} />
                            <div className="flex gap-2">
                                <Input placeholder="EMail I'd" value={managementEmail} setValue={setManagementEmail} error={fieldErrors.managementEmail} />
                                <button
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="bg-black text-white px-6 rounded-[22px] text-sm font-black whitespace-nowrap disabled:opacity-50 h-[60px] shadow-lg border-2 border-yellow-400/20 active:scale-95 transition-all"
                                >
                                    {otpLoading ? "..." : (isOtpSent ? "RESEND" : "SEND OTP")}
                                </button>
                            </div>
                        </>
                    )}

                    <Input placeholder="Enter OTP" value={otp} setValue={setOtp} error={fieldErrors.otp} />

                    <Input type="password" placeholder="Password" value={password} setValue={setPassword} error={fieldErrors.password} />

                    {error && <p className="text-red-500 text-sm font-black uppercase text-center border-2 border-red-500/20 py-3 rounded-2xl bg-white/5">{error}</p>}

                    <button
                        onClick={handleSignup}
                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-4 rounded-[22px] font-black text-2xl uppercase tracking-[1px] shadow-xl transition-all active:scale-95"
                    >
                        Sign Up
                    </button>

                    <button 
                        onClick={() => navigate("/login")}
                        className="w-full bg-cyan-400 text-black py-4 rounded-full font-black text-lg uppercase shadow-lg active:scale-95 mt-4"
                    >
                        Back to Login Page
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Signup