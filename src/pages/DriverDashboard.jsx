import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function DriverDashboard() {
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [tripStarted, setTripStarted] = useState(false)

    // --- 1. FETCH DRIVER PROFILE & STUDENTS ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

            try {
                // Fetch driver user profile
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                if (!userRes.ok) {
                    navigate("/Login");
                    return;
                }
                const userData = await userRes.json();

                // Map database fields to the local 'driver' state
                const mappedDriver = {
                    ...userData,
                    fullName: userData.full_name,
                    busNumber: userData.bus_id || userData.bus_number
                };
                setDriver(mappedDriver);

                // Fetch students assigned to this specific bus
                const studentsRes = await fetch(`${BASE_URL}/api/bus-students/${mappedDriver.busNumber}`, {
                    credentials: "include"
                });
                if (studentsRes.ok) {
                    const studentList = await studentsRes.json();
                    setStudents(studentList);
                }

            } catch (err) {
                console.error("Dashboard initialization error:", err);
                navigate("/Login");
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // --- 2. GPS TRACKING LOGIC ---
    useEffect(() => {
        let watchId;
        const startTracking = () => {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

                        try {
                            await fetch(`${BASE_URL}/api/update-location`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ latitude, longitude }),
                                credentials: "include"
                            });
                            console.log("Location pinged:", latitude, longitude);
                        } catch (err) {
                            console.error("Failed to send location");
                        }
                    },
                    (error) => console.error("GPS Error:", error),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        };

        if (tripStarted) {
            startTracking();
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [tripStarted]);

    const logout = async () => {
        try {
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const response = await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            if (response.ok) {
                window.location.href = "/Login";
            }
        } catch (err) {
            window.location.href = "/Login";
        }
    };

    const getAttendanceStatus = (studentEmail) => {
        const record = attendance.find((a) => String(a.email) === String(studentEmail));
        return record?.status === "present";
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-400 p-4 pb-24">
            {/* Top bar */}
            <div className="bg-yellow-400 rounded-2xl p-4 shadow-xl mb-6 flex justify-between items-center text-black">
                <div>
                    <h1 className="text-xl font-bold">
                        Bus {driver?.busNumber || "..."} Driver
                    </h1>
                    <p className="text-sm font-medium">
                        Good Morning, {driver?.fullName || "Loading..."}
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold"
                >
                    Logout
                </button>
            </div>

            {/* Emergency Button */}
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 text-black">
                <button
                    onClick={() => alert("Calling Transport Management...")}
                    className="w-full bg-yellow-400 py-3 rounded-xl font-bold hover:scale-105 transition"
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
                            className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center text-black"
                        >
                            <div>
                                <h2 className="font-bold">{student.fullName}</h2>
                                <p className="text-sm text-gray-600">Stop: {student.stop || "N/A"}</p>
                            </div>
                            <div>
                                {checkedIn ? (
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">✅ Present</span>
                                ) : (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">❌ Absent</span>
                                )}
                            </div>
                        </div>
                    )
                })}
                {students.length === 0 && (
                    <p className="text-white text-center opacity-50 mt-10">No students assigned to this bus.</p>
                )}
            </div>

            {/* Start Trip Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 rounded-t-3xl shadow-xl z-20">
                <button
                    onClick={toggleTrip}
                    className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95 ${tripStarted ? "bg-red-600" : "bg-green-600"
                        }`}
                >
                    {tripStarted ? "END TRIP" : "START TRIP"}
                </button>
            </div>
        </div>
    )
}

export default DriverDashboard