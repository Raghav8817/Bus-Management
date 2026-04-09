import { Bell, AlertTriangle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from "./BottomNav"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Haversine distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function Home() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tripActive, setTripActive] = useState(false)
    const [trackingData, setTrackingData] = useState({ arrivalTime: null, distance: null })
    const [autoAttendanceMsg, setAutoAttendanceMsg] = useState("")

    // Prevent double-logging attendance in one session
    const attendanceLoggedRef = useRef(false)

    // ── Fetch student profile once ──────────────────────────────────────────
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const res = await fetch(`${BASE_URL}/user-data`, { credentials: "include" })
                const data = await res.json()
                if (res.ok) setUser(data)
            } catch (error) {
                console.error("Fetch error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStudentData()
    }, [])

    // ── Poll trip status + location every 5 seconds ─────────────────────────
    useEffect(() => {
        if (!user?.bus_id) return

        const poll = async () => {
            try {
                // 1. Check if driver has started the trip
                const tripRes = await fetch(
                    `${BASE_URL}/api/trip-status/${user.bus_id}`,
                    { credentials: "include" }
                )
                const tripData = await tripRes.json()
                setTripActive(tripData.active)

                if (!tripData.active) {
                    setTrackingData({ arrivalTime: null, distance: null })
                    return // No need to track if trip not started
                }

                // 2. Get bus location
                const busRes = await fetch(
                    `${BASE_URL}/api/bus-location/${user.bus_id}`,
                    { credentials: "include" }
                )
                if (!busRes.ok) return
                const busData = await busRes.json()

                const bLat = parseFloat(busData.latitude)
                const bLon = parseFloat(busData.longitude)
                if (isNaN(bLat) || isNaN(bLon)) return

                // 3. Get student's GPS
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const sLat = pos.coords.latitude
                    const sLon = pos.coords.longitude
                    const d = haversineKm(sLat, sLon, bLat, bLon)

                    setTrackingData({
                        distance: d.toFixed(1),
                        arrivalTime: Math.round(d * 2.4) // ~25 km/h avg
                    })

                    // 4. Auto-attendance if within 300 m and not yet logged
                    if (d < 0.3 && !attendanceLoggedRef.current) {
                        attendanceLoggedRef.current = true
                        const hour = new Date().getHours()
                        const type = hour < 12 ? "morning" : "evening"
                        const dateStr = new Date().toISOString().split("T")[0]

                        try {
                            const attRes = await fetch(`${BASE_URL}/api/auto-attendance`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ type, dateStr }),
                                credentials: "include"
                            })
                            const attData = await attRes.json()
                            if (!attData.alreadyMarked) {
                                setAutoAttendanceMsg(
                                    `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} attendance auto-logged!`
                                )
                                setTimeout(() => setAutoAttendanceMsg(""), 6000)
                            }
                        } catch (err) {
                            console.error("Auto-attendance failed:", err)
                            attendanceLoggedRef.current = false // allow retry
                        }
                    }
                })
            } catch (e) {
                console.error("Polling error:", e)
            }
        }

        poll() // run immediately
        const interval = setInterval(poll, 5000)
        return () => clearInterval(interval)
    }, [user])

    // ── Loading & error states ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white font-mono">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4 mx-auto" />
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

            {/* Auto-attendance toast */}
            {autoAttendanceMsg && (
                <div className="fixed top-4 left-4 right-4 z-50 bg-green-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-black text-sm">{autoAttendanceMsg}</p>
                        <p className="text-xs text-green-200">You were detected near the bus</p>
                    </div>
                </div>
            )}

            <div className="px-6 pt-2 pb-8 relative">
                {/* Header */}
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
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
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

                    {/* Live / Not Started indicator */}
                    <div className="flex items-center gap-2 mb-2">
                        {tripActive ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                </span>
                                <span className="text-sm font-bold text-green-900">LIVE TRACKING</span>
                            </>
                        ) : (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400" />
                                </span>
                                <span className="text-sm font-bold text-gray-700">TRACKING</span>
                            </>
                        )}
                    </div>

                    {/* ETA or Trip Status Message */}
                    {tripActive ? (
                        <>
                            <p className="text-3xl font-black text-green-900 mt-1">
                                {trackingData.arrivalTime !== null
                                    ? `${trackingData.arrivalTime} mins`
                                    : "Calculating..."}
                            </p>
                            <p className="text-sm text-black/80 font-semibold">
                                {trackingData.distance !== null
                                    ? `${trackingData.distance} km away`
                                    : "Getting your location..."}
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 mt-1 py-2">
                            <span className="text-3xl">🚌</span>
                            <div>
                                <p className="text-xl font-black text-gray-800">Trip not started yet</p>
                                <p className="text-xs text-black/60 font-medium">
                                    Waiting for the driver to begin...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Student Info Grid */}
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
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-50" />
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