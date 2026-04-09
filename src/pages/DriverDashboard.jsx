import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

function DriverDashboard() {
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    // studentsWithAttendance: [{ email, fullName, stop, status }]
    const [studentsWithAttendance, setStudentsWithAttendance] = useState([])
    const [tripStarted, setTripStarted] = useState(false)
    const [lastCoords, setLastCoords] = useState(null)  // shows live coords on screen
    const watchIdRef = useRef(null)

    // --- 1. FETCH ATTENDANCE (refreshes every 10s) ---
    const fetchAttendance = useCallback(async (busNumber) => {
        try {
            const res = await fetch(
                `${BASE_URL}/api/bus-attendance/${busNumber}`,
                { credentials: "include" }
            )
            if (res.ok) {
                const data = await res.json()
                setStudentsWithAttendance(data)
            }
        } catch (err) {
            console.error("Attendance fetch error:", err)
        }
    }, [])

    // --- 2. FETCH DRIVER PROFILE, then attendance ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" })
                if (!userRes.ok) { navigate("/Login"); return }
                const userData = await userRes.json()

                const mappedDriver = {
                    ...userData,
                    fullName: userData.full_name,
                    busNumber: userData.bus_id || userData.bus_number
                }
                setDriver(mappedDriver)
                // fetch attendance straight away
                fetchAttendance(userData.bus_id || userData.bus_number)
            } catch (err) {
                console.error("Dashboard init error:", err)
                navigate("/Login")
            }
        }
        fetchDashboardData()
    }, [navigate, fetchAttendance])

    // Auto-refresh attendance every 10 seconds once driver is loaded
    useEffect(() => {
        if (!driver?.busNumber) return
        const interval = setInterval(() => fetchAttendance(driver.busNumber), 10000)
        return () => clearInterval(interval)
    }, [driver, fetchAttendance])

    // --- 3. GPS TRACKING — every 1 second when trip is active ---
    useEffect(() => {
        if (!tripStarted) {
            // Clear watch if trip ended
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
            return
        }

        if (!("geolocation" in navigator)) return

        watchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLastCoords({ lat: latitude.toFixed(5), lng: longitude.toFixed(5) })

                try {
                    await fetch(`${BASE_URL}/api/update-location`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ latitude, longitude }),
                        credentials: "include"
                    })
                } catch (err) {
                    console.error("Failed to send location:", err)
                }
            },
            (error) => console.error("GPS Error:", error),
            {
                enableHighAccuracy: true,
                maximumAge: 0,      // Always get a fresh GPS fix
                timeout: 1000       // 1-second timeout per reading
            }
        )

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
        }
    }, [tripStarted])

    // --- LOGOUT ---
    const logout = async () => {
        try {
            const res = await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" })
            if (res.ok) window.location.href = "/Login"
        } catch { window.location.href = "/Login" }
    }

    // --- TOGGLE TRIP (Start / End) ---
    const toggleTrip = async () => {
        const newStatus = !tripStarted
        setTripStarted(newStatus)

        // 1. Notify backend of trip status → students see it on their dashboard
        try {
            await fetch(`${BASE_URL}/api/trip-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: newStatus }),
                credentials: "include"
            })
        } catch (err) { console.error("Trip status update failed:", err) }

        // 2. Log trip start/end to reports
        try {
            await fetch(`${BASE_URL}/api/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "trip_status",
                    referenceId: driver?.busNumber,
                    data: { started: newStatus }
                })
            })
        } catch (err) { console.error("Report log failed:", err) }

        if (!newStatus) setLastCoords(null) // clear coords when trip ends
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-400 p-4 pb-24">

            {/* Top bar */}
            <div className="bg-yellow-400 rounded-2xl p-4 shadow-xl mb-4 flex justify-between items-center text-black">
                <div>
                    <h1 className="text-xl font-bold">Bus {driver?.busNumber || "..."} Driver</h1>
                    <p className="text-sm font-medium">
                        {driver?.fullName || "Loading..."}
                    </p>
                </div>
                <button onClick={logout} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
                    Logout
                </button>
            </div>

            {/* GPS Broadcasting Indicator */}
            {tripStarted && (
                <div className="bg-green-900/80 border border-green-400/30 rounded-2xl p-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                        </span>
                        <div>
                            <p className="text-green-400 text-xs font-black uppercase tracking-widest">
                                Broadcasting Live GPS
                            </p>
                            {lastCoords && (
                                <p className="text-green-300/70 text-[10px] font-mono mt-0.5">
                                    {lastCoords.lat}, {lastCoords.lng}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">
                        1s
                    </span>
                </div>
            )}

            {/* Emergency Button */}
            <div className="bg-white rounded-2xl p-4 shadow-lg mb-4 text-black">
                <button
                    onClick={() => alert("Calling Transport Management...")}
                    className="w-full bg-yellow-400 py-3 rounded-xl font-bold hover:scale-105 transition"
                >
                    🚨 Emergency Call
                </button>
            </div>

            {/* Students List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1 mb-1">
                    <p className="text-white/50 text-xs uppercase tracking-widest font-bold">
                        Students on Bus {driver?.busNumber}
                    </p>
                    <p className="text-white/40 text-xs">
                        ✅ {studentsWithAttendance.filter(s => s.status === "present").length}
                        / {studentsWithAttendance.length} present
                    </p>
                </div>

                {studentsWithAttendance.map((student) => (
                    <div
                        key={student.email}
                        className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center text-black"
                    >
                        <div>
                            <h2 className="font-bold">{student.fullName}</h2>
                            <p className="text-sm text-gray-500 text-xs">{student.email}</p>
                        </div>
                        <div>
                            {student.status === "present" ? (
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">✅ Present</span>
                            ) : (
                                <span className="bg-red-400 text-white px-3 py-1 rounded-full text-xs font-bold">❌ Absent</span>
                            )}
                        </div>
                    </div>
                ))}

                {studentsWithAttendance.length === 0 && (
                    <p className="text-white text-center opacity-40 mt-10 text-sm">
                        No students assigned to this bus.
                    </p>
                )}
            </div>

            {/* Start / End Trip Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 rounded-t-3xl shadow-xl z-20">
                <button
                    onClick={toggleTrip}
                    className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all shadow-lg active:scale-95 ${
                        tripStarted ? "bg-red-600" : "bg-green-600"
                    }`}
                >
                    {tripStarted ? "🛑 END TRIP" : "🚌 START TRIP"}
                </button>
            </div>
        </div>
    )
}

export default DriverDashboard