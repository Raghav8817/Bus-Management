import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Input = ({ type = "text", placeholder, value, setValue }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
    />
)

function Signup() {

    const navigate = useNavigate()
    const [role, setRole] = useState("student")

    const [fullName, setFullName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

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

    const handleSignup = async () => {

        setError("")

        if (!fullName || !password) {
            setError("Please fill required fields")
            return
        }

        if (role === "student") {
            if (!studentBusId || !course || !branchSem || !studentContact || !studentEmail || !studentAddress) {
                setError("All student fields are required")
                return
            }
        }

        if (role === "driver") {
            if (!busId || !driverId || !busNumber || !driverContact || !driverAddress) {
                setError("All driver fields are required")
                return
            }
        }

        if (role === "management") {
            if (!managementId || !managementEmail || !managementAddress) {
                setError("All management fields are required")
                return
            }
        }

        const newUser = {
            role,
            fullName,
            password,

            busId: role === "student" ? studentBusId : busId,

            course: role === "student" ? course : null,
            branchSem: role === "student" ? branchSem : null,

            contact:
                role === "student"
                    ? studentContact
                    : role === "driver"
                    ? driverContact
                    : null,

            email:
                role === "student"
                    ? studentEmail
                    : role === "management"
                    ? managementEmail
                    : null,

            address:
                role === "student"
                    ? studentAddress
                    : role === "driver"
                    ? driverAddress
                    : role === "management"
                    ? managementAddress
                    : null,

            driverId: role === "driver" ? driverId : null,
            busNumber: role === "driver" ? busNumber : null,

            managementId: role === "management" ? managementId : null
        }

        console.log(newUser);

        
        
        try {
            const response=await fetch("http://localhost:3000/signup",{
                method:"POST",
                headers: { "Content-Type": "application/json", },
                body:JSON.stringify(newUser),
                credentials: "include",
            });
            const result=await response.json()
            if (response.ok) {
                alert("Account Created Successfully")
                console.log(response.message);
                if (role==="student") {
                    navigate("/")
                }
                else if (role==="driver") {
                    navigate("/driver-dashboard")
                }
                else{
                    navigate("/management-dashboard")
                }
            }
            else{
                setError(result.message||"Server Error at Signup")
            }
        } catch (error) {
            console.error(error);
            setError("Internal Server Error. Is the backend running?");
        }

        
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-500 flex items-center justify-center px-4 py-10">

            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">

                <h1 className="text-3xl font-bold text-center mb-6 text-black">
                    Create Account
                </h1>

                <div className="flex mb-8 bg-gray-100 rounded-full p-1">
                    {["student", "driver", "management"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                                role === r
                                    ? "bg-yellow-400 text-black shadow-md"
                                    : "text-gray-600"
                            }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">

                    {role === "student" && (
                        <>
                            <Input placeholder="Full Name" value={fullName} setValue={setFullName} />
                            <Input placeholder="Bus ID" value={studentBusId} setValue={setStudentBusId} />
                            <Input placeholder="Course" value={course} setValue={setCourse} />
                            <Input placeholder="Branch + Semester" value={branchSem} setValue={setBranchSem} />
                            <Input placeholder="Contact Number" value={studentContact} setValue={setStudentContact} />
                            <Input placeholder="Email ID" value={studentEmail} setValue={setStudentEmail} />
                            <Input placeholder="Address" value={studentAddress} setValue={setStudentAddress} />
                            <Input type="password" placeholder="Password" value={password} setValue={setPassword} />
                        </>
                    )}

                    {role === "driver" && (
                        <>
                            <Input placeholder="Full Name" value={fullName} setValue={setFullName} />
                            <Input placeholder="Driver ID" value={driverId} setValue={setDriverId} />
                            <Input placeholder="Bus ID" value={busId} setValue={setBusId} />
                            <Input placeholder="Bus Number" value={busNumber} setValue={setBusNumber} />
                            <Input placeholder="Contact Number" value={driverContact} setValue={setDriverContact} />
                            <Input placeholder="Address" value={driverAddress} setValue={setDriverAddress} />
                            <Input type="password" placeholder="Password" value={password} setValue={setPassword} />
                        </>
                    )}

                    {role === "management" && (
                        <>
                            <Input placeholder="Management ID" value={managementId} setValue={setManagementId} />
                            <Input placeholder="Full Name" value={fullName} setValue={setFullName} />
                            <Input placeholder="Email ID" value={managementEmail} setValue={setManagementEmail} />
                            <Input placeholder="Address" value={managementAddress} setValue={setManagementAddress} />
                            <Input type="password" placeholder="Password" value={password} setValue={setPassword} />
                        </>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm text-center">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSignup}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-semibold transition"
                    >
                        Sign Up
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Signup

