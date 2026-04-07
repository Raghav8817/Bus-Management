import { useState, useEffect } from "react"
import { Phone, MapPin } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import BottomNav from "./BottomNav"

function LiveTracking() {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const routeType = queryParams.get("type")
    const navigate = useNavigate()

    const [distance, setDistance] = useState("Calculating...")
    const [arrivalTime, setArrivalTime] = useState("...")
    const [busDetails, setBusDetails] = useState({ bus_id: "", full_name: "", contact_number: "" })

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // --- Helper: Calculate Distance between two GPS points in KM ---
    const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Student User Data (to find their assigned bus_id)
                const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" });
                const userData = await userRes.json();

                if (userRes.ok && userData.bus_id) {
                    // 2. Get the Driver/Bus location from DB
                    const busRes = await fetch(`${BASE_URL}/api/bus-location/${userData.bus_id}`, { credentials: "include" });
                    const busData = await busRes.json();
                    setBusDetails(busData);

                    // 3. Get Student's Current GPS
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const sLat = pos.coords.latitude;
                        const sLon = pos.coords.longitude;
                        const bLat = busData.latitude;
                        const bLon = busData.longitude;

                        if (bLat && bLon) {
                            const d = getHaversineDistance(sLat, sLon, bLat, bLon);
                            setDistance(d.toFixed(1));
                            // Assume average speed of 25km/h -> ~2.4 mins per km
                            setArrivalTime(Math.round(d * 2.4));
                        }
                    });
                }
            } catch (err) {
                console.error("Tracking Error:", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, [BASE_URL]);

    const handleCall = () => {
        window.location.href = `tel:${busDetails.contact_number}`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black p-4 pb-24">
            <h1 className="text-2xl font-bold mb-4 text-black">Live Tracking</h1>

            {/* SIMULATED MAP REPLACEMENT */}
            <div className="h-[45vh] bg-zinc-800 rounded-3xl mb-4 flex flex-col items-center justify-center text-white p-6 shadow-2xl border border-white/10">
                <MapPin size={60} className="text-yellow-400 animate-bounce mb-4" />
                <p className="text-center font-medium">GPS Signal Active</p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    Bus Coordinates: {busDetails.latitude || "0.0"}, {busDetails.longitude || "0.0"}
                </p>
            </div>

            {/* STATUS BOX */}
            <div className="bg-zinc-900 text-white rounded-3xl p-6 mb-4 shadow-xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">Current Status</p>
                        <p className="text-2xl font-bold">Bus {busDetails.bus_id || "..."}</p>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        LIVE
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Distance</span>
                        <span className="font-bold text-green-400">{distance} km away</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Arrival</span>
                        <span className="font-bold">{arrivalTime} mins</span>
                    </div>
                </div>
            </div>

            {/* DRIVER INFO */}
            <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl p-4 flex justify-between items-center border border-white/10">
                <div>
                    <p className="font-bold">{busDetails.full_name || "Assigning..."}</p>
                    <p className="text-xs text-gray-400 uppercase">Driver Contact</p>
                </div>
                <button
                    onClick={handleCall}
                    className="bg-yellow-400 p-3 rounded-full text-black hover:scale-110 transition"
                >
                    <Phone size={20} />
                </button>
            </div>

            <button onClick={() => navigate("/home")} className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold mt-6 border border-white/10">
                Back to Dashboard
            </button>

            <BottomNav />
        </div>
    )
}

export default LiveTracking;