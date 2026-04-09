import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Input = ({ type = "text", placeholder, value, setValue, error }) => (
    <div className="w-full">
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition`}
        />
        {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">{error}</p>}
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
    const [driverContact, setDriverContact] = useState("")
    const [driverAddress, setDriverAddress] = useState("")

    const [managementId, setManagementId] = useState("")
    const [managementEmail, setManagementEmail] = useState("")
    const [managementAddress, setManagementAddress] = useState("")

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const validate = () => {
        const errors = {};
        if (!fullName) errors.fullName = "Required";
        if (!password || password.length < 6) errors.password = "Min 6 chars";
        if (role === 'student') {
            if (!studentEmail) errors.studentEmail = "Required";
            if (!studentBusId) errors.studentBusId = "Required";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSignup = async () => {
        setError("")
        if (!validate()) return;

        const newUser = {
            role,
            fullName,
            password,
            email: role === "student" ? studentEmail : managementEmail,
            contact: role === "student" ? studentContact : driverContact,
            address: role === "student" ? studentAddress : (role === "driver" ? driverAddress : managementAddress),
            studentBusId,
            course,
            branchSem,
            driverId,
            busId,
            busNumber,
            managementId
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
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-500 flex items-center justify-center px-4 py-10">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-black">Create Account</h1>

                <div className="flex mb-8 bg-gray-100 rounded-full p-1">
                    {["student", "driver", "management"].map((r) => (
                        <button
                            key={r}
                            onClick={() => { setRole(r); setFieldErrors({}); }}
                            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${role === r ? "bg-yellow-400 text-black shadow-md" : "text-gray-600"}`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <Input placeholder="Full Name" value={fullName} setValue={setFullName} error={fieldErrors.fullName} />

                    {role === "student" && (
                        <>
                            <Input placeholder="Bus Number (Assigned)" value={studentBusId} setValue={setStudentBusId} error={fieldErrors.studentBusId} />
                            <Input placeholder="Course" value={course} setValue={setCourse} />
                            <Input placeholder="Branch + Semester" value={branchSem} setValue={setBranchSem} />
                            <Input placeholder="Contact Number" value={studentContact} setValue={setStudentContact} />
                            <Input placeholder="Email ID" value={studentEmail} setValue={setStudentEmail} error={fieldErrors.studentEmail} />
                            <Input placeholder="Address" value={studentAddress} setValue={setStudentAddress} />
                        </>
                    )}

                    {role === "driver" && (
                        <>
                            <Input placeholder="Driver ID" value={driverId} setValue={setDriverId} />
                            <Input placeholder="Bus ID" value={busId} setValue={setBusId} />
                            <Input placeholder="Bus Number" value={busNumber} setValue={setBusNumber} />
                            <Input placeholder="Contact Number" value={driverContact} setValue={setDriverContact} />
                            <Input placeholder="Address" value={driverAddress} setValue={setDriverAddress} />
                        </>
                    )}

                    {role === "management" && (
                        <>
                            <Input placeholder="Management ID" value={managementId} setValue={setManagementId} />
                            <Input placeholder="Email ID" value={managementEmail} setValue={setManagementEmail} />
                            <Input placeholder="Address" value={managementAddress} setValue={setManagementAddress} />
                        </>
                    )}

                    <Input type="password" placeholder="Password" value={password} setValue={setPassword} error={fieldErrors.password} />

                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                    <button
                        onClick={handleSignup}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition shadow-lg active:scale-95"
                    >
                        Sign Up
                    </button>

                    <p className="text-center text-gray-500 text-xs mt-4">
                        Already have an account? <span onClick={() => navigate("/login")} className="text-yellow-600 font-bold cursor-pointer hover:underline">Log In</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup