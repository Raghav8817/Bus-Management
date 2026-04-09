import { useState, useEffect, useRef, useCallback } from "react"
import { Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import BottomNav from "./BottomNav"

// ─── Fix Leaflet default icon broken in Vite/Webpack ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const busIcon = L.divIcon({
    className: "",
    html: `
    <div style="
      width:44px; height:44px;
      background:#facc15;
      border-radius:50%;
      border:3px solid #1a1a2e;
      display:flex; align-items:center; justify-content:center;
      font-size:22px;
      box-shadow:0 4px 15px rgba(250,204,21,0.6);
    ">🚌</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
})

const studentIcon = L.divIcon({
    className: "",
    html: `
    <div style="
      width:40px; height:40px;
      background:#22c55e;
      border-radius:50%;
      border:3px solid white;
      display:flex; align-items:center; justify-content:center;
      font-size:20px;
      box-shadow:0 4px 15px rgba(34,197,94,0.6);
    ">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
})

// ─── Helper: auto-fit map bounds when positions change ────────────────────────
function FitBounds({ busPos, studentPos }) {
    const map = useMap()
    useEffect(() => {
        if (busPos && studentPos) {
            const bounds = L.latLngBounds([busPos, studentPos])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (busPos) {
            map.setView(busPos, 15)
        } else if (studentPos) {
            map.setView(studentPos, 15)
        }
    }, [busPos, studentPos, map])
    return null
}

// ─── Locate Me button (inside map so it can use useMap) ───────────────────────
function LocateMeButton({ studentPos, busPos }) {
    const map = useMap()
    const [locating, setLocating] = useState(false)

    const goToMyLocation = () => {
        setLocating(true)
        if (studentPos) {
            map.flyTo([studentPos.lat, studentPos.lng], 17, { duration: 1 })
            setTimeout(() => setLocating(false), 1200)
        } else {
            // No cached position — get fresh GPS
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    map.flyTo([pos.coords.latitude, pos.coords.longitude], 17, { duration: 1 })
                    setTimeout(() => setLocating(false), 1200)
                },
                () => setLocating(false)
            )
        }
    }

    const fitBoth = () => {
        if (busPos && studentPos) {
            const bounds = L.latLngBounds([busPos, studentPos])
            map.fitBounds(bounds, { padding: [60, 60], duration: 0.8 })
        }
    }

    return (
        <div style={{
            position: "absolute",
            bottom: "16px",
            right: "12px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        }}>
            {/* Locate Me */}
            <button
                onClick={goToMyLocation}
                title="Go to my location"
                style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: locating ? "#16a34a" : "#22c55e",
                    border: "3px solid white",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                }}
            >
                {locating ? "⏳" : "📍"}
            </button>

            {/* Fit Both */}
            {busPos && studentPos && (
                <button
                    onClick={fitBoth}
                    title="Show bus and me"
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#facc15",
                        border: "3px solid #1a1a1a",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    🚌
                </button>
            )}
        </div>
    )
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function LiveTracking() {
    const navigate = useNavigate()

    const [busPos, setBusPos]         = useState(null)   // { lat, lng }
    const [studentPos, setStudentPos] = useState(null)
    const [busDetails, setBusDetails] = useState({ bus_id: "", full_name: "", contact_number: "" })
    const [distance, setDistance]     = useState("Calculating…")
    const [eta, setEta]               = useState("…")
    const [lastUpdated, setLastUpdated] = useState(null)

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

    // ── Fetch data ──────────────────────────────────────────────────────────
    const fetchTrackingData = useCallback(async () => {
        try {
            const userRes = await fetch(`${BASE_URL}/user-data`, { credentials: "include" })
            if (!userRes.ok) return
            const userData = await userRes.json()
            if (!userData.bus_id) return

            const busRes = await fetch(`${BASE_URL}/api/bus-location/${userData.bus_id}`, {
                credentials: "include",
            })
            if (!busRes.ok) return
            const busData = await busRes.json()
            setBusDetails(busData)

            const bLat = parseFloat(busData.latitude)
            const bLon = parseFloat(busData.longitude)
            if (!isNaN(bLat) && !isNaN(bLon)) {
                setBusPos({ lat: bLat, lng: bLon })
            }

            // Student GPS
            navigator.geolocation.getCurrentPosition((pos) => {
                const sLat = pos.coords.latitude
                const sLon = pos.coords.longitude
                setStudentPos({ lat: sLat, lng: sLon })

                if (!isNaN(bLat) && !isNaN(bLon)) {
                    const d = haversineKm(sLat, sLon, bLat, bLon)
                    setDistance(d.toFixed(1))
                    setEta(Math.round(d * 2.4))
                }
            })

            setLastUpdated(new Date())
        } catch (err) {
            console.error("Tracking error:", err)
        }
    }, [BASE_URL])

    useEffect(() => {
        fetchTrackingData()
        const id = setInterval(fetchTrackingData, 15000)
        return () => clearInterval(id)
    }, [fetchTrackingData])

    // ── Polyline path ───────────────────────────────────────────────────────
    const polylinePath =
        busPos && studentPos
            ? [
                  [busPos.lat, busPos.lng],
                  [studentPos.lat, studentPos.lng],
              ]
            : []

    // default center (India) until we get real coords
    const defaultCenter = [20.5937, 78.9629]

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-black pb-24">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="px-5 pt-5 pb-3">
                <h1 className="text-2xl font-black text-black tracking-tight">
                    🗺️ Live Tracking
                </h1>
                <p className="text-black/70 text-sm font-medium">
                    {lastUpdated
                        ? `Updated: ${lastUpdated.toLocaleTimeString()}`
                        : "Fetching location…"}
                </p>
            </div>

            {/* ── Map ────────────────────────────────────────────────────── */}
            <div
                className="mx-4 rounded-3xl overflow-hidden shadow-2xl border-2 border-yellow-300/40"
                style={{ height: "46vh" }}
            >
                <MapContainer
                    center={busPos ? [busPos.lat, busPos.lng] : defaultCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                    attributionControl={false}
                >
                    {/* Dark OpenStreetMap tile */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />

                    {/* Auto-fit bounds */}
                    <FitBounds busPos={busPos} studentPos={studentPos} />

                    {/* Bus Marker */}
                    {busPos && (
                        <Marker position={[busPos.lat, busPos.lng]} icon={busIcon}>
                            <Popup>
                                <div className="text-center font-bold text-sm">
                                    🚌 Bus {busDetails.bus_id || "—"}
                                    <br />
                                    <span className="font-normal text-gray-600 text-xs">
                                        Driver: {busDetails.full_name || "—"}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Student Marker */}
                    {studentPos && (
                        <Marker position={[studentPos.lat, studentPos.lng]} icon={studentIcon}>
                            <Popup>
                                <div className="font-bold text-sm text-center">
                                    📍 Your Location
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Dashed yellow line */}
                    {polylinePath.length === 2 && (
                        <Polyline
                            positions={polylinePath}
                            pathOptions={{
                                color: "#facc15",
                                weight: 3,
                                dashArray: "8 8",
                                opacity: 0.85,
                            }}
                        />
                    )}
                    {/* 📍 Locate Me + 🚌 Fit Both overlay buttons */}
                    <LocateMeButton studentPos={studentPos} busPos={busPos} />

                </MapContainer>
            </div>

            {/* ── Live badge ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mx-4 mt-3 mb-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <span className="text-xs font-black text-green-400 uppercase tracking-widest">
                        Live
                    </span>
                </div>
                <span className="text-xs text-gray-400">Auto-refresh: 15s</span>
            </div>

            {/* ── Status cards ───────────────────────────────────────────── */}
            <div className="mx-4 bg-zinc-900 text-white rounded-3xl p-5 mb-3 shadow-xl border border-white/5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                            Current Status
                        </p>
                        <p className="text-2xl font-bold">
                            Bus {busDetails.bus_id || "…"}
                        </p>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        LIVE
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Distance</p>
                        <p className="font-black text-green-400 text-lg">{distance} km</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">ETA</p>
                        <p className="font-black text-yellow-400 text-lg">{eta} min</p>
                    </div>
                </div>
            </div>

            {/* ── Driver Info ────────────────────────────────────────────── */}
            <div className="mx-4 bg-white/10 backdrop-blur-md text-white rounded-2xl p-4 flex justify-between items-center border border-white/10 mb-4">
                <div>
                    <p className="font-bold">{busDetails.full_name || "Assigning…"}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Driver Contact
                    </p>
                </div>
                <button
                    onClick={() => (window.location.href = `tel:${busDetails.contact_number}`)}
                    className="bg-yellow-400 p-3 rounded-full text-black hover:scale-110 active:scale-95 transition shadow-lg"
                >
                    <Phone size={20} />
                </button>
            </div>

            <button
                onClick={() => navigate("/")}
                className="mx-4 w-[calc(100%-2rem)] bg-white/5 text-white py-4 rounded-2xl font-bold border border-white/10 active:bg-white/10 transition"
            >
                ← Back to Dashboard
            </button>

            <BottomNav />
        </div>
    )
}