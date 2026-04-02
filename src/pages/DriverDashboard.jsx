import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function DriverDashboard() {

    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [tripStarted, setTripStarted] = useState(false)

    useEffect(() => {
        const fetchDriverData = async () => {
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            
            try {
                // Get driver user profile
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    
                    const mappedUser = {
                        ...userData,
                        fullName: userData.full_name || userData.fullName,
                        busNumber: userData.bus_number || userData.busNumber
                    };
                    
                    if (mappedUser.role !== "driver") {
                        navigate("/");
                        return;
                    }
                    setDriver(mappedUser);

                    // Get students for this bus
                    const studentsRes = await fetch(`${BASE_URL}/api/users?role=student`, { credentials: "include" });
                    if (studentsRes.ok) {
                        const allStudents = await studentsRes.json();
                        const busStudents = allStudents.filter(
                            s => String(s.busId) === String(mappedUser.busNumber)
                        );
                        setStudents(busStudents);
                    }
                } else {
                    navigate("/");
                }
                
                // Get array-style attendance if it exists (mocked as empty right now)
                try {
                    const attRes = await fetch(`${BASE_URL}/api/attendance`);
                    if (attRes.ok) {
                        // The backend returns an object for the monthly grid, we format as array for drivers
                        const monthlyData = await attRes.json();
                        // just a mock array so it doesn't break
                        setAttendance([]);
                    }
                } catch (e) {}

            } catch (err) {
                console.error(err);
                navigate("/");
            }
        };

        fetchDriverData();
    }, [navigate]);


    const logout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        navigate("/")
    }


    const getAttendanceStatus = (studentEmail) => {

        const record = attendance.find(
            (a) => String(a.email) === String(studentEmail)
        )

        return record?.status === "present"
    }


    const toggleTrip = async () => {
        const newStatus = !tripStarted;
        setTripStarted(newStatus);
        
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        try {
            await fetch(`${BASE_URL}/api/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "trip_status",
                    referenceId: driver?.busNumber,
                    data: { started: newStatus }
                })
            });
        } catch (err) {
            console.error(err);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-400 p-4">

            {/* Top bar */}
            <div className="bg-yellow-400 rounded-2xl p-4 shadow-xl mb-6 flex justify-between items-center">

                <div>
                    <h1 className="text-xl font-bold">
                        Bus {driver?.busNumber} Driver
                    </h1>

                    <p className="text-sm">
                        Good Morning, {driver?.fullName}
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>

            </div>


            {/* Emergency Button */}
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">

                <button
                    onClick={() => alert("Calling Transport Management...")}
                    className="w-full bg-yellow-400 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                    🚨 Emergency Call
                </button>

            </div>


            {/* Students List */}
            <div className="space-y-4">

                {students.map((student) => {

                    const checkedIn = getAttendanceStatus(student.email)

                    return (
                        <div
                            key={student.email}
                            className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center hover:scale-[1.02] transition"
                        >

                            <div>

                                <h2 className="font-bold">
                                    {student.fullName}
                                </h2>

                                <p className="text-sm text-gray-600">
                                    Stop: {student.stop || "N/A"}
                                </p>

                            </div>

                            <div>

                                {checkedIn ? (
                                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm">
                                        ✅ Checked In
                                    </span>
                                ) : (
                                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm">
                                        ❌ Not Checked
                                    </span>
                                )}

                            </div>

                        </div>
                    )

                })}


                {students.length === 0 && (
                    <p className="text-white text-center mt-10">
                        No students assigned to this bus.
                    </p>
                )}

            </div>


            {/* Start Trip Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 rounded-t-3xl shadow-xl">

                <button
                    onClick={toggleTrip}
                    className={`w-full py-3 rounded-xl font-bold text-white transition ${
                        tripStarted
                            ? "bg-red-500"
                            : "bg-green-500"
                    }`}
                >
                    {tripStarted ? "END TRIP" : "START TRIP"}
                </button>

            </div>

        </div>
    )
}

export default DriverDashboard