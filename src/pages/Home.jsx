import { Bell, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"
import LiveTracking from "./LiveTracking"
function Home() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [trackingData, setTrackingData] = useState({
        arrivalTime: "Calculating...",
        distance: "..."
    })

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const GOOGLE_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const res = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    // Once user is loaded, start tracking the bus
                    startLiveTracking(data.bus_id);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        const startLiveTracking = (busId) => {
            if (!busId) return;

            // Update every 30 seconds
            const interval = setInterval(async () => {
                try {
                    // 1. Get Student's Current Location
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const studentLoc = `${position.coords.latitude},${position.coords.longitude}`;

                        // 2. Get Bus Location from your Backend
                        const busRes = await fetch(`${BASE_URL}/api/bus-location/${busId}`, { credentials: "include" });
                        const busData = await busRes.json();

                        if (busData.latitude && busData.longitude) {
                            const busLoc = `${busData.latitude},${busData.longitude}`;

                            // 3. Call Google Distance Matrix (Better to do this on Backend to hide API Key)
                            const googleRes = await fetch(
                                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${busLoc}&destinations=${studentLoc}&key=${GOOGLE_KEY}`
                            );
                            const gData = await googleRes.json();

                            if (gData.rows[0].elements[0].status === "OK") {
                                const element = gData.rows[0].elements[0];
                                setTrackingData({
                                    arrivalTime: Math.round(element.duration.value / 60), // Duration in minutes
                                    distance: (element.distance.value / 1000).toFixed(1) // Distance in km
                                });
                            }
                        }
                    });
                } catch (e) {
                    console.error("Tracking failed", e);
                }
            }, 30000);

            return () => clearInterval(interval);
        };

        fetchStudentData();
    }, [BASE_URL]);

// ... (Loading and Error UI remains same as your code)

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white font-mono">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4 mx-auto"></div>
                    <p className="text-xl">Loading Student Profile...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-red-900 text-white p-6 text-center">
                <div>
                    <p className="mb-4 text-lg font-bold">Failed to load profile.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-white text-red-900 px-6 py-2 rounded-full font-bold"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        )
    }

    const firstName = user.full_name?.split(" ")[0] || "Student"
    const hour = new Date().getHours()
    let greeting = "Good Morning"
    if (hour >= 12 && hour < 17) greeting = "Good Afternoon"
    if (hour >= 17) greeting = "Good Evening"

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black relative pb-20">
            <div className="px-6 pt-2 pb-8 relative">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.profileImage || "/profile.png"}
                            alt="profile"
                            onClick={() => navigate("/account")}
                            className="w-12 h-12 rounded-full cursor-pointer object-cover border-2 border-white shadow-md"
                        />
                        <div>
                            <p className="font-semibold text-sm text-black">
                                Bus ID: {user.bus_id || "Not Assigned"}
                            </p>
                            <p className="text-sm text-black/80 font-bold">
                                {user.branch_semester || user.course}
                            </p>
                        </div>
                    </div>

                    <div className="relative mr-2 cursor-pointer">
                        <Bell size={32} />
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></span>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold mb-2 tracking-wide text-black">
                    {greeting}, {firstName}
                </h1>

                <p className="text-black/80 font-medium mb-4">
                    Track your bus in real-time and stay updated.
                </p>

                {/* Tracking Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/30 relative">
                    <div className="flex items-center gap-2 mb-2 relative">
                        <div className="relative">
                            <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <span className="text-sm font-bold text-green-900">LIVE TRACKING</span>
                    </div>

                    <p className="text-3xl font-black text-green-900 mt-1">
                        {trackingData.arrivalTime} mins
                    </p>
                    <p className="text-sm text-black/80 font-semibold">
                        {trackingData.distance} km away
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                            <p className="text-gray-500 text-[10px] uppercase font-bold">Bus ID</p>
                            <p className="text-md font-bold">{user.bus_id || "N/A"}</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                            <p className="text-gray-500 text-[10px] uppercase font-bold">Name</p>
                            <p className="text-md font-bold truncate">{user.full_name || "Unknown"}</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                            <p className="text-gray-500 text-[10px] uppercase font-bold">Course</p>
                            <p className="text-md font-bold">{user.course || "-"}</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                            <p className="text-gray-500 text-[10px] uppercase font-bold">Branch/Sem</p>
                            <p className="text-md font-bold">{user.branch_semester || "-"}</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/live-tracking")}
                        className="mt-4 text-blue-900 font-bold text-sm cursor-pointer flex items-center gap-1"
                    >
                        📍 Trace Live Location
                    </div>
                </div>

                {/* SOS Button */}
                <div className="absolute right-6 top-64 z-50">
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-50"></div>
                    <button
                        onClick={() => navigate("/sos")}
                        className="relative bg-red-600 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <AlertTriangle size={36} />
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-black rounded-t-[40px] px-6 py-8 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {/* Morning/Evening Route sections remain same */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-6 text-center shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-4">MORNING ROUTE</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate("/live-tracking?type=morning")}
                            className="bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 active:bg-white/20"
                        >
                            View Live Map
                        </button>
                        <button
                            onClick={() => navigate("/morning-attendance")}
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
                        >
                            Mark Morning Attendance
                        </button>
                    </div>
                </div>

                {/* Evening Route */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-8 text-center shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-4">EVENING ROUTE</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate("/live-tracking?type=evening")}
                            className="bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 active:bg-white/20"
                        >
                            View Live Map
                        </button>
                        <button
                            onClick={() => navigate("/evening-attendance")}
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
                        >
                            Mark Evening Attendance
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/fee-status")}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-2xl font-black mb-4 shadow-xl active:scale-95 transition"
                >
                    CHECK BUS FEE STATUS
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate("/complaint")}
                        className="bg-zinc-800 text-white py-4 rounded-2xl font-bold border border-zinc-700 active:bg-zinc-700"
                    >
                        COMPLAINTS
                    </button>
                    <button
                        onClick={() => navigate("/suggestions")}
                        className="bg-zinc-800 text-white py-4 rounded-2xl font-bold border border-zinc-700 active:bg-zinc-700"
                    >
                        SUGGESTIONS
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

export default Home